/**
 * Technology - Organisation - Environment (TOE) Enterprise Readiness Assessment
 * Computes multidimensional SaaS adoption readiness metrics.
 */

function calculateReadiness(assessment = {}) {
  const employees = Number(assessment.employees) || 500;
  const itBudget = Number(assessment.itBudget) || 1000000;
  const growthRate = Number(assessment.growthRate) || 10;
  const dataSensitivity = assessment.dataSensitivity || 'Medium';
  const infrastructure = (assessment.infrastructure || 'On-premise').toLowerCase();
  const legacyCount = Number(assessment.legacyAppsCount) || 
                      (Array.isArray(assessment.legacyApplications) ? assessment.legacyApplications.length : 3);

  // 1. Technology Factor (40% weight)
  // Evaluates current infra agility and legacy technical debt
  let techScore = 70.0;
  if (infrastructure.includes('hybrid') || infrastructure.includes('private cloud')) {
    techScore += 12.0;
  } else if (infrastructure.includes('colocated')) {
    techScore += 5.0;
  } else {
    // pure on-premise
    techScore -= 5.0;
  }

  // legacy debt penalty
  if (legacyCount <= 2) techScore += 8.0;
  else if (legacyCount >= 5) techScore -= 10.0;
  techScore = Math.min(100, Math.max(30, techScore));

  // 2. Organisation Factor (35% weight)
  // Evaluates financial runway and IT spend per employee
  let orgScore = 65.0;
  const budgetPerEmp = itBudget / Math.max(1, employees);
  if (budgetPerEmp >= 1500) orgScore += 15.0;
  else if (budgetPerEmp >= 1000) orgScore += 10.0;
  else if (budgetPerEmp < 500) orgScore -= 10.0;

  // team scale
  if (employees >= 1000) orgScore += 5.0; // established enterprise structure
  orgScore = Math.min(100, Math.max(30, orgScore));

  // 3. Environment Factor (25% weight)
  // Evaluates market expansion and compliance pressure
  let envScore = 70.0;
  if (growthRate >= 15) envScore += 12.0;
  else if (growthRate >= 8) envScore += 6.0;

  if (dataSensitivity === 'High') {
    // high sensitivity requires stricter governance but incentivizes modern SaaS security
    envScore += 5.0;
  }
  envScore = Math.min(100, Math.max(30, envScore));

  // Overall Weighted TOE Score
  const overallScore = Math.round(((techScore * 0.40) + (orgScore * 0.35) + (envScore * 0.25)) * 10) / 10;

  let readinessLevel = 'Moderate';
  if (overallScore >= 80) readinessLevel = 'High';
  else if (overallScore < 60) readinessLevel = 'Preliminary';

  return {
    readinessScore: overallScore,
    readinessLevel,
    toeTechScore: Math.round(techScore * 10) / 10,
    toeOrgScore: Math.round(orgScore * 10) / 10,
    toeEnvScore: Math.round(envScore * 10) / 10
  };
}

module.exports = {
  calculateReadiness
};
