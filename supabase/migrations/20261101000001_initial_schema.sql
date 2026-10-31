-- ==============================================================================
-- Migration: 20261101000001_initial_schema.sql
-- Description: Initial schema for Enterprise SaaS Transformation Platform
-- Database: PostgreSQL (Supabase)
-- Maps: db/schema.cds and db/views.cds
-- ==============================================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. Helper Function: Automatic modified_at Timestamp Updater
-- ==============================================================================
CREATE OR REPLACE FUNCTION update_modified_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.modified_at = clock_timestamp();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 2. Core Tables
-- ==============================================================================

-- 2.1 Companies (saas.transformation.Companies)
CREATE TABLE IF NOT EXISTS companies (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    created_by TEXT DEFAULT 'system',
    modified_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    modified_by TEXT DEFAULT 'system',
    name VARCHAR(100) NOT NULL,
    industry VARCHAR(50),
    employees INTEGER CHECK (employees >= 0),
    it_budget NUMERIC(15, 2) CHECK (it_budget >= 0),
    region VARCHAR(50)
);

CREATE TRIGGER trg_companies_modified_at
    BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_modified_at_column();

-- 2.2 UserProfiles (saas.transformation.UserProfiles)
CREATE TABLE IF NOT EXISTS user_profiles (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    created_by TEXT DEFAULT 'system',
    modified_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    modified_by TEXT DEFAULT 'system',
    username VARCHAR(50) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('Admin', 'Manager', 'Analyst', 'Viewer')),
    company_id TEXT REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TRIGGER trg_user_profiles_modified_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_modified_at_column();

CREATE INDEX IF NOT EXISTS idx_user_profiles_company ON user_profiles(company_id);

-- 2.3 Assessments (saas.transformation.Assessments)
CREATE TABLE IF NOT EXISTS assessments (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    created_by TEXT DEFAULT 'system',
    modified_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    modified_by TEXT DEFAULT 'system',
    title VARCHAR(150) NOT NULL,
    company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    infrastructure VARCHAR(50) CHECK (infrastructure IN ('On-premise', 'Hybrid', 'Colocated', 'Private Cloud', 'Public Cloud')),
    growth_rate NUMERIC(5, 2) DEFAULT 0.0,
    data_sensitivity VARCHAR(20) CHECK (data_sensitivity IN ('Low', 'Medium', 'High')),
    pain_points TEXT,
    target_category VARCHAR(50) CHECK (target_category IN ('CRM', 'ERP', 'HCM', 'ITSM', 'Productivity', 'Analytics', 'Identity', 'All')),
    readiness_score NUMERIC(5, 2) DEFAULT 0.0 CHECK (readiness_score >= 0 AND readiness_score <= 100),
    toe_tech_score NUMERIC(5, 2) DEFAULT 0.0 CHECK (toe_tech_score >= 0 AND toe_tech_score <= 100),
    toe_org_score NUMERIC(5, 2) DEFAULT 0.0 CHECK (toe_org_score >= 0 AND toe_org_score <= 100),
    toe_env_score NUMERIC(5, 2) DEFAULT 0.0 CHECK (toe_env_score >= 0 AND toe_env_score <= 100),
    status VARCHAR(20) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'In Progress', 'Completed', 'Approved'))
);

CREATE TRIGGER trg_assessments_modified_at
    BEFORE UPDATE ON assessments
    FOR EACH ROW EXECUTE FUNCTION update_modified_at_column();

CREATE INDEX IF NOT EXISTS idx_assessments_company ON assessments(company_id);
CREATE INDEX IF NOT EXISTS idx_assessments_status ON assessments(status);

-- 2.4 LegacyApplications (saas.transformation.LegacyApplications)
CREATE TABLE IF NOT EXISTS legacy_applications (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    created_by TEXT DEFAULT 'system',
    modified_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    modified_by TEXT DEFAULT 'system',
    assessment_id TEXT NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    function VARCHAR(100),
    hosting VARCHAR(50),
    criticality VARCHAR(20) NOT NULL DEFAULT 'Medium' CHECK (criticality IN ('Critical', 'High', 'Medium', 'Low')),
    user_count INTEGER DEFAULT 0 CHECK (user_count >= 0),
    years_in_use INTEGER DEFAULT 0 CHECK (years_in_use >= 0)
);

CREATE TRIGGER trg_legacy_applications_modified_at
    BEFORE UPDATE ON legacy_applications
    FOR EACH ROW EXECUTE FUNCTION update_modified_at_column();

CREATE INDEX IF NOT EXISTS idx_legacy_apps_assessment ON legacy_applications(assessment_id);

-- 2.5 Requirements (saas.transformation.Requirements)
CREATE TABLE IF NOT EXISTS requirements (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    created_by TEXT DEFAULT 'system',
    modified_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    modified_by TEXT DEFAULT 'system',
    assessment_id TEXT NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    category VARCHAR(50),
    description VARCHAR(255) NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'Must Have' CHECK (priority IN ('Must Have', 'Nice to Have', 'Optional'))
);

CREATE TRIGGER trg_requirements_modified_at
    BEFORE UPDATE ON requirements
    FOR EACH ROW EXECUTE FUNCTION update_modified_at_column();

CREATE INDEX IF NOT EXISTS idx_requirements_assessment ON requirements(assessment_id);

-- 2.6 SaaSProducts (saas.transformation.SaaSProducts)
CREATE TABLE IF NOT EXISTS saas_products (
    id VARCHAR(50) PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    created_by TEXT DEFAULT 'system',
    modified_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    modified_by TEXT DEFAULT 'system',
    name VARCHAR(100) NOT NULL,
    vendor VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('CRM', 'ERP', 'HCM', 'ITSM', 'Productivity', 'Analytics', 'Identity')),
    business_function VARCHAR(150),
    pricing_model VARCHAR(50),
    cost_level VARCHAR(20) CHECK (cost_level IN ('Low', 'Medium', 'High')),
    cost_score NUMERIC(5, 2) CHECK (cost_score >= 0 AND cost_score <= 100),
    scalability_rating VARCHAR(20) CHECK (scalability_rating IN ('High', 'Very High', 'Enterprise')),
    scalability_score NUMERIC(5, 2) CHECK (scalability_score >= 0 AND scalability_score <= 100),
    security_rating VARCHAR(100),
    security_score NUMERIC(5, 2) CHECK (security_score >= 0 AND security_score <= 100),
    integration_capability VARCHAR(100),
    integration_score NUMERIC(5, 2) CHECK (integration_score >= 0 AND integration_score <= 100),
    features_score NUMERIC(5, 2) CHECK (features_score >= 0 AND features_score <= 100),
    deployment_type VARCHAR(50),
    target_organisation VARCHAR(50),
    migration_complexity VARCHAR(20) CHECK (migration_complexity IN ('Low', 'Medium', 'High')),
    api_available BOOLEAN DEFAULT true,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Retired')),
    description TEXT
);

CREATE TRIGGER trg_saas_products_modified_at
    BEFORE UPDATE ON saas_products
    FOR EACH ROW EXECUTE FUNCTION update_modified_at_column();

CREATE INDEX IF NOT EXISTS idx_saas_products_category ON saas_products(category);
CREATE INDEX IF NOT EXISTS idx_saas_products_status ON saas_products(status);

-- 2.7 ProductCapabilities (saas.transformation.ProductCapabilities)
CREATE TABLE IF NOT EXISTS product_capabilities (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    created_by TEXT DEFAULT 'system',
    modified_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    modified_by TEXT DEFAULT 'system',
    product_id VARCHAR(50) NOT NULL REFERENCES saas_products(id) ON DELETE CASCADE,
    capability_name VARCHAR(100) NOT NULL,
    capability_description VARCHAR(255),
    maturity VARCHAR(20)
);

CREATE TRIGGER trg_product_capabilities_modified_at
    BEFORE UPDATE ON product_capabilities
    FOR EACH ROW EXECUTE FUNCTION update_modified_at_column();

CREATE INDEX IF NOT EXISTS idx_product_capabilities_product ON product_capabilities(product_id);

-- 2.8 Evaluations (saas.transformation.Evaluations)
CREATE TABLE IF NOT EXISTS evaluations (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    created_by TEXT DEFAULT 'system',
    modified_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    modified_by TEXT DEFAULT 'system',
    assessment_id TEXT NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    evaluation_date TIMESTAMPTZ DEFAULT clock_timestamp(),
    status VARCHAR(20) DEFAULT 'Draft'
);

CREATE TRIGGER trg_evaluations_modified_at
    BEFORE UPDATE ON evaluations
    FOR EACH ROW EXECUTE FUNCTION update_modified_at_column();

CREATE INDEX IF NOT EXISTS idx_evaluations_assessment ON evaluations(assessment_id);

-- 2.9 CriteriaWeights (saas.transformation.CriteriaWeights)
CREATE TABLE IF NOT EXISTS criteria_weights (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    created_by TEXT DEFAULT 'system',
    modified_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    modified_by TEXT DEFAULT 'system',
    evaluation_id TEXT NOT NULL UNIQUE REFERENCES evaluations(id) ON DELETE CASCADE,
    cost_weight NUMERIC(5, 2) DEFAULT 20.0 CHECK (cost_weight >= 0),
    security_weight NUMERIC(5, 2) DEFAULT 30.0 CHECK (security_weight >= 0),
    scalability_weight NUMERIC(5, 2) DEFAULT 25.0 CHECK (scalability_weight >= 0),
    integration_weight NUMERIC(5, 2) DEFAULT 15.0 CHECK (integration_weight >= 0),
    features_weight NUMERIC(5, 2) DEFAULT 10.0 CHECK (features_weight >= 0)
);

CREATE TRIGGER trg_criteria_weights_modified_at
    BEFORE UPDATE ON criteria_weights
    FOR EACH ROW EXECUTE FUNCTION update_modified_at_column();

-- 2.10 EvaluationResults (saas.transformation.EvaluationResults)
CREATE TABLE IF NOT EXISTS evaluation_results (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    created_by TEXT DEFAULT 'system',
    modified_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    modified_by TEXT DEFAULT 'system',
    evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
    product_id VARCHAR(50) NOT NULL REFERENCES saas_products(id) ON DELETE CASCADE,
    total_score NUMERIC(5, 2) NOT NULL,
    cost_sub_score NUMERIC(5, 2) NOT NULL,
    security_sub_score NUMERIC(5, 2) NOT NULL,
    scalability_sub_score NUMERIC(5, 2) NOT NULL,
    integration_sub_score NUMERIC(5, 2) NOT NULL,
    features_sub_score NUMERIC(5, 2) NOT NULL,
    rank INTEGER NOT NULL,
    reason TEXT
);

CREATE TRIGGER trg_evaluation_results_modified_at
    BEFORE UPDATE ON evaluation_results
    FOR EACH ROW EXECUTE FUNCTION update_modified_at_column();

CREATE INDEX IF NOT EXISTS idx_evaluation_results_eval ON evaluation_results(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_results_prod ON evaluation_results(product_id);

-- 2.11 RiskTemplates (saas.transformation.RiskTemplates)
CREATE TABLE IF NOT EXISTS risk_templates (
    id VARCHAR(50) PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    created_by TEXT DEFAULT 'system',
    modified_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    modified_by TEXT DEFAULT 'system',
    category VARCHAR(50) NOT NULL,
    risk_title VARCHAR(150) NOT NULL,
    description TEXT,
    base_probability INTEGER NOT NULL CHECK (base_probability BETWEEN 1 AND 5),
    base_impact INTEGER NOT NULL CHECK (base_impact BETWEEN 1 AND 5),
    default_mitigation TEXT
);

CREATE TRIGGER trg_risk_templates_modified_at
    BEFORE UPDATE ON risk_templates
    FOR EACH ROW EXECUTE FUNCTION update_modified_at_column();

CREATE INDEX IF NOT EXISTS idx_risk_templates_category ON risk_templates(category);

-- 2.12 AssessedRisks (saas.transformation.AssessedRisks)
CREATE TABLE IF NOT EXISTS assessed_risks (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    created_by TEXT DEFAULT 'system',
    modified_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    modified_by TEXT DEFAULT 'system',
    assessment_id TEXT NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    template_id VARCHAR(50) REFERENCES risk_templates(id) ON DELETE SET NULL,
    risk_title VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    probability INTEGER NOT NULL CHECK (probability BETWEEN 1 AND 5),
    impact INTEGER NOT NULL CHECK (impact BETWEEN 1 AND 5),
    score INTEGER NOT NULL CHECK (score BETWEEN 1 AND 25),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
    mitigation TEXT,
    adjusted_reason TEXT
);

CREATE TRIGGER trg_assessed_risks_modified_at
    BEFORE UPDATE ON assessed_risks
    FOR EACH ROW EXECUTE FUNCTION update_modified_at_column();

CREATE INDEX IF NOT EXISTS idx_assessed_risks_assessment ON assessed_risks(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessed_risks_severity ON assessed_risks(severity);

-- 2.13 MigrationPlans (saas.transformation.MigrationPlans)
CREATE TABLE IF NOT EXISTS migration_plans (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    created_by TEXT DEFAULT 'system',
    modified_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    modified_by TEXT DEFAULT 'system',
    assessment_id TEXT NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    selected_product_id VARCHAR(50) REFERENCES saas_products(id) ON DELETE SET NULL,
    title VARCHAR(150) NOT NULL,
    total_phases INTEGER DEFAULT 8 CHECK (total_phases > 0),
    overall_progress NUMERIC(5, 2) DEFAULT 0.0 CHECK (overall_progress >= 0 AND overall_progress <= 100),
    start_date DATE,
    target_end_date DATE,
    estimated_duration_months INTEGER DEFAULT 12 CHECK (estimated_duration_months > 0)
);

CREATE TRIGGER trg_migration_plans_modified_at
    BEFORE UPDATE ON migration_plans
    FOR EACH ROW EXECUTE FUNCTION update_modified_at_column();

CREATE INDEX IF NOT EXISTS idx_migration_plans_assessment ON migration_plans(assessment_id);

-- 2.14 MigrationPhases (saas.transformation.MigrationPhases)
CREATE TABLE IF NOT EXISTS migration_phases (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    created_by TEXT DEFAULT 'system',
    modified_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    modified_by TEXT DEFAULT 'system',
    plan_id TEXT NOT NULL REFERENCES migration_plans(id) ON DELETE CASCADE,
    sequence INTEGER NOT NULL CHECK (sequence BETWEEN 1 AND 8),
    name VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Not Started' CHECK (status IN ('Not Started', 'In Progress', 'Completed', 'Blocked')),
    progress INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
    start_date DATE,
    end_date DATE,
    deliverables TEXT,
    notes TEXT,
    risk_mitigation_focus TEXT
);

CREATE TRIGGER trg_migration_phases_modified_at
    BEFORE UPDATE ON migration_phases
    FOR EACH ROW EXECUTE FUNCTION update_modified_at_column();

CREATE INDEX IF NOT EXISTS idx_migration_phases_plan ON migration_phases(plan_id);

-- 2.15 AssistantMessages (saas.transformation.AssistantMessages)
CREATE TABLE IF NOT EXISTS assistant_messages (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    created_by TEXT DEFAULT 'system',
    modified_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    modified_by TEXT DEFAULT 'system',
    assessment_id TEXT NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    sender VARCHAR(20) NOT NULL CHECK (sender IN ('user', 'assistant')),
    message_text TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT clock_timestamp()
);

CREATE TRIGGER trg_assistant_messages_modified_at
    BEFORE UPDATE ON assistant_messages
    FOR EACH ROW EXECUTE FUNCTION update_modified_at_column();

CREATE INDEX IF NOT EXISTS idx_assistant_messages_assessment ON assistant_messages(assessment_id);

-- ==============================================================================
-- 3. Database Views (Mapping db/views.cds)
-- ==============================================================================

-- 3.1 TransformationOverview (saas.transformation.TransformationOverview)
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

-- 3.2 RiskDistribution (saas.transformation.RiskDistribution)
CREATE OR REPLACE VIEW risk_distribution AS
SELECT 
    r.id,
    r.assessment_id,
    r.severity,
    COUNT(r.id) OVER (PARTITION BY r.assessment_id, r.severity)::INTEGER AS count_by_severity
FROM assessed_risks r;

-- 3.3 RiskDistributionSummary (Aggregated by assessment and severity)
CREATE OR REPLACE VIEW risk_distribution_summary AS
SELECT 
    r.assessment_id,
    r.severity,
    COUNT(r.id)::INTEGER AS count_by_severity
FROM assessed_risks r
GROUP BY r.assessment_id, r.severity;
