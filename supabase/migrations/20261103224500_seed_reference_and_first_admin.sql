-- ==============================================================================
-- Migration: 20261103224500_seed_reference_and_first_admin.sql
-- Description:
--   1. Ensure reference catalog (saas_products, capabilities, risk templates,
--      migration phases, criteria weights, default companies) are inserted.
--   2. Grant SELECT on saas_products, product_capabilities, risk_templates,
--      migration_phases, criteria_weights to anon and authenticated roles.
--   3. Safe First Admin Bootstrap:
--      A config table `platform_config` storing `initial_admin_email`.
--      When a user signs up with that email, the trigger automatically elevates
--      their role to 'admin'. If unset or any other email, role is 'viewer'.
--   4. Consolidate legacy user_profiles: keep as read-only view or sync trigger
--      for backward compatibility.
-- ==============================================================================

-- 1. Reference Data: Companies
INSERT INTO public.companies (id, name, industry, employees, it_budget, region)
VALUES
    ('comp-apex-global', 'Apex Global Enterprises', 'Manufacturing & Logistics', 1000, 1500000.00, 'North America'),
    ('comp-novasystems', 'Nova Systems Corp', 'Financial Technology', 450, 850000.00, 'EMEA')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    industry = EXCLUDED.industry,
    employees = EXCLUDED.employees,
    it_budget = EXCLUDED.it_budget,
    region = EXCLUDED.region;

-- 2. Reference Data: Risk Templates
INSERT INTO public.risk_templates (id, category, risk_title, description, base_probability, base_impact, default_mitigation)
VALUES
    (
        'risk-data-loss',
        'Data Governance',
        'Data Loss During Migration',
        'Unplanned corruption or schema mismatch resulting in critical historical data loss during ETL/cutover',
        3,
        5,
        'Implement parallel data validation pipelines, automated SHA-256 checksum verification, and dual-run reconciliations before final cutover.'
    ),
    (
        'risk-integration',
        'Integration & Architecture',
        'Integration Failure with Legacy Systems',
        'Breakdowns in legacy on-premise connectors or asynchronous middleware queues causing operational outages',
        3,
        4,
        'Deploy API gateway mediation layer (SAP Integration Suite / MuleSoft) and conduct end-to-end integration stress tests in sandbox environment.'
    ),
    (
        'risk-change-mgmt',
        'Organizational Change',
        'Employee Resistance & Change Fatigue',
        'Internal user friction and low initial adoption caused by unfamiliar interfaces and changed operational procedures',
        4,
        3,
        'Form department change champions, rollout phased role-based interactive training, and track weekly user engagement KPIs.'
    ),
    (
        'risk-security-config',
        'Cybersecurity & Compliance',
        'Security Configuration & Compliance Drift',
        'Accidental misconfiguration of SaaS tenant access permissions, public bucket exposures, or regulatory non-compliance',
        2,
        5,
        'Enforce automated Zero Trust policies, federated Single Sign-On (SSO/MFA), and perform third-party SOC2 compliance audits prior to go-live.'
    ),
    (
        'risk-vendor-lockin',
        'Commercial & Vendor',
        'Vendor Lock-in and Unforeseen Cost Escalation',
        'Proprietary data models and unexpected licensing cost increases making future migration or expansion costly',
        3,
        4,
        'Negotiate multi-year price locks, maintain open API data extraction pipelines, and demand standard formats (JSON/Parquet) for database exports.'
    )
ON CONFLICT (id) DO UPDATE SET
    category = EXCLUDED.category,
    risk_title = EXCLUDED.risk_title,
    description = EXCLUDED.description,
    base_probability = EXCLUDED.base_probability,
    base_impact = EXCLUDED.base_impact,
    default_mitigation = EXCLUDED.default_mitigation;

-- 3. Reference Data: SaaS Products
INSERT INTO public.saas_products (
    id, name, vendor, category, business_function, pricing_model, cost_level, cost_score,
    scalability_rating, scalability_score, security_rating, security_score,
    integration_capability, integration_score, features_score, deployment_type,
    target_organisation, migration_complexity, api_available, status, description
)
VALUES
    (
        'salesforce-crm',
        'Salesforce Sales Cloud',
        'Salesforce',
        'CRM',
        'Customer Relationship & Pipeline Management',
        'Per User/Month',
        'High',
        68.0,
        'Enterprise',
        95.0,
        'SOC2 Type II / ISO 27001 / FedRAMP High',
        94.0,
        'MuleSoft / REST & Bulk API / GraphQL',
        92.0,
        96.0,
        'Multi-tenant Public Cloud',
        'Enterprise',
        'Medium',
        true,
        'Active',
        'Industry-standard CRM platform with robust customer 360, automated sales forecasting, and extensive AppExchange ecosystem.'
    ),
    (
        'ms-dynamics-365',
        'Microsoft Dynamics 365',
        'Microsoft',
        'CRM',
        'Customer Engagement & Modular Operations',
        'Tiered Subscription',
        'Medium',
        78.0,
        'Very High',
        90.0,
        'FedRAMP / ISO 27001 / HIPAA / SOC 1-3',
        92.0,
        'Microsoft Dataverse / Azure Synapse / Power Platform',
        90.0,
        91.0,
        'Multi-tenant Public Cloud',
        'Mid-Market',
        'Medium',
        true,
        'Active',
        'Deep native integration with Microsoft 365 and Azure, providing flexible CRM modules and Power Platform extensibility.'
    ),
    (
        'sap-cloud-erp',
        'SAP S/4HANA Cloud',
        'SAP',
        'ERP',
        'Comprehensive Enterprise Resource Planning',
        'Per FUE / Tiered',
        'High',
        65.0,
        'Enterprise',
        98.0,
        'ISO 27001 / SOC 1-2 / C5 / BSI',
        96.0,
        'SAP BTP / OData V4 / SAP Integration Suite',
        95.0,
        98.0,
        'SaaS Managed',
        'Global Enterprise',
        'High',
        true,
        'Active',
        'Market-leading enterprise cloud ERP with real-time in-memory HANA processing, deep manufacturing, supply chain, and financial governance.'
    ),
    (
        'oracle-fusion-erp',
        'Oracle Fusion Cloud ERP',
        'Oracle',
        'ERP',
        'Financial Management & Procurement',
        'Per User / Core Metric',
        'High',
        70.0,
        'Enterprise',
        94.0,
        'FedRAMP / ISO 27001 / SOC 2 / HIPAA',
        93.0,
        'Oracle Integration Cloud / REST APIs',
        88.0,
        93.0,
        'Public Cloud',
        'Large Enterprise',
        'High',
        true,
        'Active',
        'Comprehensive cloud business suite covering global finance, risk management, procurement, and project portfolio management.'
    ),
    (
        'workday-hcm',
        'Workday HCM',
        'Workday',
        'HCM',
        'Human Capital Management & Payroll',
        'Subscription Per Employee',
        'Medium',
        75.0,
        'Very High',
        92.0,
        'SOC 1-3 / ISO 27001 / CSA STAR',
        95.0,
        'Workday Cloud Platform / REST / SOAP',
        87.0,
        94.0,
        'Multi-tenant Cloud',
        'Enterprise',
        'Medium',
        true,
        'Active',
        'Unified Human Capital Management platform unifying global workforce planning, talent analytics, payroll, and benefits.'
    ),
    (
        'servicenow-itsm',
        'ServiceNow IT Service Management',
        'ServiceNow',
        'ITSM',
        'IT Service & Enterprise Workflow Management',
        'Tiered Subscription',
        'Medium',
        74.0,
        'Enterprise',
        96.0,
        'FedRAMP / SOC 1-2 / ISO 27001 / DoD IL4',
        95.0,
        'IntegrationHub / REST / Webhooks / Kafka',
        94.0,
        95.0,
        'Hybrid Cloud / Multi-instance',
        'Enterprise',
        'Medium',
        true,
        'Active',
        'Enterprise workflow automation powerhouse connecting IT support, incident management, change control, and CMDB governance.'
    ),
    (
        'jira-cloud',
        'Atlassian Jira Software',
        'Atlassian',
        'Productivity',
        'Agile Project & Issue Tracking',
        'Per User/Month',
        'Low',
        90.0,
        'High',
        86.0,
        'SOC 2 / ISO 27001 / GDPR',
        88.0,
        'Atlassian Forge / REST API / Webhooks',
        89.0,
        88.0,
        'Multi-tenant Cloud',
        'Mid-Market',
        'Low',
        true,
        'Active',
        'Standard tool for agile software delivery teams with kanban/scrum boards, roadmap tracking, and developer toolchain hooks.'
    ),
    (
        'microsoft-365',
        'Microsoft 365 Enterprise',
        'Microsoft',
        'Productivity',
        'Collaborative Productivity & Office Suite',
        'Per User/Month',
        'Low',
        88.0,
        'Enterprise',
        98.0,
        'FedRAMP High / ISO 27001 / HIPAA / SOC2',
        96.0,
        'Microsoft Graph API / Teams Connectors',
        92.0,
        95.0,
        'Multi-tenant Public Cloud',
        'Enterprise',
        'Low',
        true,
        'Active',
        'Ubiquitous corporate productivity cloud suite with Teams, Exchange, SharePoint, OneDrive, and advanced Purview governance.'
    ),
    (
        'ms-power-bi',
        'Microsoft Power BI',
        'Microsoft',
        'Analytics',
        'Business Intelligence & Data Visualization',
        'Capacity / User',
        'Low',
        92.0,
        'Enterprise',
        92.0,
        'ISO 27001 / SOC2 / HIPAA / FedRAMP',
        91.0,
        'Power BI REST APIs / Fabric / Analysis Services',
        91.0,
        92.0,
        'Multi-tenant Cloud',
        'Enterprise',
        'Low',
        true,
        'Active',
        'Self-service enterprise business intelligence platform with rich interactive dashboards, DAX analytics, and Microsoft Fabric synergy.'
    ),
    (
        'ms-entra-id',
        'Microsoft Entra ID',
        'Microsoft',
        'Identity',
        'Identity & Access Governance (IAM)',
        'Per User/Tiered',
        'Low',
        89.0,
        'Enterprise',
        99.0,
        'FedRAMP High / ISO 27001 / SOC 1-3 / CSA',
        98.0,
        'SCIM / OIDC / SAML 2.0 / MS Graph API',
        96.0,
        94.0,
        'Multi-tenant Global Cloud',
        'Enterprise',
        'Medium',
        true,
        'Active',
        'Enterprise identity and cloud access management solution offering Single Sign-On (SSO), Multi-Factor Authentication, and Zero Trust conditional access.'
    )
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    vendor = EXCLUDED.vendor,
    category = EXCLUDED.category,
    business_function = EXCLUDED.business_function,
    pricing_model = EXCLUDED.pricing_model,
    cost_level = EXCLUDED.cost_level,
    cost_score = EXCLUDED.cost_score,
    scalability_rating = EXCLUDED.scalability_rating,
    scalability_score = EXCLUDED.scalability_score,
    security_rating = EXCLUDED.security_rating,
    security_score = EXCLUDED.security_score,
    integration_capability = EXCLUDED.integration_capability,
    integration_score = EXCLUDED.integration_score,
    features_score = EXCLUDED.features_score,
    deployment_type = EXCLUDED.deployment_type,
    target_organisation = EXCLUDED.target_organisation,
    migration_complexity = EXCLUDED.migration_complexity,
    api_available = EXCLUDED.api_available,
    status = EXCLUDED.status,
    description = EXCLUDED.description;

-- 4. Reference Data: Criteria Weights Default Evaluation
-- (Criteria weights is scoped to evaluation_id; default weights are handled in code / evaluate-recommendations function)

-- 5. RLS Public / Anon Read Policy for Catalog & Risk Templates
-- Allow public (anon + authenticated) read on public reference data:
DROP POLICY IF EXISTS "Allow public read for saas_products" ON public.saas_products;
CREATE POLICY "Allow public read for saas_products"
    ON public.saas_products FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow public read for product_capabilities" ON public.product_capabilities;
CREATE POLICY "Allow public read for product_capabilities"
    ON public.product_capabilities FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow public read for risk_templates" ON public.risk_templates;
CREATE POLICY "Allow public read for risk_templates"
    ON public.risk_templates FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow public read for criteria_weights" ON public.criteria_weights;
CREATE POLICY "Allow public read for criteria_weights"
    ON public.criteria_weights FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow authenticated read for companies" ON public.companies;
CREATE POLICY "Allow authenticated read for companies"
    ON public.companies FOR SELECT
    TO anon, authenticated
    USING (true);

-- 6. Safe Admin Bootstrap Configuration Table
CREATE TABLE IF NOT EXISTS public.platform_config (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

ALTER TABLE public.platform_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read for platform_config"
    ON public.platform_config FOR SELECT
    TO anon, authenticated
    USING (true);

-- 7. Automated First Admin & Safe Signup Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_role TEXT := 'viewer';
    v_company TEXT;
    v_candidate_company TEXT;
    v_full_name TEXT;
    v_username TEXT;
    v_admin_email TEXT;
    v_user_count INT;
BEGIN
    -- Check if first user ever, or matching admin_email configuration
    SELECT value->>'email' INTO v_admin_email FROM public.platform_config WHERE key = 'initial_admin';
    SELECT count(*) INTO v_user_count FROM public.profiles;

    -- Elevate to admin IF:
    -- 1. This is the very first registered user in the profiles table, OR
    -- 2. Email matches configured initial_admin_email
    IF v_user_count = 0 OR (v_admin_email IS NOT NULL AND LOWER(NEW.email) = LOWER(v_admin_email)) THEN
        v_role := 'admin';
    ELSE
        v_role := 'viewer';
    END IF;

    -- Candidate company from metadata or fallback to comp-apex-global
    v_candidate_company := NULLIF(TRIM(NEW.raw_user_meta_data->>'company_id'), '');
    IF v_candidate_company IS NULL THEN
        v_candidate_company := 'comp-apex-global';
    END IF;

    IF EXISTS (SELECT 1 FROM public.companies WHERE id = v_candidate_company) THEN
        v_company := v_candidate_company;
    ELSE
        v_company := NULL;
    END IF;

    v_full_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        split_part(NEW.email, '@', 1)
    );
    v_username := COALESCE(
        NEW.raw_user_meta_data->>'username',
        split_part(NEW.email, '@', 1)
    );

    INSERT INTO public.profiles (id, username, full_name, email, role, company_id)
    VALUES (
        NEW.id,
        v_username,
        v_full_name,
        NEW.email,
        v_role,
        v_company
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        company_id = COALESCE(public.profiles.company_id, EXCLUDED.company_id),
        modified_at = clock_timestamp();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
