-- ==============================================================================
-- Seed: seed.sql
-- Description: Seed data for Enterprise SaaS Transformation Platform
-- Extracted from: db/data/*.csv (Real Seed Values)
-- ==============================================================================

-- 1. Companies (db/data/saas.transformation-Companies.csv)
INSERT INTO companies (id, name, industry, employees, it_budget, region)
VALUES
    ('comp-apex-global', 'Apex Global Enterprises', 'Manufacturing & Logistics', 1000, 1500000.00, 'North America'),
    ('comp-novasystems', 'Nova Systems Corp', 'Financial Technology', 450, 850000.00, 'EMEA')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    industry = EXCLUDED.industry,
    employees = EXCLUDED.employees,
    it_budget = EXCLUDED.it_budget,
    region = EXCLUDED.region;

-- 2. User Profiles (db/data/saas.transformation-UserProfiles.csv)
INSERT INTO user_profiles (id, username, full_name, email, role, company_id)
VALUES
    ('usr-rishi', 'rishi.kumar', 'Rishi Kumar (Admin)', 'rishi.kumar@apexglobal.com', 'Admin', 'comp-apex-global'),
    ('usr-aarushi', 'aarushi.joshi', 'Aarushi Joshi (IT Manager)', 'aarushi.joshi@apexglobal.com', 'Manager', 'comp-apex-global'),
    ('usr-pradyumn', 'pradyumn.bisen', 'Pradyumn Bisen (Analyst)', 'pradyumn.bisen@apexglobal.com', 'Analyst', 'comp-apex-global'),
    ('usr-akshayadevi', 'akshayadevi.k', 'Akshayadevi K (Executive Viewer)', 'akshayadevi.k@apexglobal.com', 'Viewer', 'comp-apex-global')
ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    company_id = EXCLUDED.company_id;

-- 3. Risk Templates (db/data/saas.transformation-RiskTemplates.csv)
INSERT INTO risk_templates (id, category, risk_title, description, base_probability, base_impact, default_mitigation)
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

-- 4. SaaS Products (db/data/saas.transformation-SaaSProducts.csv)
INSERT INTO saas_products (
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

-- 5. Baseline Assessment & Relational Data (Initial Baseline for Apex Global)
INSERT INTO assessments (
    id, title, company_id, infrastructure, growth_rate, data_sensitivity, pain_points,
    target_category, readiness_score, toe_tech_score, toe_org_score, toe_env_score, status
)
VALUES (
    'asmt-apex-initial',
    'Apex Global Enterprise Cloud Transformation 2026',
    'comp-apex-global',
    'Hybrid',
    15.0,
    'High',
    'High on-premise infrastructure maintenance costs, disparate ERP and CRM silos, legacy AS/400 integration bottlenecks.',
    'CRM',
    72.5,
    78.0,
    68.0,
    74.0,
    'Completed'
)
ON CONFLICT (id) DO NOTHING;

-- 6. Baseline Legacy Applications for Apex Global
INSERT INTO legacy_applications (id, assessment_id, name, function, hosting, criticality, user_count, years_in_use)
VALUES
    ('leg-app-1', 'asmt-apex-initial', 'Legacy ERP AS/400', 'Core Inventory & Order Fulfillment', 'On-premise Datacenter', 'Critical', 450, 14),
    ('leg-app-2', 'asmt-apex-initial', 'Custom CRM FoxPro', 'Customer Records & Leads Tracking', 'Local Server', 'High', 120, 11),
    ('leg-app-3', 'asmt-apex-initial', 'On-Prem Exchange 2013', 'Corporate Messaging & Calendar', 'Hybrid VM', 'Medium', 850, 9)
ON CONFLICT (id) DO NOTHING;

-- 7. Baseline Assessed Risks for Apex Global
INSERT INTO assessed_risks (
    id, assessment_id, template_id, risk_title, category, probability, impact, score, severity, mitigation, adjusted_reason
)
VALUES
    (
        'arisk-1',
        'asmt-apex-initial',
        'risk-data-loss',
        'Data Loss During Migration',
        'Data Governance',
        4,
        5,
        20,
        'Critical',
        'Implement parallel data validation pipelines, automated SHA-256 checksum verification, and dual-run reconciliations before final cutover.',
        'High data sensitivity elevates probability of severe business disruption.'
    ),
    (
        'arisk-2',
        'asmt-apex-initial',
        'risk-integration',
        'Integration Failure with Legacy Systems',
        'Integration & Architecture',
        4,
        4,
        16,
        'High',
        'Deploy API gateway mediation layer (SAP Integration Suite / MuleSoft) and conduct end-to-end integration stress tests in sandbox environment.',
        'Multiple legacy monoliths (AS/400, FoxPro) elevate integration coupling.'
    ),
    (
        'arisk-3',
        'asmt-apex-initial',
        'risk-change-mgmt',
        'Employee Resistance & Change Fatigue',
        'Organizational Change',
        4,
        3,
        12,
        'Medium',
        'Form department change champions, rollout phased role-based interactive training, and track weekly user engagement KPIs.',
        'Long years in use (14 years) may cause workflow inertia.'
    ),
    (
        'arisk-4',
        'asmt-apex-initial',
        'risk-security-config',
        'Security Configuration & Compliance Drift',
        'Cybersecurity & Compliance',
        2,
        5,
        10,
        'Medium',
        'Enforce automated Zero Trust policies, federated Single Sign-On (SSO/MFA), and perform third-party SOC2 compliance audits prior to go-live.',
        'Standard zero trust baseline required.'
    )
ON CONFLICT (id) DO NOTHING;

