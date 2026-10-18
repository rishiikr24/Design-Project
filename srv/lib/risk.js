/**
 * Pure Rule-based Risk Assessment Engine
 * Maps enterprise assessment parameters and seeded templates to calibrated probabilities and impacts.
 */

/**
 * Determine severity classification from calculated risk score (P x I)
 * @param {number} score (1 to 25)
 * @returns {string} Critical | High | Medium | Low
 */
function getSeverity(score) {
  if (score >= 16) return 'Critical';
  if (score >= 12) return 'High';
  if (score >= 6) return 'Medium';
  return 'Low';
}

/**
 * Assess and adjust risks based on organizational inputs
 * @param {Array} templates Seeded risk templates
 * @param {Object} assessment Assessment context (dataSensitivity, infrastructure, legacyAppsCount, employees, itBudget)
 * @returns {Object} Assessed risks list, overall risk level, budgetFit
 */
function assessRisks(templates, assessment = {}) {
  if (!Array.isArray(templates) || templates.length === 0) {
    return {
      risks: [],
      overallRiskLevel: 'Low',
      summary: { critical: 0, high: 0, medium: 0, low: 0 }
    };
  }

  const legacyCount = Number(assessment.legacyAppsCount) || 
                      (Array.isArray(assessment.legacyApplications) ? assessment.legacyApplications.length : 0);
  const dataSensitivity = assessment.dataSensitivity || 'Medium';
  const infrastructure = assessment.infrastructure || 'On-premise';
  const employees = Number(assessment.employees) || 500;
  const painPoints = (assessment.painPoints || '').toLowerCase();

  const assessed = templates.map(tmpl => {
    let prob = tmpl.baseProbability || 3;
    let impact = tmpl.baseImpact || 3;
    const adjustments = [];
    const tid = tmpl.ID || tmpl.id;

    // Rule 1: High data sensitivity raises data loss and security risks
    if (tid === 'risk-data-loss' && dataSensitivity === 'High') {
      prob = Math.min(5, prob + 1);
      adjustments.push('Elevated probability due to High Data Sensitivity classification.');
    }
    if (tid === 'risk-security-config' && dataSensitivity === 'High') {
      prob = Math.min(5, prob + 1);
      adjustments.push('Regulatory compliance exposure increases probability of misconfiguration audit impact.');
    }

    // Rule 2: Legacy system volume and pure On-Premise infrastructure elevates integration and migration failure
    if (tmpl.id === 'risk-integration') {
      if (infrastructure.toLowerCase().includes('on-premise')) {
        prob = Math.min(5, prob + 1);
        adjustments.push('Pure on-premise footprint requires legacy protocol bridging.');
      }
      if (legacyCount >= 4) {
        prob = Math.min(5, prob + 1);
        adjustments.push(`Multiple legacy systems (${legacyCount}) compound interface complexity.`);
      }
    }

    if (tmpl.id === 'risk-data-loss' && legacyCount >= 4) {
      impact = Math.min(5, impact + 1);
      adjustments.push(`High volume of legacy databases (${legacyCount}) heightens business disruption impact.`);
    }

    // Rule 3: Employee scale & organizational change fatigue
    if (tmpl.id === 'risk-change-mgmt') {
      if (employees >= 800) {
        prob = Math.min(5, prob + 1);
        adjustments.push(`Substantial workforce (${employees} employees) increases change resistance risk.`);
      }
      if (painPoints.includes('training') || painPoints.includes('resistance') || painPoints.includes('silo')) {
        impact = Math.min(5, impact + 1);
        adjustments.push('Prior organizational silos/training hurdles cited in enterprise pain points.');
      }
    }

    // Rule 4: Vendor Lock-in
    if (tmpl.id === 'risk-vendor-lockin') {
      if (assessment.targetCategory === 'ERP') {
        impact = Math.min(5, impact + 1);
        adjustments.push('Core ERP replacement creates deep structural dependency.');
      }
    }

    const score = prob * impact;
    const severity = getSeverity(score);

    return {
      templateId: tmpl.id,
      riskTitle: tmpl.riskTitle,
      category: tmpl.category,
      probability: prob,
      impact: impact,
      score: score,
      severity: severity,
      mitigation: tmpl.defaultMitigation,
      adjustedReason: adjustments.length > 0 ? adjustments.join(' ') : 'Baseline standard enterprise risk profile.'
    };
  });

  // Calculate summary and overall risk
  const summary = {
    critical: assessed.filter(r => r.severity === 'Critical').length,
    high: assessed.filter(r => r.severity === 'High').length,
    medium: assessed.filter(r => r.severity === 'Medium').length,
    low: assessed.filter(r => r.severity === 'Low').length
  };

  const maxScore = Math.max(...assessed.map(r => r.score));
  const avgScore = assessed.reduce((sum, r) => sum + r.score, 0) / (assessed.length || 1);

  let overallRiskLevel = 'Low';
  if (summary.critical > 0 || maxScore >= 16 || avgScore >= 12) {
    overallRiskLevel = 'High';
  } else if (summary.high > 0 || maxScore >= 10 || avgScore >= 8) {
    overallRiskLevel = 'Medium';
  }

  // Cost and budget fit analysis (RA-4)
  const itBudget = Number(assessment.itBudget) || 1000000;
  let budgetFit = 'Adequate';
  let budgetNotes = 'Annual IT budget provides sufficient room for transition capital expenditures.';
  if (itBudget < 500000 && employees > 500) {
    budgetFit = 'Constrained';
    budgetNotes = 'IT budget is tight relative to workforce scale; recommend multi-year phased rollout to smooth licensing spikes.';
  } else if (itBudget >= 1500000) {
    budgetFit = 'Optimal';
    budgetNotes = 'Strong capital capacity enables accelerated parallel testing and premier implementation support.';
  }

  return {
    risks: assessed,
    overallRiskLevel,
    summary,
    budgetAnalysis: {
      budgetFit,
      itBudget,
      notes: budgetNotes
    }
  };
}

module.exports = {
  getSeverity,
  assessRisks
};
