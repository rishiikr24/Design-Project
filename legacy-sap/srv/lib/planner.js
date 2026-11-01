/**
 * Pure 8-Phase Transformation Migration Planner Engine
 * Sequences phases, computes timeline dates, injects risk-tailored action items, and calculates progress.
 */

const STANDARD_PHASES = [
  {
    sequence: 1,
    name: 'Assessment & Strategy',
    durationDays: 30,
    deliverables: 'Architecture gap analysis, stakeholder alignment, governance charter, and TCO baseline.',
    defaultStatus: 'Completed',
    defaultProgress: 100
  },
  {
    sequence: 2,
    name: 'SaaS Selection & Procurement',
    durationDays: 30,
    deliverables: 'Vendor RFP response scoring, contract negotiation, SLA guarantee validation, and tenant provisioning.',
    defaultStatus: 'Completed',
    defaultProgress: 100
  },
  {
    sequence: 3,
    name: 'Pilot Testing & Proof of Concept',
    durationDays: 45,
    deliverables: 'Sandbox environment setup, critical user journeys validation, performance benchmarks, and core team sign-off.',
    defaultStatus: 'In Progress',
    defaultProgress: 60
  },
  {
    sequence: 4,
    name: 'Data Migration & Cleansing',
    durationDays: 60,
    deliverables: 'Source data extraction, automated deduplication, schema transformation scripts, and trial dry-run cutovers.',
    defaultStatus: 'In Progress',
    defaultProgress: 35
  },
  {
    sequence: 5,
    name: 'Integration & Customization',
    durationDays: 45,
    deliverables: 'API middleware endpoints, identity provider SSO federation, event-driven webhooks, and boundary system testing.',
    defaultStatus: 'Not Started',
    defaultProgress: 0
  },
  {
    sequence: 6,
    name: 'Employee Training & Change Management',
    durationDays: 30,
    deliverables: 'Role-tailored interactive curriculum, department champion workshops, self-serve knowledge base, and helpdesk readiness.',
    defaultStatus: 'Not Started',
    defaultProgress: 0
  },
  {
    sequence: 7,
    name: 'Full Deployment & Cutover',
    durationDays: 15,
    deliverables: 'Go-live maintenance window execution, DNS rerouting, production data final sync, and warranty hypercare support.',
    defaultStatus: 'Not Started',
    defaultProgress: 0
  },
  {
    sequence: 8,
    name: 'Post-Migration Monitoring & Optimization',
    durationDays: 90,
    deliverables: 'License consumption auditing, telemetry performance monitoring, user feedback loops, and automated SLA compliance reporting.',
    defaultStatus: 'Not Started',
    defaultProgress: 0
  }
];

/**
 * Format date as YYYY-MM-DD
 * @param {Date} date
 * @returns {string}
 */
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

/**
 * Generate an 8-Phase migration plan adapted to assessed risks and selected product
 * @param {Object} assessment
 * @param {Object} product Selected SaaS product
 * @param {Array} risks Assessed risks
 * @param {string|Date} customStartDate
 * @returns {Object} Complete migration plan with sequential dates and risk notes
 */
function generateMigrationPlan(assessment = {}, product = {}, risks = [], customStartDate = null) {
  const startDate = customStartDate ? new Date(customStartDate) : new Date();
  let currentDate = new Date(startDate);

  // Analyze risks to inject customized mitigation notes into respective phases
  const dataLossRisk = risks.find(r => r.templateId === 'risk-data-loss' || r.category === 'Data Governance');
  const integrationRisk = risks.find(r => r.templateId === 'risk-integration' || r.category === 'Integration & Architecture');
  const changeRisk = risks.find(r => r.templateId === 'risk-change-mgmt' || r.category === 'Organizational Change');
  const securityRisk = risks.find(r => r.templateId === 'risk-security-config' || r.category === 'Cybersecurity & Compliance');

  const phases = STANDARD_PHASES.map(basePhase => {
    const phaseStart = new Date(currentDate);
    const phaseEnd = new Date(currentDate);
    phaseEnd.setDate(phaseEnd.getDate() + basePhase.durationDays);

    // Advance currentDate for next phase
    currentDate = new Date(phaseEnd);

    let riskNotes = 'Standard execution guidelines.';
    // Injected risk and product contextual focus (MP-3)
    if (basePhase.sequence === 3 && product.migrationComplexity === 'High') {
      riskNotes = `Extended pilot recommended due to High migration complexity of ${product.name || 'enterprise suite'}.`;
    } else if (basePhase.sequence === 4 && dataLossRisk) {
      riskNotes = `Priority Focus: ${dataLossRisk.mitigation || 'Mandate dual-run reconciliations and cryptographic checksum verification.'}`;
    } else if (basePhase.sequence === 5 && integrationRisk) {
      riskNotes = `Priority Focus: ${integrationRisk.mitigation || 'Enforce API gateway mediation and asynchronous fallback dead-letter queues.'}`;
    } else if (basePhase.sequence === 6 && changeRisk) {
      riskNotes = `Priority Focus: ${changeRisk.mitigation || 'Engage department change advocates and deliver hands-on sandbox labs.'}`;
    } else if (basePhase.sequence === 7 && securityRisk) {
      riskNotes = `Priority Focus: Enforce strict cutover checklist including IP whitelisting, IAM audit, and emergency rollback procedure.`;
    }

    return {
      sequence: basePhase.sequence,
      name: basePhase.name,
      status: basePhase.defaultStatus,
      progress: basePhase.defaultProgress,
      startDate: formatDate(phaseStart),
      endDate: formatDate(phaseEnd),
      deliverables: basePhase.deliverables,
      notes: `Focus for ${product.name || 'Target SaaS'}: ${basePhase.deliverables}`,
      riskMitigationFocus: riskNotes
    };
  });

  const overallProgress = calculateOverallProgress(phases);

  return {
    title: `SaaS Transformation Roadmap: ${product.name || 'Enterprise Cloud'}`,
    selectedProductId: product.id || 'sap-cloud-erp',
    selectedProductName: product.name || 'SAP S/4HANA Cloud',
    totalPhases: 8,
    overallProgress,
    startDate: formatDate(startDate),
    targetEndDate: phases[phases.length - 1].endDate,
    estimatedDurationMonths: 12,
    phases
  };
}

/**
 * Calculate overall migration progress percentage from individual phases
 * @param {Array} phases
 * @returns {number} 0 - 100 rounded to 1 decimal place
 */
function calculateOverallProgress(phases) {
  if (!Array.isArray(phases) || phases.length === 0) return 0;
  const sum = phases.reduce((acc, p) => acc + (Number(p.progress) || 0), 0);
  return Math.round((sum / phases.length) * 10) / 10;
}

module.exports = {
  STANDARD_PHASES,
  generateMigrationPlan,
  calculateOverallProgress
};
