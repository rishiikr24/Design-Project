-- ==============================================================================
-- Migration: 20261105111500_fix_unique_username_constraint.sql
-- Description:
--   1. Fix duplicate key violation on profiles_username_key during signup.
--      Previously: v_username := split_part(NEW.email, '@', 1);
--      If two users had same prefix (or re-signed up), this threw 23505.
--   2. Drop strict UNIQUE on username or make trigger generate unique handle.
--   3. Ensure ON CONFLICT (id) DO UPDATE works reliably.
-- ==============================================================================

-- Drop the unique constraint on username if it exists, so username collisions do not crash signup
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_username_key;

-- Update trigger function to safely generate username
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
        split_part(NEW.email, '@', 1) || '_' || substr(NEW.id::text, 1, 6)
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

