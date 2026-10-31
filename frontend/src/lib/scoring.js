import { generateReason } from './reasons';

export const DEFAULT_WEIGHTS = {
  cost: 20.0,
  security: 30.0,
  scalability: 25.0,
  integration: 15.0,
  features: 10.0
};

export function validateWeights(weights) {
  if (!weights) return false;
  const values = [weights.cost, weights.security, weights.scalability, weights.integration, weights.features].map(v => Number(v) || 0);
  if (values.some(v => v < 0 || v > 100)) return false;
  const sum = values.reduce((a, b) => a + b, 0);
  return Math.abs(sum - 100.0) < 0.01;
}

export function scoreProduct(product, weights = DEFAULT_WEIGHTS) {
  const costSubScore = Number(product.costScore) || 70.0;
  const securitySubScore = Number(product.securityScore) || 75.0;
  const scalabilitySubScore = Number(product.scalabilityScore) || 80.0;
  const integrationSubScore = Number(product.integrationScore) || 75.0;
  const featuresSubScore = Number(product.featuresScore) || 80.0;

  const totalScore = (
    (costSubScore * (weights.cost / 100)) +
    (securitySubScore * (weights.security / 100)) +
    (scalabilitySubScore * (weights.scalability / 100)) +
    (integrationSubScore * (weights.integration / 100)) +
    (featuresSubScore * (weights.features / 100))
  );

  return {
    productId: product.ID || product.id,
    productName: product.name,
    vendor: product.vendor,
    category: product.category,
    costSubScore,
    securitySubScore,
    scalabilitySubScore,
    integrationSubScore,
    featuresSubScore,
    totalScore: Math.round(totalScore * 100) / 100
  };
}

export function evaluateProducts(products = [], weights = DEFAULT_WEIGHTS, assessment = {}) {
  if (!Array.isArray(products) || products.length === 0) {
    return [];
  }

  const effectiveWeights = validateWeights(weights) ? weights : DEFAULT_WEIGHTS;

  let candidates = products;
  if (assessment.targetCategory && assessment.targetCategory !== 'All') {
    const filtered = products.filter(
      p => p.category && p.category.toLowerCase() === assessment.targetCategory.toLowerCase()
    );
    if (filtered.length > 0) {
      candidates = filtered;
    }
  }

  const scored = candidates.map(product => {
    const result = scoreProduct(product, effectiveWeights);
    const reason = generateReason(product, result, effectiveWeights, assessment);
    return {
      ...result,
      reason
    };
  });

  scored.sort((a, b) => b.totalScore - a.totalScore);

  return scored.map((item, index) => ({
    ...item,
    rank: index + 1
  }));
}
