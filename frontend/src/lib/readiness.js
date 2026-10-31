export function calculateReadiness(assessment = {}) {
  const employees = Number(assessment.employees) || 500;
  const itBudget = Number(assessment.itBudget) || 1000000;
  const growthRate = Number(assessment.growthRate) || 10;
  const dataSensitivity = assessment.dataSensitivity || 'Medium';
  const infrastructure = (assessment.infrastructure || 'On-premise').toLowerCase();
  const legacyCount = Number(assessment.legacyAppsCount) || 
                      (Array.isArray(assessment.legacyApplications) ? assessment.legacyApplications.length : 3);

  // 1. Technology Factor (40% weight)
  let techScore = 70.0;
  if (infrastructure.includes('hybrid') || infrastructure.includes('private cloud')) {
    techScore += 12.0;
  } else if (infrastructure.includes('colocated')) {
    techScore += 5.0;
  } else {
    techScore -= 5.0;
  }

  if (legacyCount <= 2) techScore += 8.0;
  else if (legacyCount >= 5) techScore -= 10.0;
  techScore = Math.min(100, Math.max(30, techScore));

  // 2. Organisation Factor (35% weight)
  let orgScore = 65.0;
  const budgetPerEmp = itBudget / Math.max(1, employees);
  if (budgetPerEmp >= 1500) orgScore += 15.0;
  else if (budgetPerEmp >= 1000) orgScore += 10.0;
  else if (budgetPerEmp < 500) orgScore -= 10.0;

  if (employees >= 1000) orgScore += 5.0;
  orgScore = Math.min(100, Math.max(30, orgScore));

  // 3. Environment Factor (25% weight)
  let envScore = 70.0;
  if (growthRate >= 15) envScore += 12.0;
  else if (growthRate >= 8) envScore += 6.0;

  if (dataSensitivity === 'High') {
    envScore += 5.0;
  }
  envScore = Math.min(100, Math.max(30, envScore));

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

