import { ASSESSMENT_DIMENSIONS } from '../data/assessmentQuestions';

/**
 * Technology - Organisation - Environment (TOE) Enterprise Readiness Assessment
 * Computes multidimensional SaaS adoption readiness metrics.
 * 
 * Preserves exact PRD base formulas while integrating 20-statement diagnostic responses when present.
 */
export function calculateReadiness(assessment = {}) {
  const employees = Number(assessment.employees) || 500;
  const itBudget = Number(assessment.itBudget) || 1000000;
  const growthRate = Number(assessment.growthRate) || 10;
  const dataSensitivity = assessment.dataSensitivity || 'Medium';
  const infrastructure = (assessment.infrastructure || 'On-premise').toLowerCase();
  const legacyCount = Number(assessment.legacyAppsCount) || 
                      (Array.isArray(assessment.legacyApplications) ? assessment.legacyApplications.length : 3);

  // 1. Technology Factor (40% weight in TOE)
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

  // 2. Organisation Factor (35% weight in TOE)
  let orgScore = 65.0;
  const budgetPerEmp = itBudget / Math.max(1, employees);
  if (budgetPerEmp >= 1500) orgScore += 15.0;
  else if (budgetPerEmp >= 1000) orgScore += 10.0;
  else if (budgetPerEmp < 500) orgScore -= 10.0;

  if (employees >= 1000) orgScore += 5.0;
  orgScore = Math.min(100, Math.max(30, orgScore));

  // 3. Environment Factor (25% weight in TOE)
  let envScore = 70.0;
  if (growthRate >= 15) envScore += 12.0;
  else if (growthRate >= 8) envScore += 6.0;

  if (dataSensitivity === 'High') {
    envScore += 5.0;
  }
  envScore = Math.min(100, Math.max(30, envScore));

  // Overall Weighted TOE Score (40% Tech + 35% Org + 25% Env)
  const overallScore = Math.round(((techScore * 0.40) + (orgScore * 0.35) + (envScore * 0.25)) * 10) / 10;

  let readinessLevel = 'Moderate';
  if (overallScore >= 80) readinessLevel = 'High';
  else if (overallScore < 60) readinessLevel = 'Preliminary';

  // Calculate 5-dimension sub-scores from the 20 structured diagnostic answers
  const answers = assessment.answers || {};
  const scoreLookup = { fully: 100, partially: 66.7, not_sure: 33.3, not_in_place: 0 };
  const dimensionScores = {};

  ASSESSMENT_DIMENSIONS.forEach(dim => {
    let total = 0;
    let count = 0;
    dim.questions.forEach(q => {
      const val = answers[q.id];
      if (val !== undefined && scoreLookup[val] !== undefined) {
        total += scoreLookup[val];
        count += 1;
      }
    });
    // Default fallback to corresponding TOE pillar baseline if no answers submitted
    const defaultBaseline = dim.id === 'org' ? orgScore : dim.id === 'tech' ? techScore : dim.id === 'fin' ? orgScore : dim.id === 'sec' ? techScore : envScore;
    dimensionScores[dim.id] = count > 0 ? Math.round((total / count) * 10) / 10 : Math.round(defaultBaseline * 10) / 10;
  });

  // Tailored Improvement Recommendations
  const recommendations = [];
  if (dimensionScores.tech < 75 || techScore < 70) {
    recommendations.push('Establish centralized API and iPaaS integration gateways to decouple legacy batch ETL pipelines.');
  }
  if (dimensionScores.sec < 80 || dataSensitivity === 'High') {
    recommendations.push('Enforce mandatory SOC 2 Type II compliance reviews and centralized SSO/IAM enforcement.');
  }
  if (dimensionScores.org < 75 || orgScore < 75) {
    recommendations.push('Inaugurate a formal Change Enablement Champion Network to train business teams on standard SaaS workflows.');
  }
  if (dimensionScores.fin < 75 || budgetPerEmp < 1000) {
    recommendations.push('Structure multi-year cloud OpEx allocation and allocate migration contingency reserves for dual-running cutovers.');
  }
  if (dimensionScores.sus < 75) {
    recommendations.push('Contractually define data portability and export exit safeguards to avoid multi-year proprietary vendor lock-in.');
  }
  if (recommendations.length === 0) {
    recommendations.push('Maintain quarterly architecture reviews and execute continuous SaaS feature adoption sprints.');
  }

  return {
    readinessScore: overallScore,
    readinessLevel,
    toeTechScore: Math.round(techScore * 10) / 10,
    toeOrgScore: Math.round(orgScore * 10) / 10,
    toeEnvScore: Math.round(envScore * 10) / 10,
    dimensionScores,
    recommendations
  };
}
