export const STANDARD_PHASES = [
  {
    sequence: 1,
    name: 'Assessment & Strategy',
    deliverables: 'Architecture gap analysis, stakeholder alignment, governance charter, and TCO baseline.',
    durationMonths: 1.5,
    defaultProgress: 100,
    defaultStatus: 'Completed'
  },
  {
    sequence: 2,
    name: 'SaaS Selection & Procurement',
    deliverables: 'Vendor SLA finalization, contractual data ownership clauses, tenant provisioning, and billing model setup.',
    durationMonths: 1.5,
    defaultProgress: 100,
    defaultStatus: 'Completed'
  },
  {
    sequence: 3,
    name: 'Pilot Testing & PoC',
    deliverables: 'Validation of mission-critical user journeys, sandbox environment validation, and security rule audits.',
    durationMonths: 2.0,
    defaultProgress: 60,
    defaultStatus: 'In Progress'
  },
  {
    sequence: 4,
    name: 'Data Migration & Cleansing',
    deliverables: 'Legacy database ETL scripts, data profiling, schema deduplication, and initial trial cutover dry-runs.',
    durationMonths: 2.5,
    defaultProgress: 35,
    defaultStatus: 'In Progress'
  },
  {
    sequence: 5,
    name: 'Integration & Customization',
    deliverables: 'Enterprise API gateway connectivity, corporate SSO/MFA federation, and bidirectional batch synchronization.',
    durationMonths: 2.0,
    defaultProgress: 0,
    defaultStatus: 'Not Started'
  },
  {
    sequence: 6,
    name: 'Employee Training & Change Management',
    deliverables: 'Department-specific training roadshows, super-user workshops, documentation, and adoption baseline tracking.',
    durationMonths: 1.5,
    defaultProgress: 0,
    defaultStatus: 'Not Started'
  },
  {
    sequence: 7,
    name: 'Deployment & Cutover',
    deliverables: 'Go-live window execution, legacy system read-only lockdown, DNS rerouting, and 24/7 command center standby.',
    durationMonths: 1.0,
    defaultProgress: 0,
    defaultStatus: 'Not Started'
  },
  {
    sequence: 8,
    name: 'Post-Go-Live Monitoring & Optimization',
    deliverables: 'User adoption telemetry tracking, license rightsizing, SLA audits, and continuous optimization reporting.',
    durationMonths: 2.0,
    defaultProgress: 0,
    defaultStatus: 'Not Started'
  }
];

export function calculateOverallProgress(phases = []) {
  if (!phases || phases.length === 0) return 0;
  const total = phases.reduce((acc, p) => acc + (Number(p.progress) || 0), 0);
  return Math.round((total / phases.length) * 10) / 10;
}

export function generateMigrationPlan(_assessment = {}, product = null, risks = [], startDateStr = null) {
  const selectedProduct = product || {
    ID: 'sap-cloud-erp',
    name: 'SAP S/4HANA Cloud',
    migrationComplexity: 'High'
  };

  const hasDataLossRisk = risks.some(r =>
    (r.templateId === 'risk-data-loss' || r.ID === 'risk-data-loss') &&
    (r.severity === 'Critical' || r.severity === 'High')
  );

  const hasIntegrationRisk = risks.some(r =>
    (r.templateId === 'risk-integration' || r.ID === 'risk-integration') &&
    (r.severity === 'Critical' || r.severity === 'High')
  );

  const totalDurationMonths = selectedProduct.migrationComplexity === 'High' ? 14 : 12;

  const baseDate = startDateStr ? new Date(startDateStr) : new Date();
  let runningDate = new Date(baseDate);

  const phases = STANDARD_PHASES.map(sp => {
    const phaseStart = new Date(runningDate);
    const durationDays = Math.round(sp.durationMonths * 30.5);
    runningDate.setDate(runningDate.getDate() + durationDays);
    const phaseEnd = new Date(runningDate);

    let riskFocus = 'Standard execution guidelines.';

    if (sp.sequence === 3 && selectedProduct.migrationComplexity === 'High') {
      riskFocus = 'Extended PoC sandbox duration to resolve High migration complexity.';
    } else if (sp.sequence === 4 && hasDataLossRisk) {
      riskFocus = 'Automated SHA-256 checksum validation and dual-run reconciliation active to prevent data loss.';
    } else if (sp.sequence === 5 && hasIntegrationRisk) {
      riskFocus = 'Prioritize API gateway deployment and automated fallback queues for legacy connectors.';
    }

    return {
      sequence: sp.sequence,
      name: sp.name,
      status: sp.defaultStatus,
      progress: sp.defaultProgress,
      startDate: phaseStart.toISOString().split('T')[0],
      endDate: phaseEnd.toISOString().split('T')[0],
      deliverables: sp.deliverables,
      notes: `Focus for ${selectedProduct.name}: ${sp.deliverables}`,
      riskMitigationFocus: riskFocus
    };
  });

  const overallProgress = calculateOverallProgress(phases);

  return {
    title: `SaaS Transformation Roadmap: ${selectedProduct.name}`,
    selectedProductId: selectedProduct.ID || selectedProduct.id,
    totalPhases: 8,
    overallProgress,
    startDate: baseDate.toISOString().split('T')[0],
    targetEndDate: runningDate.toISOString().split('T')[0],
    estimatedDurationMonths: totalDurationMonths,
    phases
  };
}
