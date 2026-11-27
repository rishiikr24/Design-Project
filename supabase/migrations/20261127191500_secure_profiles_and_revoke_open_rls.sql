-- ==============================================================================
-- UNVERIFIED: apply via Supabase SQL Editor
-- Migration: 20261127191500_secure_profiles_and_revoke_open_rls.sql
-- Description:
--   1. Revokes and drops any temporary/development public open-access policies
--      that allow anonymous or unauthenticated writes across application tables.
--   2. Restricts public.profiles updates so non-admin users can update their
--      own contact info (e.g., full_name, username) but cannot alter their
--      own 'role' or 'company_id'.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Revoke / Drop all open-access policies if present
-- ------------------------------------------------------------------------------
DO $$
BEGIN
    -- Companies
    DROP POLICY IF EXISTS "Allow public write for companies" ON public.companies;
    
    -- Assessments
    DROP POLICY IF EXISTS "Allow public write for assessments" ON public.assessments;
    
    -- Legacy Applications
    DROP POLICY IF EXISTS "Allow public write for legacy_applications" ON public.legacy_applications;
    
    -- Requirements
    DROP POLICY IF EXISTS "Allow public write for requirements" ON public.requirements;
    
    -- Assessed Risks
    DROP POLICY IF EXISTS "Allow public write for assessed_risks" ON public.assessed_risks;
    
    -- Migration Plans & Phases
    DROP POLICY IF EXISTS "Allow public write for migration_plans" ON public.migration_plans;
    DROP POLICY IF EXISTS "Allow public write for migration_phases" ON public.migration_phases;
    
    -- Profiles
    DROP POLICY IF EXISTS "Allow public write for profiles" ON public.profiles;
END $$;

-- ------------------------------------------------------------------------------
-- 2. Restrict Profile Updates in RLS
-- ------------------------------------------------------------------------------
-- Drop existing broad user update policy if it exists
DROP POLICY IF EXISTS "Allow user update self or admin update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated self update on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow admin update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow user update own safe profile fields" ON public.profiles;

-- Admin can update any profile column
CREATE POLICY "Allow admin update all profiles"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Non-admin users can only update their own profile without altering role or company_id
CREATE POLICY "Allow user update own safe profile fields"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (
        id = auth.uid() AND
        (
            public.is_admin() OR
            (
                role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()) AND
                company_id IS NOT DISTINCT FROM (SELECT p.company_id FROM public.profiles p WHERE p.id = auth.uid())
            )
        )
    );

-- ------------------------------------------------------------------------------
-- 3. Database Trigger Guard: Prevent non-admin modification of role or company_id
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_profile_privileges()
RETURNS TRIGGER AS $$
BEGIN
    -- Only admin can modify role or company_id after profile creation
    IF NOT public.is_admin() THEN
        IF NEW.role IS DISTINCT FROM OLD.role THEN
            RAISE EXCEPTION 'Non-admin users cannot alter their role (attempted % -> %)', OLD.role, NEW.role;
        END IF;
        IF NEW.company_id IS DISTINCT FROM OLD.company_id THEN
            RAISE EXCEPTION 'Non-admin users cannot alter their company_id (attempted % -> %)', OLD.company_id, NEW.company_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_profile_privileges ON public.profiles;
CREATE TRIGGER trg_protect_profile_privileges
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.protect_profile_privileges();
