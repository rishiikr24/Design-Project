-- ==============================================================================
-- Migration: 20261101000002_auth_rls.sql
-- Description: Profiles, Role-Based Access Control (RBAC), and Row Level Security (RLS)
-- Based on: xs-security.json scopes ($XSAPPNAME.Admin, Manager, Analyst, Viewer)
-- ==============================================================================

-- ==============================================================================
-- 1. Profiles Table (Linked to Supabase auth.users)
-- ==============================================================================

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

CREATE TRIGGER trg_profiles_modified_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_modified_at_column();

CREATE INDEX IF NOT EXISTS idx_profiles_company ON public.profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- ==============================================================================
-- 2. Auth Helper Functions (SECURITY DEFINER for safe RLS evaluation)
-- ==============================================================================

-- 2.1 Get Current User Role (Normalized to lowercase)
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT LOWER(COALESCE(
        (SELECT role FROM public.profiles WHERE id = auth.uid()),
        (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role',
        'viewer'
    ));
$$;

-- 2.2 Get Current User Company ID
CREATE OR REPLACE FUNCTION public.get_auth_company_id()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT COALESCE(
        (SELECT company_id FROM public.profiles WHERE id = auth.uid()),
        (auth.jwt() ->> 'user_metadata')::jsonb ->> 'company_id'
    );
$$;

-- 2.3 Role Hierarchy Helper Functions
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
    SELECT public.get_auth_role() = 'admin';
$$;

CREATE OR REPLACE FUNCTION public.is_manager()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
    SELECT public.get_auth_role() IN ('admin', 'manager');
$$;

CREATE OR REPLACE FUNCTION public.is_analyst()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
    SELECT public.get_auth_role() IN ('admin', 'manager', 'analyst');
$$;

-- ==============================================================================
-- 3. Trigger for Automatic Profile Creation on Signup
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_role TEXT;
    v_company TEXT;
    v_full_name TEXT;
    v_username TEXT;
BEGIN
    v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'viewer');
    v_company := COALESCE(NEW.raw_user_meta_data->>'company_id', 'comp-apex-global');
    v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));
    v_username := COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1));

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
        role = EXCLUDED.role,
        company_id = EXCLUDED.company_id,
        modified_at = clock_timestamp();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to auth.users if auth schema exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    END IF;
END $$;

-- ==============================================================================
-- 4. Enable Row Level Security (RLS) on All Tables
-- ==============================================================================
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legacy_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saas_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_capabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.criteria_weights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluation_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessed_risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.migration_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.migration_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistant_messages ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 5. Row Level Security Policies
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 5.1 SaaS Catalog & Risk Templates (Public Read for Authenticated, Write for Admin)
-- ------------------------------------------------------------------------------
-- saas_products
CREATE POLICY "Allow authenticated read for saas_products"
    ON public.saas_products FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow admin write for saas_products"
    ON public.saas_products FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- product_capabilities
CREATE POLICY "Allow authenticated read for product_capabilities"
    ON public.product_capabilities FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow admin write for product_capabilities"
    ON public.product_capabilities FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- risk_templates
CREATE POLICY "Allow authenticated read for risk_templates"
    ON public.risk_templates FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow admin write for risk_templates"
    ON public.risk_templates FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 5.2 Companies Table
-- ------------------------------------------------------------------------------
CREATE POLICY "Allow read company for members or admin"
    ON public.companies FOR SELECT
    TO authenticated
    USING (public.is_admin() OR id = public.get_auth_company_id());

CREATE POLICY "Allow admin write for companies"
    ON public.companies FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 5.3 Profiles & UserProfiles Tables
-- ------------------------------------------------------------------------------
CREATE POLICY "Allow user read profiles in same company or self or admin"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (
        public.is_admin() OR 
        id = auth.uid() OR 
        company_id = public.get_auth_company_id()
    );

CREATE POLICY "Allow user update self or admin update all profiles"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (public.is_admin() OR id = auth.uid())
    WITH CHECK (public.is_admin() OR id = auth.uid());

CREATE POLICY "Allow admin delete profiles"
    ON public.profiles FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- Legacy user_profiles table policy
CREATE POLICY "Allow read user_profiles for company members or admin"
    ON public.user_profiles FOR SELECT
    TO authenticated
    USING (public.is_admin() OR company_id = public.get_auth_company_id());

CREATE POLICY "Allow admin manage user_profiles"
    ON public.user_profiles FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 5.4 Assessments Table
-- ------------------------------------------------------------------------------
CREATE POLICY "Allow select assessments for company or admin"
    ON public.assessments FOR SELECT
    TO authenticated
    USING (public.is_admin() OR company_id = public.get_auth_company_id());

CREATE POLICY "Allow analyst and manager insert assessment"
    ON public.assessments FOR INSERT
    TO authenticated
    WITH CHECK (
        public.is_analyst() AND 
        (public.is_admin() OR company_id = public.get_auth_company_id())
    );

CREATE POLICY "Allow analyst and manager update assessment"
    ON public.assessments FOR UPDATE
    TO authenticated
    USING (
        public.is_analyst() AND 
        (public.is_admin() OR company_id = public.get_auth_company_id())
    )
    WITH CHECK (
        public.is_analyst() AND 
        (public.is_admin() OR company_id = public.get_auth_company_id())
    );

CREATE POLICY "Allow manager and admin delete assessment"
    ON public.assessments FOR DELETE
    TO authenticated
    USING (
        public.is_manager() AND 
        (public.is_admin() OR company_id = public.get_auth_company_id())
    );

-- ------------------------------------------------------------------------------
-- 5.5 Assessment Compositions (LegacyApplications & Requirements)
-- ------------------------------------------------------------------------------
-- legacy_applications
CREATE POLICY "Allow select legacy_applications for company or admin"
    ON public.legacy_applications FOR SELECT
    TO authenticated
    USING (
        public.is_admin() OR 
        assessment_id IN (SELECT id FROM public.assessments WHERE company_id = public.get_auth_company_id())
    );

CREATE POLICY "Allow analyst and manager manage legacy_applications"
    ON public.legacy_applications FOR ALL
    TO authenticated
    USING (
        public.is_analyst() AND (
            public.is_admin() OR 
            assessment_id IN (SELECT id FROM public.assessments WHERE company_id = public.get_auth_company_id())
        )
    )
    WITH CHECK (
        public.is_analyst() AND (
            public.is_admin() OR 
            assessment_id IN (SELECT id FROM public.assessments WHERE company_id = public.get_auth_company_id())
        )
    );

-- requirements
CREATE POLICY "Allow select requirements for company or admin"
    ON public.requirements FOR SELECT
    TO authenticated
    USING (
        public.is_admin() OR 
        assessment_id IN (SELECT id FROM public.assessments WHERE company_id = public.get_auth_company_id())
    );

CREATE POLICY "Allow analyst and manager manage requirements"
    ON public.requirements FOR ALL
    TO authenticated
    USING (
        public.is_analyst() AND (
            public.is_admin() OR 
            assessment_id IN (SELECT id FROM public.assessments WHERE company_id = public.get_auth_company_id())
        )
    )
    WITH CHECK (
        public.is_analyst() AND (
            public.is_admin() OR 
            assessment_id IN (SELECT id FROM public.assessments WHERE company_id = public.get_auth_company_id())
        )
    );

-- ------------------------------------------------------------------------------
-- 5.6 Evaluations, CriteriaWeights, EvaluationResults
-- ------------------------------------------------------------------------------
-- evaluations
CREATE POLICY "Allow select evaluations for company or admin"
    ON public.evaluations FOR SELECT
    TO authenticated
    USING (
        public.is_admin() OR 
        assessment_id IN (SELECT id FROM public.assessments WHERE company_id = public.get_auth_company_id())
    );

CREATE POLICY "Allow analyst and manager manage evaluations"
    ON public.evaluations FOR ALL
    TO authenticated
    USING (
        public.is_analyst() AND (
            public.is_admin() OR 
            assessment_id IN (SELECT id FROM public.assessments WHERE company_id = public.get_auth_company_id())
        )
    )
    WITH CHECK (
        public.is_analyst() AND (
            public.is_admin() OR 
            assessment_id IN (SELECT id FROM public.assessments WHERE company_id = public.get_auth_company_id())
        )
    );

-- criteria_weights
CREATE POLICY "Allow select criteria_weights for company or admin"
    ON public.criteria_weights FOR SELECT
    TO authenticated
    USING (
        public.is_admin() OR 
        evaluation_id IN (
            SELECT e.id FROM public.evaluations e
            JOIN public.assessments a ON e.assessment_id = a.id
            WHERE a.company_id = public.get_auth_company_id()
        )
    );

CREATE POLICY "Allow analyst and manager manage criteria_weights"
    ON public.criteria_weights FOR ALL
    TO authenticated
    USING (
        public.is_analyst() AND (
            public.is_admin() OR 
            evaluation_id IN (
                SELECT e.id FROM public.evaluations e
                JOIN public.assessments a ON e.assessment_id = a.id
                WHERE a.company_id = public.get_auth_company_id()
            )
        )
    )
    WITH CHECK (
        public.is_analyst() AND (
            public.is_admin() OR 
            evaluation_id IN (
                SELECT e.id FROM public.evaluations e
                JOIN public.assessments a ON e.assessment_id = a.id
                WHERE a.company_id = public.get_auth_company_id()
            )
        )
    );

-- evaluation_results
CREATE POLICY "Allow select evaluation_results for company or admin"
    ON public.evaluation_results FOR SELECT
    TO authenticated
    USING (
        public.is_admin() OR 
        evaluation_id IN (
            SELECT e.id FROM public.evaluations e
            JOIN public.assessments a ON e.assessment_id = a.id
            WHERE a.company_id = public.get_auth_company_id()
        )
    );

CREATE POLICY "Allow analyst and manager manage evaluation_results"
    ON public.evaluation_results FOR ALL
    TO authenticated
    USING (
        public.is_analyst() AND (
            public.is_admin() OR 
            evaluation_id IN (
                SELECT e.id FROM public.evaluations e
                JOIN public.assessments a ON e.assessment_id = a.id
                WHERE a.company_id = public.get_auth_company_id()
            )
        )
    )
    WITH CHECK (
        public.is_analyst() AND (
            public.is_admin() OR 
            evaluation_id IN (
                SELECT e.id FROM public.evaluations e
                JOIN public.assessments a ON e.assessment_id = a.id
                WHERE a.company_id = public.get_auth_company_id()
            )
        )
    );

-- ------------------------------------------------------------------------------
-- 5.7 AssessedRisks Table
-- ------------------------------------------------------------------------------
CREATE POLICY "Allow select assessed_risks for company or admin"
    ON public.assessed_risks FOR SELECT
    TO authenticated
    USING (
        public.is_admin() OR 
        assessment_id IN (SELECT id FROM public.assessments WHERE company_id = public.get_auth_company_id())
    );

CREATE POLICY "Allow analyst and manager manage assessed_risks"
    ON public.assessed_risks FOR ALL
    TO authenticated
    USING (
        public.is_analyst() AND (
            public.is_admin() OR 
            assessment_id IN (SELECT id FROM public.assessments WHERE company_id = public.get_auth_company_id())
        )
    )
    WITH CHECK (
        public.is_analyst() AND (
            public.is_admin() OR 
            assessment_id IN (SELECT id FROM public.assessments WHERE company_id = public.get_auth_company_id())
        )
    );

-- ------------------------------------------------------------------------------
-- 5.8 MigrationPlans & MigrationPhases (Manager/Admin write, Viewer read)
-- ------------------------------------------------------------------------------
-- migration_plans
CREATE POLICY "Allow select migration_plans for company or admin"
    ON public.migration_plans FOR SELECT
    TO authenticated
    USING (
        public.is_admin() OR 
        assessment_id IN (SELECT id FROM public.assessments WHERE company_id = public.get_auth_company_id())
    );

CREATE POLICY "Allow manager and admin manage migration_plans"
    ON public.migration_plans FOR ALL
    TO authenticated
    USING (
        public.is_manager() AND (
            public.is_admin() OR 
            assessment_id IN (SELECT id FROM public.assessments WHERE company_id = public.get_auth_company_id())
        )
    )
    WITH CHECK (
        public.is_manager() AND (
            public.is_admin() OR 
            assessment_id IN (SELECT id FROM public.assessments WHERE company_id = public.get_auth_company_id())
        )
    );

-- migration_phases
CREATE POLICY "Allow select migration_phases for company or admin"
    ON public.migration_phases FOR SELECT
    TO authenticated
    USING (
        public.is_admin() OR 
        plan_id IN (
            SELECT p.id FROM public.migration_plans p
            JOIN public.assessments a ON p.assessment_id = a.id
            WHERE a.company_id = public.get_auth_company_id()
        )
    );

CREATE POLICY "Allow manager and admin manage migration_phases"
    ON public.migration_phases FOR ALL
    TO authenticated
    USING (
        public.is_manager() AND (
            public.is_admin() OR 
            plan_id IN (
                SELECT p.id FROM public.migration_plans p
                JOIN public.assessments a ON p.assessment_id = a.id
                WHERE a.company_id = public.get_auth_company_id()
            )
        )
    )
    WITH CHECK (
        public.is_manager() AND (
            public.is_admin() OR 
            plan_id IN (
                SELECT p.id FROM public.migration_plans p
                JOIN public.assessments a ON p.assessment_id = a.id
                WHERE a.company_id = public.get_auth_company_id()
            )
        )
    );

-- ------------------------------------------------------------------------------
-- 5.9 AssistantMessages
-- ------------------------------------------------------------------------------
CREATE POLICY "Allow select assistant_messages for company or admin"
    ON public.assistant_messages FOR SELECT
    TO authenticated
    USING (
        public.is_admin() OR 
        assessment_id IN (SELECT id FROM public.assessments WHERE company_id = public.get_auth_company_id())
    );

CREATE POLICY "Allow analyst and manager insert assistant_messages"
    ON public.assistant_messages FOR INSERT
    TO authenticated
    WITH CHECK (
        public.is_analyst() AND (
            public.is_admin() OR 
            assessment_id IN (SELECT id FROM public.assessments WHERE company_id = public.get_auth_company_id())
        )
    );
