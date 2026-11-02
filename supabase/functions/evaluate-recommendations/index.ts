// ==============================================================================
// Supabase Edge Function: evaluate-recommendations
// Description: Multi-criteria weighted scoring and explainability engine
// Ported from: srv/lib/scoring.js and srv/lib/reasons.js
// ==============================================================================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const DEFAULT_WEIGHTS = {
  cost: 20,
  security: 30,
  scalability: 25,
  integration: 15,
  features: 10
};

export function validateWeights(weights: any = {}) {
  const sum = 
    (Number(weights.cost) || 0) +
    (Number(weights.security) || 0) +
    (Number(weights.scalability) || 0) +
    (Number(weights.integration) || 0) +
    (Number(weights.features) || 0);

  return Math.abs(sum - 100) < 0.001;
}

export function generateReason(product: any, weights = DEFAULT_WEIGHTS, assessmentContext: any = {}) {
  const sortedCriteria = [
    { key: 'Security', weight: weights.security, score: product.securityScore ?? product.security_score },
    { key: 'Scalability', weight: weights.scalability, score: product.scalabilityScore ?? product.scalability_score },
    { key: 'Cost', weight: weights.cost, score: product.costScore ?? product.cost_score },
    { key: 'Integration', weight: weights.integration, score: product.integrationScore ?? product.integration_score },
    { key: 'Features', weight: weights.features, score: product.featuresScore ?? product.features_score }
  ].sort((a, b) => b.weight - a.weight);

  const primary = sortedCriteria[0];
  const secondary = sortedCriteria[1];

  let reason = `Recommended as top choice primarily due to strong alignment with prioritized ${primary.key} requirements (weight ${primary.weight}%, sub-score ${primary.score}/100) and robust ${secondary.key} capabilities (${secondary.score}/100).`;

  if (assessmentContext.dataSensitivity === 'High' && (product.securityScore ?? product.security_score) >= 90) {
    reason += ` High security rating (${product.securityRating || product.security_rating || 'Certified'}) directly satisfies enterprise data sensitivity mandate.`;
  }

  if (assessmentContext.infrastructure === 'On-premise' && (product.integrationScore ?? product.integration_score) >= 85) {
    reason += ` Strong integration index (${product.integrationScore ?? product.integration_score}/100) mitigates legacy on-premise connector risks.`;
  }

  return reason;
}

export function scoreProduct(product: any, weights = DEFAULT_WEIGHTS, assessmentContext: any = {}) {
  const costScore = Number(product.costScore ?? product.cost_score) || 0;
  const securityScore = Number(product.securityScore ?? product.security_score) || 0;
  const scalabilityScore = Number(product.scalabilityScore ?? product.scalability_score) || 0;
  const integrationScore = Number(product.integrationScore ?? product.integration_score) || 0;
  const featuresScore = Number(product.featuresScore ?? product.features_score) || 0;

  const totalScore = Number((
    (costScore * (weights.cost / 100)) +
    (securityScore * (weights.security / 100)) +
    (scalabilityScore * (weights.scalability / 100)) +
    (integrationScore * (weights.integration / 100)) +
    (featuresScore * (weights.features / 100))
  ).toFixed(2));

  const reason = generateReason(product, weights, assessmentContext);

  return {
    productId: product.id || product.ID,
    productName: product.name,
    vendor: product.vendor,
    category: product.category,
    totalScore,
    costSubScore: costScore,
    securitySubScore: securityScore,
    scalabilitySubScore: scalabilityScore,
    integrationSubScore: integrationScore,
    featuresSubScore: featuresScore,
    reason
  };
}

export function evaluateProducts(products: any[] = [], weights = DEFAULT_WEIGHTS, assessmentContext: any = {}) {
  let candidates = [...products];

  if (assessmentContext.targetCategory && assessmentContext.targetCategory !== 'All') {
    candidates = candidates.filter(p => p.category === assessmentContext.targetCategory);
  }

  const scored = candidates.map(p => scoreProduct(p, weights, assessmentContext));

  scored.sort((a, b) => b.totalScore - a.totalScore);

  return scored.map((item, index) => ({
    ...item,
    rank: index + 1
  }));
}

// Edge Function Handler using Deno.serve (standard modern runtime)
// @ts-ignore: Deno runtime
if (typeof Deno !== 'undefined' && Deno.serve) {
  // @ts-ignore: Deno runtime
  Deno.serve(async (req: Request) => {
    // 1. Synchronously respond to CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    try {
      const { products = [], weights = DEFAULT_WEIGHTS, assessmentContext = {} } = await req.json();

      if (!validateWeights(weights)) {
        return new Response(JSON.stringify({ error: 'Criteria weights must total exactly 100%' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const results = evaluateProducts(products, weights, assessmentContext);

      return new Response(JSON.stringify({ results, weights }), {
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
  const { products = [], weights = DEFAULT_WEIGHTS, assessmentContext = {} } = await req.json();
  const results = evaluateProducts(products, weights, assessmentContext);
  return new Response(JSON.stringify({ results, weights }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
