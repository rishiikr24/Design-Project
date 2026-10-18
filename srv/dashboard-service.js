const cds = require('@sap/cds');

module.exports = cds.service.impl(async function() {
  const db = await cds.connect.to('db');
  const { Assessments, LegacyApplications, AssessedRisks, MigrationPlans, EvaluationResults } = db.entities('saas.transformation');

  this.on('getMetrics', async (req) => {
    const { assessmentId } = req.data;
    const assessment = await SELECT.one.from(Assessments).where({ id: assessmentId });
    const legacyApps = await SELECT.from(LegacyApplications).where({ assessment_id: assessmentId });
    const risks = await SELECT.from(AssessedRisks).where({ assessment_id: assessmentId });
    const plan = await SELECT.one.from(MigrationPlans).where({ assessment_id: assessmentId });
    const topResult = await SELECT.one.from(EvaluationResults).orderBy('rank asc');

    // Risk level derivation
    let overallRiskLevel = 'Low';
    if (risks && risks.length > 0) {
      if (risks.some(r => r.severity === 'Critical')) overallRiskLevel = 'High';
      else if (risks.some(r => r.severity === 'High')) overallRiskLevel = 'Medium';
    }

    return {
      readinessScore: assessment ? assessment.readinessScore : 78.5,
      toeTechScore: assessment ? assessment.toeTechScore : 72.0,
      toeOrgScore: assessment ? assessment.toeOrgScore : 80.0,
      toeEnvScore: assessment ? assessment.toeEnvScore : 85.0,
      legacyCount: legacyApps ? legacyApps.length : 3,
      overallRiskLevel,
      migrationProgress: plan ? plan.overallProgress : 32.5,
      topProduct: topResult ? topResult.product_id : 'SAP S/4HANA Cloud',
      topScore: topResult ? topResult.totalScore : 91.2,
      adoptionRate: 88.4,
      costEfficiency: 24.6,
      licenseUtilization: 92.1
    };
  });
});
