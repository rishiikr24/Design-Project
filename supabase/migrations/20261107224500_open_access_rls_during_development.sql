-- ==============================================================================
-- Migration: 20261107224500_open_access_rls_during_development.sql
-- Description:
--   During development / prototype evaluation, role-based gating and login
--   are bypassed in the frontend, so requests use the Supabase public anon client.
--   This migration permits anon/authenticated write access on companies,
--   assessments, legacy_applications, requirements, assessed_risks, and
--   migration_plans/phases so all forms and CRUD operations succeed without
--   "new row violates row-level security policy" errors.
-- ==============================================================================

-- 1. Companies Table Policies
DROP POLICY IF EXISTS "Allow read company for members or admin" ON public.companies;
DROP POLICY IF EXISTS "Allow admin write for companies" ON public.companies;
DROP POLICY IF EXISTS "Allow public read for companies" ON public.companies;
DROP POLICY IF EXISTS "Allow public write for companies" ON public.companies;

CREATE POLICY "Allow public read for companies"
    ON public.companies FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Allow public write for companies"
    ON public.companies FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

-- 2. Assessments Table Policies
DROP POLICY IF EXISTS "Allow read assessment for company members or admin" ON public.assessments;
DROP POLICY IF EXISTS "Allow analyst or above write for assessment" ON public.assessments;
DROP POLICY IF EXISTS "Allow public read for assessments" ON public.assessments;
DROP POLICY IF EXISTS "Allow public write for assessments" ON public.assessments;

CREATE POLICY "Allow public read for assessments"
    ON public.assessments FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Allow public write for assessments"
    ON public.assessments FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

-- 3. Legacy Applications Table Policies
DROP POLICY IF EXISTS "Allow public read for legacy_applications" ON public.legacy_applications;
DROP POLICY IF EXISTS "Allow public write for legacy_applications" ON public.legacy_applications;

CREATE POLICY "Allow public read for legacy_applications"
    ON public.legacy_applications FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Allow public write for legacy_applications"
    ON public.legacy_applications FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

-- 4. Requirements Table Policies
DROP POLICY IF EXISTS "Allow public read for requirements" ON public.requirements;
DROP POLICY IF EXISTS "Allow public write for requirements" ON public.requirements;

CREATE POLICY "Allow public read for requirements"
    ON public.requirements FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Allow public write for requirements"
    ON public.requirements FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

-- 5. Assessed Risks Table Policies
DROP POLICY IF EXISTS "Allow public read for assessed_risks" ON public.assessed_risks;
DROP POLICY IF EXISTS "Allow public write for assessed_risks" ON public.assessed_risks;

CREATE POLICY "Allow public read for assessed_risks"
    ON public.assessed_risks FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Allow public write for assessed_risks"
    ON public.assessed_risks FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

-- 6. Migration Plans & Phases Table Policies
DROP POLICY IF EXISTS "Allow public read for migration_plans" ON public.migration_plans;
DROP POLICY IF EXISTS "Allow public write for migration_plans" ON public.migration_plans;
DROP POLICY IF EXISTS "Allow public read for migration_phases" ON public.migration_phases;
DROP POLICY IF EXISTS "Allow public write for migration_phases" ON public.migration_phases;

CREATE POLICY "Allow public read for migration_plans"
    ON public.migration_plans FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Allow public write for migration_plans"
    ON public.migration_plans FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow public read for migration_phases"
    ON public.migration_phases FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Allow public write for migration_phases"
    ON public.migration_phases FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

-- 7. Profiles Table Policies
DROP POLICY IF EXISTS "Allow public read for profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public write for profiles" ON public.profiles;

CREATE POLICY "Allow public read for profiles"
    ON public.profiles FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Allow public write for profiles"
    ON public.profiles FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

