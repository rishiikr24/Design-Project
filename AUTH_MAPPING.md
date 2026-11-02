# AUTH MAPPING: SAP BTP XSUAA to Supabase Auth & RLS

> **Project:** Enterprise SaaS Transformation Platform (Design Project-I, E1ITA306)  
> **Source Specification:** `legacy-sap/xs-security.json`  
> **Target Security Model:** Supabase Auth (`auth.users`) + PostgreSQL Row-Level Security (RLS) + `public.profiles`

---

## 1. Executive Summary

In the legacy SAP Cloud Application Programming (CAP) architecture, identity and access control was managed via the SAP BTP XSUAA service defined in `xs-security.json`. This model specified:
1. **Four Scopes** representing discrete functional permissions (`Admin`, `Manager`, `Analyst`, `Viewer`).
2. **One Attribute** (`company`) binding users to their respective enterprise tenant.
3. **Role Templates & Role Collections** bundling scopes into assigned personas.

In the modernized Supabase architecture, this maps 1:1 to:
- Supabase **`auth.users`** (Authentication & session lifecycle).
- **`public.profiles`** table storing the authorized role and company binding.
- PostgreSQL **Row-Level Security (RLS)** providing non-bypassable, kernel-level enforcement on all tables.
- Frontend role-aware UI navigation and permission guards (`ProtectedRoute.jsx`).

---

## 2. Direct Scopes & Roles Mapping

| SAP BTP Scope (`xs-security.json`) | SAP Description | Supabase Role (`public.profiles.role`) | Database Permissions (RLS) | Frontend UI Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **`$XSAPPNAME.Admin`** | Platform owner: Manage catalog, risk templates, companies, and users | `admin` | Full CRUD on `saas_products`, `risk_templates`, `companies`, and `profiles`. Read-write on all company data. | Add/edit SaaS catalog, manage risk templates, switch company view, manage users. |
| **`$XSAPPNAME.Manager`** | Enterprise IT Lead: Run assessments, set criteria weights, approve plans, view dashboard | `manager` | Read catalog & templates. Full CRUD on assessments, legacy apps, requirements, weights, and evaluations. Full CRUD on `migration_plans` and `migration_phases`. Write to `assessed_risks`. Scoped to `company_id`. | Create/edit assessments, configure criteria weights, approve roadmaps, edit phase progress, elevate risks. |
| **`$XSAPPNAME.Analyst`** | Enterprise Analyst: Enter assessment data, run evaluations and risk analysis | `analyst` | Read catalog & templates. Create/edit `assessments`, `legacy_applications`, `requirements`, and `evaluations`. Read-only on `migration_plans`. Scoped to `company_id`. | Enter assessment inputs, benchmark legacy systems, run MCDA scoring simulator, trigger risk matrix analysis. |
| **`$XSAPPNAME.Viewer`** | Executive Stakeholder: Read-only access to recommendations, risks, and roadmap | `viewer` | Read-only (`SELECT`) on own company's `assessments`, `evaluations`, `evaluation_results`, `assessed_risks`, `migration_plans`, and `migration_phases`. Read catalog. | View-only executive dashboard, read recommendation scores, review risks and Gantt timeline. Cannot edit or submit data. |

---

## 3. Multi-Tenant Scoping (`company` attribute)

In `xs-security.json`, the attribute `company` was defined as:
```json
{
  "name": "company",
  "description": "Company ID for multi-tenant data scoping",
  "valueType": "string"
}
```

In Supabase, multi-tenancy is enforced through the user's bound `company_id`:
1. Every user profile has a `company_id` foreign key referencing `public.companies(id)`.
2. A helper function `public.get_auth_company_id()` resolves the current user's company context:
   ```sql
   CREATE OR REPLACE FUNCTION public.get_auth_company_id()
   RETURNS TEXT AS $$
       SELECT COALESCE(
           (SELECT company_id FROM public.profiles WHERE id = auth.uid()),
           (auth.jwt() ->> 'user_metadata')::jsonb ->> 'company_id'
       );
   $$ LANGUAGE sql STABLE SECURITY DEFINER;
   ```
3. Every company-specific table (`assessments`, `legacy_applications`, `migration_plans`, `assessed_risks`, etc.) applies RLS filtering:
   ```sql
   CREATE POLICY "assessments_isolation_policy"
   ON public.assessments
   FOR ALL
   TO authenticated
   USING (
       company_id = public.get_auth_company_id()
       OR public.is_admin()
   );
   ```

---

## 4. Default Role & Signup Security Guard

To prevent privilege escalation during user registration:
- **Default Role:** All new signups automatically receive `role = 'viewer'`.
- **Trigger Security:** The `handle_new_user()` trigger on `auth.users` ignores any user-supplied `role` parameter unless assigned by an existing administrator.
- **Elevation:** Only an existing `Admin` or the Supabase Dashboard administrator can elevate a user from `viewer` to `analyst`, `manager`, or `admin`.

---

## 5. SQL Test Verification Matrix

Automated verification tests are maintained in `supabase/tests/rls_tests.sql` covering:
1. **Admin Access:** Can insert new SaaS catalog products; can view across companies.
2. **Manager Access:** Can create/update migration plans; cannot modify catalog products.
3. **Analyst Access:** Can insert assessments and run evaluations; cannot modify migration plans or approved roadmaps.
4. **Viewer Access:** Can read assessments and results; cannot perform INSERT/UPDATE/DELETE on any entity.
5. **Cross-Tenant Isolation:** User from `comp-apex-global` receives 0 rows when querying `comp-novasystems` data.
6. **Anonymous Access:** Denied on all non-catalog entities.
