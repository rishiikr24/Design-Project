/**
 * Pure Scoring Logic for SaaS Product Evaluation
 * Strictly decoupled from database dependencies for 100% unit-testability.
 */

const { generateReason } = require('./reasons');

const DEFAULT_WEIGHTS = {
  cost: 20.0,
  security: 30.0,
  scalability: 25.0,
  integration: 15.0,
  features: 10.0
};

/**
 * Validate weights sum to 100
 * @param {Object} weights
 * @returns {boolean}
 */
function validateWeights(weights) {
  if (!weights) return false;
  const sum = (Number(weights.cost) || 0) +
              (Number(weights.security) || 0) +
              (Number(weights.scalability) || 0) +
              (Number(weights.integration) || 0) +
              (Number(weights.features) || 0);
  return Math.abs(sum - 100.0) < 0.01;
}

/**
 * Score a single product against weighted criteria
 * @param {Object} product
 * @param {Object} weights
 * @returns {Object}
 */
function scoreProduct(product, weights = DEFAULT_WEIGHTS) {
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
    costSubScore: Math.round(costSubScore * 100) / 100,
    securitySubScore: Math.round(securitySubScore * 100) / 100,
    scalabilitySubScore: Math.round(scalabilitySubScore * 100) / 100,
    integrationSubScore: Math.round(integrationSubScore * 100) / 100,
    featuresSubScore: Math.round(featuresSubScore * 100) / 100,
    totalScore: Math.round(totalScore * 100) / 100
  };
}

/**
 * Evaluate and rank candidates against an assessment
 * @param {Array} products
 * @param {Object} weights
 * @param {Object} assessment
 * @returns {Array} Ranked evaluation results with reasons
 */
function evaluateProducts(products, weights = DEFAULT_WEIGHTS, assessment = {}) {
  if (!Array.isArray(products) || products.length === 0) {
    return [];
  }

  // Active weights fallback
  const effectiveWeights = validateWeights(weights) ? weights : DEFAULT_WEIGHTS;

  // Filter by target category if specified and not 'All'
  let candidates = products;
  if (assessment.targetCategory && assessment.targetCategory !== 'All') {
    candidates = products.filter(p => p.category.toLowerCase() === assessment.targetCategory.toLowerCase());
    // If no candidate in exact category, fallback to all to ensure recommendations exist
    if (candidates.length === 0) candidates = products;
  }

  const scored = candidates.map(product => {
    const result = scoreProduct(product, effectiveWeights);
    const reason = generateReason(product, result, effectiveWeights, assessment);
    return {
      ...result,
      reason
    };
  });

  // Sort descending by totalScore
  scored.sort((a, b) => b.totalScore - a.totalScore);

  // Assign ranks
  return scored.map((item, index) => ({
    ...item,
    rank: index + 1
  }));
}

module.exports = {
  DEFAULT_WEIGHTS,
  validateWeights,
  scoreProduct,
  evaluateProducts
};
