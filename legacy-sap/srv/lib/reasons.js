/**
 * Explainability & Recommendation Reasoning Generator
 * Produces structured, human-readable rationale linking customer requirements to product features.
 */

function generateReason(product, scores, weights, assessment = {}) {
  const reasons = [];

  // Identify highest weighted criteria
  const weightEntries = [
    { name: 'Security', weight: weights.security, score: scores.securitySubScore },
    { name: 'Scalability', weight: weights.scalability, score: scores.scalabilitySubScore },
    { name: 'Cost', weight: weights.cost, score: scores.costSubScore },
    { name: 'Integration', weight: weights.integration, score: scores.integrationSubScore },
    { name: 'Features', weight: weights.features, score: scores.featuresSubScore }
  ];

  weightEntries.sort((a, b) => b.weight - a.weight);
  const topCriterion = weightEntries[0];

  // Primary justification
  if (topCriterion.score >= 90) {
    reasons.push(`Strong alignment on top-priority criterion ${topCriterion.name} (${topCriterion.weight}% weight) with an outstanding rating of ${topCriterion.score}/100.`);
  } else if (topCriterion.score >= 75) {
    reasons.push(`Satisfactory performance on key priority ${topCriterion.name} (${topCriterion.weight}% weight) scoring ${topCriterion.score}/100.`);
  } else {
    reasons.push(`Moderate fit on priority ${topCriterion.name} (${topCriterion.weight}% weight) scoring ${topCriterion.score}/100.`);
  }

  // Security alignment
  if (assessment.dataSensitivity === 'High') {
    if (scores.securitySubScore >= 92) {
      reasons.push(`Matches High Data Sensitivity mandate with enterprise-grade certifications (${product.securityRating || 'SOC2 / ISO 27001'}).`);
    } else {
      reasons.push(`Requires additional security controls to meet High Data Sensitivity standard.`);
    }
  }

  // Scale alignment
  if (assessment.employees >= 500 || (assessment.growthRate && assessment.growthRate >= 15)) {
    if (scores.scalabilitySubScore >= 90) {
      reasons.push(`Proven multi-tenant elasticity accommodates ${assessment.employees || 500}+ users and expected annual expansion.`);
    }
  }

  // Integration alignment
  if (assessment.legacyAppsCount && assessment.legacyAppsCount >= 3) {
    if (scores.integrationSubScore >= 90) {
      reasons.push(`Comprehensive API coverage (${product.integrationCapability || 'OData / REST'}) minimizes cutover friction across ${assessment.legacyAppsCount} legacy systems.`);
    }
  }

  // Product specific highlights
  if (product.migrationComplexity === 'High') {
    reasons.push(`Note: Involves high migration complexity; phased pilot testing recommended.`);
  } else if (product.migrationComplexity === 'Low') {
    reasons.push(`Advantage: Low migration complexity accelerates time-to-value.`);
  }

  return reasons.join(' ');
}

module.exports = {
  generateReason
};
