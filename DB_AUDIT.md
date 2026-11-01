# Database Audit & Supabase Postgres Mapping: Enterprise SaaS Transformation Platform

> **Project:** Enterprise SaaS Transformation Platform (Design Project-I, E1ITA306)  
> **Source Definitions:** `db/schema.cds`, `db/views.cds`, `db/data/*.csv`  
> **Target Database:** PostgreSQL 15+ / Supabase  
> **Status:** Step B1 Complete — Schema, Migrations, and Seed Scripts Created  
> **CLI Verification Status:** **Not Verified** *(Supabase CLI / Docker daemon not present on host environment)*

---

## 1. Executive Summary & Database Architecture

The data tier of the platform is defined using SAP Core Data Services (CDS). It comprises:
- **15 Core Relational Entities** covering enterprise profiling, legacy application inventory, SaaS product catalog, multi-criteria evaluations, rule-based risk templates and assessed risks, transformation roadmaps, and assistant conversation threads.
- **2 Core Views** (`TransformationOverview` and `RiskDistribution`) delivering aggregated executive telemetry and risk breakdowns.
- **4 Baseline Seed Datasets** (`Companies`, `UserProfiles`, `RiskTemplates`, `SaaSProducts`) providing real benchmark products and risk rules.

### Target PostgreSQL & Supabase Strategy
1. **Aspect Mapping (`cuid` & `managed`):**
   - In SAP CDS, `cuid` generates an `ID : UUID` (or String(36)). However, the existing seed data uses readable slug IDs (e.g., `comp-apex-global`, `usr-rishi`, `risk-data-loss`, `salesforce-crm`). In PostgreSQL, primary keys are typed as `TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text`, which seamlessly supports both UUID generation for new dynamic records and legacy readable string IDs.
   - The CDS `managed` aspect (`createdAt`, `createdBy`, `modifiedAt`, `modifiedBy`) is mapped to PostgreSQL standard audit fields:
     - `created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()`
     - `created_by TEXT DEFAULT 'system'`
     - `modified_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()`
     - `modified_by TEXT DEFAULT 'system'`
     - A PostgreSQL trigger (`update_modified_at_column`) automatically updates `modified_at` on every `UPDATE`.
2. **Referential Integrity & Cascading:**
   - CDS `Composition of many/one` maps directly to `FOREIGN KEY ... ON DELETE CASCADE`.
   - CDS `Association to` maps to `FOREIGN KEY ... ON DELETE SET NULL` or `CASCADE` depending on domain cardinality.
3. **Naming Convention:**
   - PascalCase CDS entities (e.g., `SaaSProducts`, `UserProfiles`) are mapped to canonical PostgreSQL lowercase `snake_case` tables (`saas_products`, `user_profiles`).
   - CamelCase attributes (e.g., `itBudget`, `toeTechScore`) are mapped to `snake_case` columns (`it_budget`, `toe_tech_score`).

---

## 2. Comprehensive Entity-to-Postgres Mapping Table

| CDS Entity (`db/schema.cds`) | Target Postgres Table | Primary Key | Key Foreign Keys & Associations | Check Constraints / Enums |
| :--- | :--- | :--- | :--- | :--- |
| `Companies` | `companies` | `id` (TEXT) | None (Root parent) | `employees >= 0`, `it_budget >= 0` |
| `UserProfiles` | `user_profiles` | `id` (TEXT) | `company_id -> companies(id)` ON DELETE CASCADE | `role IN ('Admin', 'Manager', 'Analyst', 'Viewer')` |
| `Assessments` | `assessments` | `id` (TEXT) | `company_id -> companies(id)` ON DELETE CASCADE | `infrastructure`, `data_sensitivity`, `status`, `target_category`, `readiness_score BETWEEN 0 AND 100` |
| `LegacyApplications` | `legacy_applications` | `id` (TEXT) | `assessment_id -> assessments(id)` ON DELETE CASCADE | `criticality IN ('Critical', 'High', 'Medium', 'Low')`, `user_count >= 0`, `years_in_use >= 0` |
| `Requirements` | `requirements` | `id` (TEXT) | `assessment_id -> assessments(id)` ON DELETE CASCADE | `priority IN ('Must Have', 'Nice to Have', 'Optional')` |
| `SaaSProducts` | `saas_products` | `id` (VARCHAR(50)) | None (Reference catalog) | `category IN ('CRM', 'ERP', 'HCM', 'ITSM', 'Productivity', 'Analytics', 'Identity')`, scores $0\text{--}100$, `cost_level`, `migration_complexity` |
| `ProductCapabilities` | `product_capabilities` | `id` (TEXT) | `product_id -> saas_products(id)` ON DELETE CASCADE | None |
| `Evaluations` | `evaluations` | `id` (TEXT) | `assessment_id -> assessments(id)` ON DELETE CASCADE | None |
| `CriteriaWeights` | `criteria_weights` | `id` (TEXT) | `evaluation_id -> evaluations(id)` ON DELETE CASCADE (UNIQUE) | `cost_weight >= 0`, `security_weight >= 0`, `scalability_weight >= 0`, `integration_weight >= 0`, `features_weight >= 0` |
| `EvaluationResults` | `evaluation_results` | `id` (TEXT) | `evaluation_id -> evaluations(id)` ON DELETE CASCADE, `product_id -> saas_products(id)` ON DELETE CASCADE | `rank >= 1` |
| `RiskTemplates` | `risk_templates` | `id` (VARCHAR(50)) | None (Reference catalog) | `base_probability BETWEEN 1 AND 5`, `base_impact BETWEEN 1 AND 5` |
| `AssessedRisks` | `assessed_risks` | `id` (TEXT) | `assessment_id -> assessments(id)` ON DELETE CASCADE, `template_id -> risk_templates(id)` ON DELETE SET NULL | `probability BETWEEN 1 AND 5`, `impact BETWEEN 1 AND 5`, `score BETWEEN 1 AND 25`, `severity IN ('Low', 'Medium', 'High', 'Critical')` |
| `MigrationPlans` | `migration_plans` | `id` (TEXT) | `assessment_id -> assessments(id)` ON DELETE CASCADE, `selected_product_id -> saas_products(id)` ON DELETE SET NULL | `total_phases > 0`, `overall_progress BETWEEN 0 AND 100`, `estimated_duration_months > 0` |
| `MigrationPhases` | `migration_phases` | `id` (TEXT) | `plan_id -> migration_plans(id)` ON DELETE CASCADE | `sequence BETWEEN 1 AND 8`, `progress BETWEEN 0 AND 100`, `status IN ('Not Started', 'In Progress', 'Completed', 'Blocked')` |
| `AssistantMessages` | `assistant_messages` | `id` (TEXT) | `assessment_id -> assessments(id)` ON DELETE CASCADE | `sender IN ('user', 'assistant')` |

---

## 3. Detailed Entity Column Specifications

### 3.1 `companies`
- `id`: `TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text`
- `created_at`, `created_by`, `modified_at`, `modified_by`: Audit columns
- `name`: `VARCHAR(100) NOT NULL`
- `industry`: `VARCHAR(50)`
- `employees`: `INTEGER CHECK (employees >= 0)`
- `it_budget`: `NUMERIC(15, 2) CHECK (it_budget >= 0)`
- `region`: `VARCHAR(50)`

### 3.2 `user_profiles`
- `id`: `TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text`
- `username`: `VARCHAR(50) NOT NULL UNIQUE`
- `full_name`: `VARCHAR(100) NOT NULL`
- `email`: `VARCHAR(100) NOT NULL UNIQUE`
- `role`: `VARCHAR(20) NOT NULL CHECK (role IN ('Admin', 'Manager', 'Analyst', 'Viewer'))`
- `company_id`: `TEXT REFERENCES companies(id) ON DELETE CASCADE`

### 3.3 `assessments`
- `id`: `TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text`
- `title`: `VARCHAR(150) NOT NULL`
- `company_id`: `TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE`
- `infrastructure`: `VARCHAR(50) CHECK (infrastructure IN ('On-premise', 'Hybrid', 'Colocated', 'Private Cloud', 'Public Cloud'))`
- `growth_rate`: `NUMERIC(5, 2) DEFAULT 0.0`
- `data_sensitivity`: `VARCHAR(20) CHECK (data_sensitivity IN ('Low', 'Medium', 'High'))`
- `pain_points`: `TEXT`
- `target_category`: `VARCHAR(50) CHECK (target_category IN ('CRM', 'ERP', 'HCM', 'ITSM', 'Productivity', 'Analytics', 'Identity', 'All'))`
- `readiness_score`: `NUMERIC(5, 2) DEFAULT 0.0 CHECK (readiness_score BETWEEN 0 AND 100)`
- `toe_tech_score`: `NUMERIC(5, 2) DEFAULT 0.0 CHECK (toe_tech_score BETWEEN 0 AND 100)`
- `toe_org_score`: `NUMERIC(5, 2) DEFAULT 0.0 CHECK (toe_org_score BETWEEN 0 AND 100)`
- `toe_env_score`: `NUMERIC(5, 2) DEFAULT 0.0 CHECK (toe_env_score BETWEEN 0 AND 100)`
- `status`: `VARCHAR(20) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'In Progress', 'Completed', 'Approved'))`

### 3.4 `legacy_applications`
- `id`: `TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text`
- `assessment_id`: `TEXT NOT NULL REFERENCES assessments(id) ON DELETE CASCADE`
- `name`: `VARCHAR(100) NOT NULL`
- `function`: `VARCHAR(100)`
- `hosting`: `VARCHAR(50)`
- `criticality`: `VARCHAR(20) NOT NULL DEFAULT 'Medium' CHECK (criticality IN ('Critical', 'High', 'Medium', 'Low'))`
- `user_count`: `INTEGER DEFAULT 0 CHECK (user_count >= 0)`
- `years_in_use`: `INTEGER DEFAULT 0 CHECK (years_in_use >= 0)`

### 3.5 `requirements`
- `id`: `TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text`
- `assessment_id`: `TEXT NOT NULL REFERENCES assessments(id) ON DELETE CASCADE`
- `category`: `VARCHAR(50)`
- `description`: `VARCHAR(255) NOT NULL`
- `priority`: `VARCHAR(20) NOT NULL DEFAULT 'Must Have' CHECK (priority IN ('Must Have', 'Nice to Have', 'Optional'))`

### 3.6 `saas_products`
- `id`: `VARCHAR(50) PRIMARY KEY`
- `name`: `VARCHAR(100) NOT NULL`
- `vendor`: `VARCHAR(100) NOT NULL`
- `category`: `VARCHAR(50) NOT NULL CHECK (category IN ('CRM', 'ERP', 'HCM', 'ITSM', 'Productivity', 'Analytics', 'Identity'))`
- `business_function`: `VARCHAR(150)`
- `pricing_model`: `VARCHAR(50)`
- `cost_level`: `VARCHAR(20) CHECK (cost_level IN ('Low', 'Medium', 'High'))`
- `cost_score`: `NUMERIC(5, 2) CHECK (cost_score BETWEEN 0 AND 100)`
- `scalability_rating`: `VARCHAR(20) CHECK (scalability_rating IN ('High', 'Very High', 'Enterprise'))`
- `scalability_score`: `NUMERIC(5, 2) CHECK (scalability_score BETWEEN 0 AND 100)`
- `security_rating`: `VARCHAR(100)`
- `security_score`: `NUMERIC(5, 2) CHECK (security_score BETWEEN 0 AND 100)`
- `integration_capability`: `VARCHAR(100)`
- `integration_score`: `NUMERIC(5, 2) CHECK (integration_score BETWEEN 0 AND 100)`
- `features_score`: `NUMERIC(5, 2) CHECK (features_score BETWEEN 0 AND 100)`
- `deployment_type`: `VARCHAR(50)`
- `target_organisation`: `VARCHAR(50)`
- `migration_complexity`: `VARCHAR(20) CHECK (migration_complexity IN ('Low', 'Medium', 'High'))`
- `api_available`: `BOOLEAN DEFAULT true`
- `status`: `VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Retired'))`
- `description`: `TEXT`

### 3.7 `product_capabilities`
- `id`: `TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text`
- `product_id`: `VARCHAR(50) NOT NULL REFERENCES saas_products(id) ON DELETE CASCADE`
- `capability_name`: `VARCHAR(100) NOT NULL`
- `capability_description`: `VARCHAR(255)`
- `maturity`: `VARCHAR(20)`

### 3.8 `evaluations`
- `id`: `TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text`
- `assessment_id`: `TEXT NOT NULL REFERENCES assessments(id) ON DELETE CASCADE`
- `evaluation_date`: `TIMESTAMPTZ DEFAULT clock_timestamp()`
- `status`: `VARCHAR(20) DEFAULT 'Draft'`

### 3.9 `criteria_weights`
- `id`: `TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text`
- `evaluation_id`: `TEXT NOT NULL UNIQUE REFERENCES evaluations(id) ON DELETE CASCADE`
- `cost_weight`: `NUMERIC(5, 2) DEFAULT 20.0 CHECK (cost_weight >= 0)`
- `security_weight`: `NUMERIC(5, 2) DEFAULT 30.0 CHECK (security_weight >= 0)`
- `scalability_weight`: `NUMERIC(5, 2) DEFAULT 25.0 CHECK (scalability_weight >= 0)`
- `integration_weight`: `NUMERIC(5, 2) DEFAULT 15.0 CHECK (integration_weight >= 0)`
- `features_weight`: `NUMERIC(5, 2) DEFAULT 10.0 CHECK (features_weight >= 0)`

### 3.10 `evaluation_results`
- `id`: `TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text`
- `evaluation_id`: `TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE`
- `product_id`: `VARCHAR(50) NOT NULL REFERENCES saas_products(id) ON DELETE CASCADE`
- `total_score`: `NUMERIC(5, 2) NOT NULL`
- `cost_sub_score`: `NUMERIC(5, 2) NOT NULL`
- `security_sub_score`: `NUMERIC(5, 2) NOT NULL`
- `scalability_sub_score`: `NUMERIC(5, 2) NOT NULL`
- `integration_sub_score`: `NUMERIC(5, 2) NOT NULL`
- `features_sub_score`: `NUMERIC(5, 2) NOT NULL`
- `rank`: `INTEGER NOT NULL`
- `reason`: `TEXT`

### 3.11 `risk_templates`
- `id`: `VARCHAR(50) PRIMARY KEY`
- `category`: `VARCHAR(50) NOT NULL`
- `risk_title`: `VARCHAR(150) NOT NULL`
- `description`: `TEXT`
- `base_probability`: `INTEGER NOT NULL CHECK (base_probability BETWEEN 1 AND 5)`
- `base_impact`: `INTEGER NOT NULL CHECK (base_impact BETWEEN 1 AND 5)`
- `default_mitigation`: `TEXT`

### 3.12 `assessed_risks`
- `id`: `TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text`
- `assessment_id`: `TEXT NOT NULL REFERENCES assessments(id) ON DELETE CASCADE`
- `template_id`: `VARCHAR(50) REFERENCES risk_templates(id) ON DELETE SET NULL`
- `risk_title`: `VARCHAR(150) NOT NULL`
- `category`: `VARCHAR(50) NOT NULL`
- `probability`: `INTEGER NOT NULL CHECK (probability BETWEEN 1 AND 5)`
- `impact`: `INTEGER NOT NULL CHECK (impact BETWEEN 1 AND 5)`
- `score`: `INTEGER NOT NULL CHECK (score BETWEEN 1 AND 25)`
- `severity`: `VARCHAR(20) NOT NULL CHECK (severity IN ('Low', 'Medium', 'High', 'Critical'))`
- `mitigation`: `TEXT`
- `adjusted_reason`: `TEXT`

### 3.13 `migration_plans`
- `id`: `TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text`
- `assessment_id`: `TEXT NOT NULL REFERENCES assessments(id) ON DELETE CASCADE`
- `selected_product_id`: `VARCHAR(50) REFERENCES saas_products(id) ON DELETE SET NULL`
- `title`: `VARCHAR(150) NOT NULL`
- `total_phases`: `INTEGER DEFAULT 8 CHECK (total_phases > 0)`
- `overall_progress`: `NUMERIC(5, 2) DEFAULT 0.0 CHECK (overall_progress BETWEEN 0 AND 100)`
- `start_date`: `DATE`
- `target_end_date`: `DATE`
- `estimated_duration_months`: `INTEGER DEFAULT 12 CHECK (estimated_duration_months > 0)`

### 3.14 `migration_phases`
- `id`: `TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text`
- `plan_id`: `TEXT NOT NULL REFERENCES migration_plans(id) ON DELETE CASCADE`
- `sequence`: `INTEGER NOT NULL CHECK (sequence BETWEEN 1 AND 8)`
- `name`: `VARCHAR(100) NOT NULL`
- `status`: `VARCHAR(20) NOT NULL DEFAULT 'Not Started' CHECK (status IN ('Not Started', 'In Progress', 'Completed', 'Blocked'))`
- `progress`: `INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100)`
- `start_date`: `DATE`
- `end_date`: `DATE`
- `deliverables`: `TEXT`
- `notes`: `TEXT`
- `risk_mitigation_focus`: `TEXT`

### 3.15 `assistant_messages`
- `id`: `TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text`
- `assessment_id`: `TEXT NOT NULL REFERENCES assessments(id) ON DELETE CASCADE`
- `sender`: `VARCHAR(20) NOT NULL CHECK (sender IN ('user', 'assistant'))`
- `message_text`: `TEXT NOT NULL`
- `timestamp`: `TIMESTAMPTZ DEFAULT clock_timestamp()`

---

## 4. Views Mapping (`db/views.cds` to Postgres)

### 4.1 View: `TransformationOverview` $\rightarrow$ `transformation_overview`
Aggregates assessment status with company details, readiness scores, count of legacy applications, and total assessed risks:
```sql
CREATE OR REPLACE VIEW transformation_overview AS
SELECT 
    a.id AS assessment_id,
    a.title AS assessment_title,
    c.id AS company_id,
    c.name AS company_name,
    a.infrastructure,
    a.readiness_score,
    a.toe_tech_score,
    a.toe_org_score,
    a.toe_env_score,
    a.status AS assessment_status,
    COUNT(DISTINCT l.id)::INTEGER AS legacy_app_count,
    COUNT(DISTINCT r.id)::INTEGER AS risk_count
FROM assessments a
JOIN companies c ON a.company_id = c.id
LEFT JOIN legacy_applications l ON l.assessment_id = a.id
LEFT JOIN assessed_risks r ON r.assessment_id = a.id
GROUP BY 
    a.id, a.title, c.id, c.name, a.infrastructure, 
    a.readiness_score, a.toe_tech_score, a.toe_org_score, a.toe_env_score, a.status;
```

### 4.2 View: `RiskDistribution` $\rightarrow$ `risk_distribution`
Maps assessed risks grouped by assessment and severity:
```sql
CREATE OR REPLACE VIEW risk_distribution AS
SELECT 
    r.id,
    r.assessment_id,
    r.severity,
    COUNT(r.id) OVER (PARTITION BY r.assessment_id, r.severity)::INTEGER AS count_by_severity
FROM assessed_risks r;
```

Also includes aggregated summary view `risk_distribution_summary`:
```sql
CREATE OR REPLACE VIEW risk_distribution_summary AS
SELECT 
    r.assessment_id,
    r.severity,
    COUNT(r.id)::INTEGER AS count_by_severity
FROM assessed_risks r
GROUP BY r.assessment_id, r.severity;
```

---

## 5. Seed Data Inventory (`db/data/*.csv`)

All seed rows have been validated and mapped directly into `supabase/seed.sql`:

1. **`saas.transformation-Companies.csv` (2 rows):**
   - `comp-apex-global`: Apex Global Enterprises (Manufacturing & Logistics, 1,000 employees, \$1.5M IT budget, North America)
   - `comp-novasystems`: Nova Systems Corp (Financial Technology, 450 employees, \$850K IT budget, EMEA)
2. **`saas.transformation-UserProfiles.csv` (4 rows):**
   - `usr-rishi`: Rishi Kumar (Admin, `comp-apex-global`)
   - `usr-aarushi`: Aarushi Joshi (Manager, `comp-apex-global`)
   - `usr-pradyumn`: Pradyumn Bisen (Analyst, `comp-apex-global`)
   - `usr-akshayadevi`: Akshayadevi K (Viewer, `comp-apex-global`)
3. **`saas.transformation-RiskTemplates.csv` (5 rows):**
   - `risk-data-loss`: Data Governance, Data Loss During Migration (Probability 3, Impact 5)
   - `risk-integration`: Integration & Architecture, Integration Failure (Probability 3, Impact 4)
   - `risk-change-mgmt`: Organizational Change, Employee Resistance (Probability 4, Impact 3)
   - `risk-security-config`: Cybersecurity & Compliance, Security Config Drift (Probability 2, Impact 5)
   - `risk-vendor-lockin`: Commercial & Vendor, Vendor Lock-in (Probability 3, Impact 4)
4. **`saas.transformation-SaaSProducts.csv` (10 rows):**
   - `salesforce-crm`, `ms-dynamics-365`, `sap-cloud-erp`, `oracle-fusion-erp`, `workday-hcm`, `servicenow-itsm`, `jira-cloud`, `microsoft-365`, `ms-power-bi`, `ms-entra-id`
5. **Sample Baseline Relational Seed Data:**
   - Pre-populated initial assessment `asmt-apex-initial` for Apex Global with 3 legacy applications (`Legacy ERP AS/400`, `Custom CRM FoxPro`, `On-Prem Exchange 2013`) and 4 assessed risks, enabling immediate testing of `transformation_overview` and dashboard metrics.

---

## 6. Migration Files Created

1. **`supabase/migrations/20261101000001_initial_schema.sql`:**
   - `pgcrypto` extension enablement.
   - `update_modified_at_column()` PL/pgSQL function and triggers for all 15 tables.
   - DDL definitions for all 15 tables with exact data types, defaults, check constraints, and cascading foreign keys.
   - B-tree indexes on foreign keys (`company_id`, `assessment_id`, `product_id`, `plan_id`) and status fields.
   - `transformation_overview`, `risk_distribution`, and `risk_distribution_summary` views.
2. **`supabase/seed.sql`:**
   - Idempotent `INSERT INTO ... ON CONFLICT (...) DO UPDATE` statements for all 4 seed datasets + baseline assessment relational entities.

---

## 7. CLI & Docker Runtime Verification

### Command Execution
```powershell
supabase --version
docker --version
```

### Result & Output
```text
supabase : The term 'supabase' is not recognized as the name of a cmdlet, function, script file, or operable program.
docker : The term 'docker' is not recognized as the name of a cmdlet, function, script file, or operable program.
```

### Verification Status: **NOT VERIFIED**
- **Reason:** The local host does not have Docker Desktop / Docker daemon or the standalone `supabase` CLI installed on PATH.
- **Impact:** `supabase init` and `supabase db reset` require Docker to start local Supabase containers (PostgreSQL, Kong, PostgREST, GoTrue, Studio).
- **Corrective Procedure When Docker/Supabase CLI Are Available:**
  1. Initialize local configuration:
     ```bash
     supabase init
     ```
  2. Start local containers:
     ```bash
     supabase start
     ```
  3. Execute migration and seed scripts:
     ```bash
     supabase db reset
     ```
  4. Alternatively, execute `supabase/migrations/20261101000001_initial_schema.sql` and `supabase/seed.sql` directly into a hosted Supabase project via the Supabase Dashboard SQL Editor.



---

## 8. Step B2: Auth, RBAC & Row Level Security (RLS) Specification

### 8.1 Scopes Extraction from `xs-security.json`
`xs-security.json` defines four platform scopes and tenant attribute scoping:
1. **`$XSAPPNAME.Admin`:** Platform owner — manages SaaS catalog, risk templates, all tenant companies, and user profiles.
2. **`$XSAPPNAME.Manager`:** Enterprise IT Lead — creates assessments, sets criteria weights, manages roadmap plans, approves cutovers. Scoped by attribute `company`.
3. **`$XSAPPNAME.Analyst`:** Enterprise Analyst — inputs assessment parameters, legacy monolith inventory, runs evaluation scoring and risk analysis. Scoped by attribute `company`.
4. **`$XSAPPNAME.Viewer`:** Executive Stakeholder — read-only access to dashboard, evaluation rankings, risk exposure heatmap, and roadmap timeline. Scoped by attribute `company`.

### 8.2 Role-to-Postgres Mapping (`profiles` Table)
```sql
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    full_name TEXT,
    email TEXT UNIQUE,
    role VARCHAR(20) NOT NULL DEFAULT 'viewer' CHECK (LOWER(role) IN ('admin', 'manager', 'analyst', 'viewer')),
    company_id TEXT REFERENCES public.companies(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    modified_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);
```

### 8.3 RLS Policy Hierarchy & Capabilities
- **`public.is_admin()`:** Returns true for `admin`. Full access across all companies, SaaS catalog mutations, and risk template authoring.
- **`public.is_manager()`:** Returns true for `admin` and `manager`. Can insert/update/delete company assessments, migration plans, phases, and criteria weights within `company_id`.
- **`public.is_analyst()`:** Returns true for `admin`, `manager`, and `analyst`. Can manage legacy applications, requirements, evaluations, and assessed risks within `company_id`.
- **`viewer`:** Can strictly `SELECT` records where `company_id = public.get_auth_company_id()`. All mutation attempts (`INSERT`, `UPDATE`, `DELETE`) are rejected by RLS.
- **Tenant Isolation:** Enforced across all queries via `company_id = public.get_auth_company_id()`. Multi-tenant cross-talk is prevented at the database kernel level.

### 8.4 Automated SQL Test Suite (`supabase/tests/rls_tests.sql`)
The test script verifies all 6 core security scenarios in a transactional test sandbox:
1. `TEST 1`: Anonymous Access Denial (public unauthenticated queries blocked).
2. `TEST 2`: Multi-Tenant Isolation (`comp-novasystems` manager cannot see `comp-apex-global` records).
3. `TEST 3`: Viewer Role Enforcement (read-only allowed; INSERT/UPDATE rejected).
4. `TEST 4`: Analyst Scope Boundaries (can manage legacy apps; cannot modify catalog).
5. `TEST 5`: Manager Scope Execution (can create and manage roadmap plans).
6. `TEST 6`: Admin Global Access (cross-tenant visibility and SaaS catalog write authority).

### 8.5 Frontend Integration
- Installed `@supabase/supabase-js` into `frontend/`.
- Created [`frontend/src/lib/supabase.js`](file:///c:/Users/rishi/.gemini/antigravity-ide/scratch/saas-transformation/frontend/src/lib/supabase.js) with client configuration and an offline fallback client for local environments.
- Replaced mock authentication in [`frontend/src/services/authService.js`](file:///c:/Users/rishi/.gemini/antigravity-ide/scratch/saas-transformation/frontend/src/services/authService.js) with Supabase Auth (`signInWithPassword`, `signUp`, `signOut`, `getUser`, `onAuthStateChange`).
- Hardened [`frontend/src/app/ProtectedRoute.jsx`](file:///c:/Users/rishi/.gemini/antigravity-ide/scratch/saas-transformation/frontend/src/app/ProtectedRoute.jsx) with role hierarchy enforcement (`Admin > Manager > Analyst > Viewer`), redirecting unauthenticated users to `/login` and rendering styled access restriction notices when required privileges are unmet.
