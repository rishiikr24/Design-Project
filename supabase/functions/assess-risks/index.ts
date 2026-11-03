// ==============================================================================
// Supabase Edge Function: assess-risks
// Description: Rule-based risk assessment engine and severity threshold mapping
// Ported from: srv/lib/risk.js
// ==============================================================================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export function getSeverity(score: number): 'Critical' | 'High' | 'Medium' | 'Low' {
  if (score >= 16) return 'Critical';
  if (score >= 12) return 'High';
  if (score >= 6) return 'Medium';
  return 'Low';
}

export function assessRisks(templates: any[] = [], assessment: any = {}) {
  if (!Array.isArray(templates) || templates.length === 0) {
    return {
      risks: [],
      overallRiskLevel: 'Low',
      summary: { critical: 0, high: 0, medium: 0, low: 0 }
    };
  }

  const legacyCount = Number(assessment.legacyAppsCount) || 
                      (Array.isArray(assessment.legacyApplications) ? assessment.legacyApplications.length : 0);
  const dataSensitivity = assessment.dataSensitivity || 'Medium';
  const infrastructure = assessment.infrastructure || 'On-premise';
  const employees = Number(assessment.employees) || 500;
  const painPoints = (assessment.painPoints || '').toLowerCase();

  const assessed = templates.map(tmpl => {
    let prob = tmpl.baseProbability || tmpl.base_probability || 3;
    let impact = tmpl.baseImpact || tmpl.base_impact || 3;
    const adjustments: string[] = [];
    const tid = tmpl.id || tmpl.ID;

    // Rule 1: High data sensitivity raises data loss and security risks
    if (tid === 'risk-data-loss' && dataSensitivity === 'High') {
      prob = Math.min(5, prob + 1);
      adjustments.push('Elevated probability due to High Data Sensitivity classification.');
    }
    if (tid === 'risk-security-config' && dataSensitivity === 'High') {
      prob = Math.min(5, prob + 1);
      adjustments.push('Regulatory compliance exposure increases probability of misconfiguration audit impact.');
    }

    // Rule 2: Legacy system volume and pure On-Premise infrastructure elevates integration and migration failure
    if (tid === 'risk-integration') {
      if (infrastructure.toLowerCase().includes('on-premise')) {
        prob = Math.min(5, prob + 1);
        adjustments.push('Pure on-premise footprint requires legacy protocol bridging.');
      }
      if (legacyCount >= 4) {
        prob = Math.min(5, prob + 1);
        adjustments.push(`Multiple legacy systems (${legacyCount}) compound interface complexity.`);
      }
    }

    if (tid === 'risk-data-loss' && legacyCount >= 4) {
      impact = Math.min(5, impact + 1);
      adjustments.push(`High volume of legacy databases (${legacyCount}) heightens business disruption impact.`);
    }

    // Rule 3: Large enterprise employee count creates change friction
    if (tid === 'risk-change-mgmt' && employees > 500) {
      prob = Math.min(5, prob + 1);
      adjustments.push(`Large workforce scale (${employees} users) amplifies change resistance probability.`);
    }

    // Rule 4: Cost/vendor friction in pain points
    if (tid === 'risk-vendor-lockin' && (painPoints.includes('cost') || painPoints.includes('lock-in') || painPoints.includes('proprietary'))) {
      impact = Math.min(5, impact + 1);
      adjustments.push('Current operational friction cites cost and proprietary dependencies.');
    }

    const score = prob * impact;
    const severity = getSeverity(score);

    return {
      templateId: tid,
      riskTitle: tmpl.riskTitle || tmpl.risk_title || tmpl.name,
      category: tmpl.category,
      probability: prob,
      impact,
      score,
      severity,
      mitigation: tmpl.defaultMitigation || tmpl.default_mitigation || tmpl.mitigation,
      adjustedReason: adjustments.length > 0 ? adjustments.join(' ') : 'Standard baseline risk parameters apply.'
    };
  });

  assessed.sort((a, b) => b.score - a.score);

  const summary = {
    critical: assessed.filter(r => r.severity === 'Critical').length,
    high: assessed.filter(r => r.severity === 'High').length,
    medium: assessed.filter(r => r.severity === 'Medium').length,
    low: assessed.filter(r => r.severity === 'Low').length
  };

  const maxScore = Math.max(...assessed.map(r => r.score));
  const avgScore = assessed.reduce((sum, r) => sum + r.score, 0) / (assessed.length || 1);

  let overallRiskLevel: 'Critical' | 'High' | 'Medium' | 'Low' = 'Low';
  if (summary.critical > 0 || maxScore >= 16 || avgScore >= 12) {
    overallRiskLevel = 'High';
  } else if (summary.high > 0 || maxScore >= 10 || avgScore >= 8) {
    overallRiskLevel = 'Medium';
  }

  const itBudget = Number(assessment.itBudget || assessment.it_budget) || 1000000;
  let budgetFit = 'Adequate';
  let budgetNotes = 'Allocated budget supports standard transformation roadmap.';

  if (itBudget < 500000) {
    budgetFit = 'Constrained';
    budgetNotes = 'IT budget is tight relative to workforce scale; recommend multi-year phased rollout to smooth licensing spikes.';
  } else if (itBudget >= 1500000) {
    budgetFit = 'Optimal';
    budgetNotes = 'Strong capital capacity enables accelerated parallel testing and premier implementation support.';
  }

  return {
    risks: assessed,
    overallRiskLevel,
    summary,
    budgetAnalysis: {
      budgetFit,
      itBudget,
      notes: budgetNotes
    }
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
      const { templates = [], assessmentContext = {} } = await req.json();
      const result = assessRisks(templates, assessmentContext);

      return new Response(JSON.stringify(result), {
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
  const { templates = [], assessmentContext = {} } = await req.json();
  const result = assessRisks(templates, assessmentContext);
  return new Response(JSON.stringify(result), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
