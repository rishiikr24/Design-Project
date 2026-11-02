// ==============================================================================
// Supabase Edge Function: dashboard-metrics
// Description: Executive telemetry, TOE readiness aggregation, and KPI roll-up
// Ported from: srv/dashboard-service.js
// ==============================================================================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export function calculateDashboardMetrics({
  assessment = {},
  legacyApplications = [],
  risks = [],
  plan = null,
  topResult = null
}: any) {
  let overallRiskLevel = 'Low';
  if (risks && risks.length > 0) {
    if (risks.some((r: any) => r.severity === 'Critical' || (r.score && r.score >= 16))) {
      overallRiskLevel = 'High';
    } else if (risks.some((r: any) => r.severity === 'High' || (r.score && r.score >= 12))) {
      overallRiskLevel = 'Medium';
    }
  }

  const legacyCount = Array.isArray(legacyApplications) ? legacyApplications.length : 3;

  return {
    readinessScore: Number(assessment?.readinessScore || assessment?.readiness_score) || 78.5,
    toeTechScore: Number(assessment?.toeTechScore || assessment?.toe_tech_score) || 72.0,
    toeOrgScore: Number(assessment?.toeOrgScore || assessment?.toe_org_score) || 80.0,
    toeEnvScore: Number(assessment?.toeEnvScore || assessment?.toe_env_score) || 85.0,
    legacyCount,
    overallRiskLevel,
    migrationProgress: Number(plan?.overallProgress || plan?.overall_progress) || 32.5,
    topProduct: topResult?.productName || topResult?.product_id || topResult?.productId || 'SAP S/4HANA Cloud',
    topScore: Number(topResult?.totalScore || topResult?.total_score) || 91.2,
    adoptionRate: 88.4,
    costEfficiency: 24.6,
    licenseUtilization: 92.1
  };
}

// @ts-ignore: Deno runtime
if (typeof Deno !== 'undefined' && Deno.serve) {
  // @ts-ignore: Deno runtime
  Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    try {
      const body = await req.json();
      const metrics = calculateDashboardMetrics(body);

      return new Response(JSON.stringify(metrics), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  });
}

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  const body = await req.json();
  const metrics = calculateDashboardMetrics(body);
  return new Response(JSON.stringify(metrics), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
