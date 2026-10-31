export function getSeverity(score) {
  if (score >= 16) return 'Critical';
  if (score >= 12) return 'High';
  if (score >= 6) return 'Medium';
  return 'Low';
}

export function assessRisks(templates = [], assessment = {}) {
  const infra = (assessment.infrastructure || 'On-premise').toLowerCase();
  const legacyAppsCount = Number(assessment.legacyAppsCount) || 3;
  const sensitivity = assessment.dataSensitivity || 'Medium';

  let criticalCount = 0;
  let highCount = 0;
  let mediumCount = 0;
  let lowCount = 0;

  const evaluatedRisks = templates.map(template => {
    let prob = Number(template.baseProbability) || 3;
    let imp = Number(template.baseImpact) || 3;
    let adjustReasons = [];

    const tid = template.ID || template.id;

    if (tid === 'risk-data-loss') {
      if (sensitivity === 'High') {
        prob = Math.min(5, prob + 1);
        adjustReasons.push('Elevated probability due to High Data Sensitivity classification.');
      }
      if (legacyAppsCount >= 4) {
        adjustReasons.push(`High volume of legacy databases (${legacyAppsCount}) heightens business disruption impact.`);
      }
    }

    if (tid === 'risk-integration') {
      if (infra.includes('on-premise')) {
        prob = Math.min(5, prob + 1);
        adjustReasons.push('On-premise legacy infrastructure increases integration friction.');
      }
      if (legacyAppsCount >= 4) {
        prob = Math.min(5, prob + 1);
        adjustReasons.push('High count of legacy monoliths elevates integration failure risk.');
      }
    }

    if (tid === 'risk-change-mgmt') {
      const employees = Number(assessment.employees) || 500;
      if (employees >= 1000) {
        prob = Math.min(5, prob + 1);
        adjustReasons.push('Large enterprise headcount (1000+) requires robust change management.');
      }
    }

    if (tid === 'risk-security-config') {
      if (sensitivity === 'High') {
        imp = Math.min(5, imp + 1);
        adjustReasons.push('Data sensitivity amplifies fallout of misconfiguration.');
      }
    }

    const score = prob * imp;
    const severity = getSeverity(score);

    if (severity === 'Critical') criticalCount++;
    else if (severity === 'High') highCount++;
    else if (severity === 'Medium') mediumCount++;
    else lowCount++;

    return {
      templateId: tid,
      riskTitle: template.riskTitle,
      category: template.category,
      probability: prob,
      impact: imp,
      score,
      severity,
      mitigation: template.defaultMitigation,
      adjustedReason: adjustReasons.length > 0 ? adjustReasons.join(' ') : 'Baseline risk rating based on standard industry metrics.'
    };
  });

  let overallRiskLevel = 'Low';
  if (criticalCount >= 1 || highCount >= 3) {
    overallRiskLevel = 'High';
  } else if (highCount >= 1 || mediumCount >= 2) {
    overallRiskLevel = 'Medium';
  }

  let budgetFit = 'Adequate';
  let budgetNotes = 'Allocated budget supports standard transformation roadmap.';
  const budget = Number(assessment.itBudget) || 1000000;
  if (budget >= 1500000) {
    budgetFit = 'Optimal';
    budgetNotes = 'Strong capital capacity enables accelerated parallel testing and premier implementation support.';
  } else if (budget < 500000) {
    budgetFit = 'Constrained';
    budgetNotes = 'Budget constraints require phasing rollout over a longer horizon to control capital outlays.';
  }

  return {
    risks: evaluatedRisks,
    overallRiskLevel,
    summary: {
      critical: criticalCount,
      high: highCount,
      medium: mediumCount,
      low: lowCount
    },
    budgetAnalysis: {
      budgetFit,
      itBudget: budget,
      notes: budgetNotes
    }
  };
}

