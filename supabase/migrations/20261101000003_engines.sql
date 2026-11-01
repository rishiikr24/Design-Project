-- ==============================================================================
-- Migration: 20261101000003_engines.sql
-- Description: Core analytical calculation functions ported from srv/lib
-- ==============================================================================

-- 1. Multi-Criteria Weighted Scoring Function
CREATE OR REPLACE FUNCTION public.calculate_weighted_score(
    p_cost NUMERIC,
    p_security NUMERIC,
    p_scalability NUMERIC,
    p_integration NUMERIC,
    p_features NUMERIC,
    p_weights JSONB DEFAULT '{"cost": 20, "security": 30, "scalability": 25, "integration": 15, "features": 10}'::jsonb
)
RETURNS NUMERIC(5, 2)
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    v_w_cost NUMERIC := COALESCE((p_weights->>'cost')::numeric, 20.0) / 100.0;
    v_w_sec NUMERIC := COALESCE((p_weights->>'security')::numeric, 30.0) / 100.0;
    v_w_scale NUMERIC := COALESCE((p_weights->>'scalability')::numeric, 25.0) / 100.0;
    v_w_int NUMERIC := COALESCE((p_weights->>'integration')::numeric, 15.0) / 100.0;
    v_w_feat NUMERIC := COALESCE((p_weights->>'features')::numeric, 10.0) / 100.0;
    v_total NUMERIC;
BEGIN
    v_total := (COALESCE(p_cost, 0) * v_w_cost) +
               (COALESCE(p_security, 0) * v_w_sec) +
               (COALESCE(p_scalability, 0) * v_w_scale) +
               (COALESCE(p_integration, 0) * v_w_int) +
               (COALESCE(p_features, 0) * v_w_feat);

    RETURN ROUND(v_total, 2);
END;
$$;

-- 2. Risk Severity Threshold Function
CREATE OR REPLACE FUNCTION public.get_risk_severity(p_score INTEGER)
RETURNS VARCHAR(20)
LANGUAGE sql
IMMUTABLE
AS $$
    SELECT CASE
        WHEN p_score >= 16 THEN 'Critical'
        WHEN p_score >= 12 THEN 'High'
        WHEN p_score >= 6 THEN 'Medium'
        ELSE 'Low'
    END;
$$;

-- 3. Consolidated Dashboard KPI Roll-up Function
CREATE OR REPLACE FUNCTION public.get_assessment_kpi_metrics(p_assessment_id TEXT)
RETURNS TABLE (
    assessment_id TEXT,
    title VARCHAR(150),
    readiness_score NUMERIC(5, 2),
    toe_tech_score NUMERIC(5, 2),
    toe_org_score NUMERIC(5, 2),
    toe_env_score NUMERIC(5, 2),
    legacy_count INTEGER,
    risk_count INTEGER,
    overall_risk_level TEXT,
    migration_progress NUMERIC(5, 2)
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN QUERY
    WITH r_summary AS (
        SELECT 
            assessment_id AS aid,
            COUNT(*) AS total_risks,
            BOOL_OR(severity = 'Critical') AS has_critical,
            BOOL_OR(severity = 'High') AS has_high
        FROM public.assessed_risks
        WHERE assessment_id = p_assessment_id
        GROUP BY assessment_id
    ),
    l_summary AS (
        SELECT 
            assessment_id AS aid,
            COUNT(*)::INTEGER AS total_legacy
        FROM public.legacy_applications
        WHERE assessment_id = p_assessment_id
        GROUP BY assessment_id
    ),
    p_summary AS (
        SELECT 
            assessment_id AS aid,
            COALESCE(overall_progress, 0.0) AS prog
        FROM public.migration_plans
        WHERE assessment_id = p_assessment_id
        LIMIT 1
    )
    SELECT 
        a.id AS assessment_id,
        a.title,
        a.readiness_score,
        a.toe_tech_score,
        a.toe_org_score,
        a.toe_env_score,
        COALESCE(l.total_legacy, 0)::INTEGER AS legacy_count,
        COALESCE(r.total_risks, 0)::INTEGER AS risk_count,
        CASE 
            WHEN r.has_critical THEN 'High'
            WHEN r.has_high THEN 'Medium'
            ELSE 'Low'
        END AS overall_risk_level,
        COALESCE(p.prog, 0.0) AS migration_progress
    FROM public.assessments a
    LEFT JOIN l_summary l ON l.aid = a.id
    LEFT JOIN r_summary r ON r.aid = a.id
    LEFT JOIN p_summary p ON p.aid = a.id
    WHERE a.id = p_assessment_id;
END;
$$;

