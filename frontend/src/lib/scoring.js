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
  const sum = (Number(weights.cost) || 0) +
              (Number(weights.security) || 0) +
              (Number(weights.scalability) || 0) +
              (Number(weights.integration) || 0) +
              (Number(weights.features) || 0);
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
  let eligibleProducts = [...products];

  if (assessment.targetCategory && assessment.targetCategory !== 'All') {
    eligibleProducts = eligibleProducts.filter(p =>
      (p.category || '').toLowerCase() === assessment.targetCategory.toLowerCase()
    );
  }

  const scored = eligibleProducts.map(product => {
    const scoredItem = scoreProduct(product, weights);
    const reason = generateReason(product, scoredItem, weights, assessment);
    return {
      ...scoredItem,
      reason
    };
  });

  scored.sort((a, b) => b.totalScore - a.totalScore);

  return scored.map((item, index) => ({
    ...item,
    rank: index + 1
  }));
}

