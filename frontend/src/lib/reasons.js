export function generateReason(product, scores, weights, assessment = {}) {
  const weightedEntries = [
    { name: 'Cost', score: scores.costSubScore, weight: weights.cost },
    { name: 'Security', score: scores.securitySubScore, weight: weights.security },
    { name: 'Scalability', score: scores.scalabilitySubScore, weight: weights.scalability },
    { name: 'Integration', score: scores.integrationSubScore, weight: weights.integration },
    { name: 'Features', score: scores.featuresSubScore, weight: weights.features }
  ];

  weightedEntries.sort((a, b) => b.weight - a.weight);
  const primaryCriterion = weightedEntries[0];

  let rationale = `Strong alignment on top-priority criterion ${primaryCriterion.name} (${primaryCriterion.weight}% weight) with an outstanding rating of ${primaryCriterion.score}/100.`;

  if (assessment.dataSensitivity === 'High') {
    if (scores.securitySubScore >= 90) {
      rationale += ' Robust compliance alignment to mitigate High Data Sensitivity risk.';
    } else {
      rationale += ' Requires additional security controls to meet High Data Sensitivity standard.';
    }
  }

  if (assessment.employees && Number(assessment.employees) >= 1000) {
    if (scores.scalabilitySubScore >= 90) {
      rationale += ` Scalability profile accommodates ${assessment.employees}+ users.`;
    }
  }

  if (assessment.legacyAppsCount && Number(assessment.legacyAppsCount) >= 3) {
    if (scores.integrationSubScore >= 85) {
      rationale += ` Integration maturity supports migration from ${assessment.legacyAppsCount} legacy systems.`;
    }
  }

  if (product.migrationComplexity === 'High') {
    rationale += ' High migration complexity warrants phased deployment.';
  }

  return rationale;
}

