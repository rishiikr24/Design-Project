-- ==============================================================================
-- Test Suite: rls_tests.sql
-- Description: Automated SQL tests verifying Row-Level Security (RLS) policies per role
-- Roles tested: Admin, Manager, Analyst, Viewer, and Anonymous
-- Tenancy tested: Cross-company isolation between comp-apex-global and comp-novasystems
-- ==============================================================================

BEGIN;

-- Create temporary test schema and mock helpers if auth schema doesn't exist
CREATE SCHEMA IF NOT EXISTS auth;

-- Setup test users
DO $$
BEGIN
    RAISE NOTICE '=== STARTING RLS POLICY VERIFICATION SUITE ===';
END $$;

-- ------------------------------------------------------------------------------
-- 1. Helper function to simulate JWT context in PostgreSQL session
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_test_user(p_uid UUID, p_role TEXT, p_company_id TEXT)
RETURNS void AS $$
BEGIN
    PERFORM set_config('request.jwt.claim.sub', p_uid::text, true);
    PERFORM set_config('request.jwt.claim.role', 'authenticated', true);
    PERFORM set_config(
        'request.jwt.claim.user_metadata',
        json_build_object('role', p_role, 'company_id', p_company_id)::text,
        true
    );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION reset_test_user()
RETURNS void AS $$
BEGIN
    PERFORM set_config('request.jwt.claim.sub', '', true);
    PERFORM set_config('request.jwt.claim.role', 'anon', true);
    PERFORM set_config('request.jwt.claim.user_metadata', '{}', true);
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- 2. Test Fixture Setup
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    v_admin_id UUID := '11111111-1111-1111-1111-111111111111';
    v_manager_apex_id UUID := '22222222-2222-2222-2222-222222222222';
    v_analyst_apex_id UUID := '33333333-3333-3333-3333-333333333333';
    v_viewer_apex_id UUID := '44444444-4444-4444-4444-444444444444';
    v_manager_nova_id UUID := '55555555-5555-5555-5555-555555555555';
BEGIN
    -- Ensure test companies exist
    INSERT INTO public.companies (id, name, industry, employees, it_budget, region)
    VALUES 
        ('comp-apex-global', 'Apex Global Enterprises', 'Manufacturing', 1000, 1500000.00, 'NA'),
        ('comp-novasystems', 'Nova Systems Corp', 'Fintech', 450, 850000.00, 'EMEA')
    ON CONFLICT (id) DO NOTHING;

    -- Setup profiles for test users
    INSERT INTO public.profiles (id, username, full_name, email, role, company_id)
    VALUES
        (v_admin_id, 'test.admin', 'Test Admin', 'admin@platform.com', 'admin', 'comp-apex-global'),
        (v_manager_apex_id, 'test.mgr.apex', 'Apex Manager', 'mgr@apex.com', 'manager', 'comp-apex-global'),
        (v_analyst_apex_id, 'test.analyst.apex', 'Apex Analyst', 'analyst@apex.com', 'analyst', 'comp-apex-global'),
        (v_viewer_apex_id, 'test.viewer.apex', 'Apex Viewer', 'viewer@apex.com', 'viewer', 'comp-apex-global'),
        (v_manager_nova_id, 'test.mgr.nova', 'Nova Manager', 'mgr@nova.com', 'manager', 'comp-novasystems')
    ON CONFLICT (id) DO UPDATE SET
        role = EXCLUDED.role,
        company_id = EXCLUDED.company_id;

    -- Setup test assessment for apex and nova
    INSERT INTO public.assessments (id, title, company_id, infrastructure, status)
    VALUES
        ('asmt-test-apex', 'Apex Test Assessment', 'comp-apex-global', 'Hybrid', 'In Progress'),
        ('asmt-test-nova', 'Nova Test Assessment', 'comp-novasystems', 'Private Cloud', 'Draft')
    ON CONFLICT (id) DO NOTHING;
END $$;

-- ------------------------------------------------------------------------------
-- TEST 1: Anonymous Access Denial
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    PERFORM reset_test_user();
    
    -- Verify anonymous user cannot read company assessments
    SELECT COUNT(*) INTO v_count FROM public.assessments;
    IF v_count > 0 THEN
        RAISE EXCEPTION 'TEST 1 FAILED: Anonymous user should not see private assessments (count was %)', v_count;
    END IF;
    
    RAISE NOTICE 'TEST 1 PASSED: Anonymous access correctly denied for private assessment tables.';
END $$;

-- ------------------------------------------------------------------------------
-- TEST 2: Multi-Tenant Isolation
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    v_nova_id UUID := '55555555-5555-5555-5555-555555555555';
    v_count INTEGER;
BEGIN
    PERFORM set_test_user(v_nova_id, 'manager', 'comp-novasystems');
    
    -- Nova manager should only see Nova assessments, never Apex assessments
    SELECT COUNT(*) INTO v_count FROM public.assessments WHERE company_id = 'comp-apex-global';
    IF v_count > 0 THEN
        RAISE EXCEPTION 'TEST 2 FAILED: Tenant isolation breach: Nova manager saw Apex records (count %)', v_count;
    END IF;

    SELECT COUNT(*) INTO v_count FROM public.assessments WHERE company_id = 'comp-novasystems';
    IF v_count = 0 THEN
        RAISE EXCEPTION 'TEST 2 FAILED: Nova manager should see their own company assessments';
    END IF;

    RAISE NOTICE 'TEST 2 PASSED: Multi-tenant isolation verified between different companies.';
END $$;

-- ------------------------------------------------------------------------------
-- TEST 3: Viewer Role (Read-only access, cannot mutate data)
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    v_viewer_id UUID := '44444444-4444-4444-4444-444444444444';
    v_count INTEGER;
    v_insert_allowed BOOLEAN := false;
BEGIN
    PERFORM set_test_user(v_viewer_id, 'viewer', 'comp-apex-global');
    
    -- Viewer should be able to view their company assessments
    SELECT COUNT(*) INTO v_count FROM public.assessments WHERE id = 'asmt-test-apex';
    IF v_count = 0 THEN
        RAISE EXCEPTION 'TEST 3 FAILED: Viewer should be able to read own company assessment';
    END IF;

    -- Viewer should NOT be able to insert an assessment
    BEGIN
        INSERT INTO public.assessments (id, title, company_id, infrastructure, status)
        VALUES ('asmt-viewer-illegal', 'Illegal Assessment', 'comp-apex-global', 'Hybrid', 'Draft');
        v_insert_allowed := true;
    EXCEPTION WHEN insufficient_privilege OR check_violation THEN
        v_insert_allowed := false;
    END;

    IF v_insert_allowed THEN
        RAISE EXCEPTION 'TEST 3 FAILED: Viewer role was illegally permitted to INSERT assessment!';
    END IF;

    RAISE NOTICE 'TEST 3 PASSED: Viewer role enforces read-only access and blocks mutations.';
END $$;

-- ------------------------------------------------------------------------------
-- TEST 4: Analyst Role (Can manage legacy apps and requirements, cannot change catalog)
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    v_analyst_id UUID := '33333333-3333-3333-3333-333333333333';
    v_catalog_write_allowed BOOLEAN := false;
BEGIN
    PERFORM set_test_user(v_analyst_id, 'analyst', 'comp-apex-global');
    
    -- Analyst CAN add a legacy application to their assessment
    INSERT INTO public.legacy_applications (id, assessment_id, name, criticality)
    VALUES ('leg-app-analyst-test', 'asmt-test-apex', 'Analyst Test Monolith', 'High')
    ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

    -- Analyst CANNOT mutate SaaS catalog products
    BEGIN
        INSERT INTO public.saas_products (id, name, vendor, category, business_function)
        VALUES ('illegal-analyst-prod', 'Illegal Prod', 'Vendor', 'CRM', 'CRM');
        v_catalog_write_allowed := true;
    EXCEPTION WHEN insufficient_privilege OR check_violation THEN
        v_catalog_write_allowed := false;
    END;

    IF v_catalog_write_allowed THEN
        RAISE EXCEPTION 'TEST 4 FAILED: Analyst was illegally permitted to write to SaaS catalog!';
    END IF;

    RAISE NOTICE 'TEST 4 PASSED: Analyst can manage assessment data but cannot modify SaaS catalog.';
END $$;

-- ------------------------------------------------------------------------------
-- TEST 5: Manager Role (Can create and manage migration plans and assessments)
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    v_manager_id UUID := '22222222-2222-2222-2222-222222222222';
    v_count INTEGER;
BEGIN
    PERFORM set_test_user(v_manager_id, 'manager', 'comp-apex-global');
    
    -- Manager CAN create migration plans for their assessment
    INSERT INTO public.migration_plans (id, assessment_id, title, total_phases, overall_progress)
    VALUES ('plan-mgr-test', 'asmt-test-apex', 'Manager Migration Plan', 8, 25.0)
    ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

    SELECT COUNT(*) INTO v_count FROM public.migration_plans WHERE id = 'plan-mgr-test';
    IF v_count = 0 THEN
        RAISE EXCEPTION 'TEST 5 FAILED: Manager should be able to create and read migration plan';
    END IF;

    RAISE NOTICE 'TEST 5 PASSED: Manager role successfully created and managed roadmap plan.';
END $$;

-- ------------------------------------------------------------------------------
-- TEST 6: Admin Role (Full access across tenants and catalog write permission)
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    v_admin_id UUID := '11111111-1111-1111-1111-111111111111';
    v_count INTEGER;
BEGIN
    PERFORM set_test_user(v_admin_id, 'admin', 'comp-apex-global');
    
    -- Admin CAN see all companies and all assessments across tenants
    SELECT COUNT(*) INTO v_count FROM public.assessments;
    IF v_count < 2 THEN
        RAISE EXCEPTION 'TEST 6 FAILED: Admin should see assessments across all tenants (saw %)', v_count;
    END IF;

    -- Admin CAN add products to the SaaS catalog
    INSERT INTO public.saas_products (id, name, vendor, category, business_function, cost_score, scalability_score, security_score, integration_score, features_score)
    VALUES ('admin-test-saas', 'Admin Custom Product', 'Platform Inc', 'ERP', 'ERP Automation', 80, 85, 90, 85, 88)
    ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

    SELECT COUNT(*) INTO v_count FROM public.saas_products WHERE id = 'admin-test-saas';
    IF v_count = 0 THEN
        RAISE EXCEPTION 'TEST 6 FAILED: Admin product was not persisted in SaaS catalog';
    END IF;

    RAISE NOTICE 'TEST 6 PASSED: Admin role verified with full cross-tenant visibility and catalog authority.';
END $$;

DO $$
BEGIN
    RAISE NOTICE '=== ALL 6 RLS TESTS PASSED SUCCESSFULLY! ===';
END $$;

ROLLBACK;
