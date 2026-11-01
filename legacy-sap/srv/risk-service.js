const cds = require('@sap/cds');
const { assessRisks } = require('./lib/risk');

module.exports = cds.service.impl(async function() {
  const { AssessedRisks } = this.entities;
  const db = await cds.connect.to('db');
  const { RiskTemplates, Assessments, LegacyApplications } = db.entities('saas.transformation');

  this.on('assessRisks', async (req) => {
    const { assessmentId } = req.data;
    const assessment = await SELECT.one.from(Assessments).where({ id: assessmentId });
    const legacyApps = await SELECT.from(LegacyApplications).where({ assessment_id: assessmentId });
    const templates = await SELECT.from(RiskTemplates);

    const assessmentContext = {
      ...(assessment || {}),
      legacyAppsCount: legacyApps ? legacyApps.length : 0
    };

    const evaluated = assessRisks(templates, assessmentContext);

    // Delete prior assessed risks for this assessment to keep fresh
    await DELETE.from(AssessedRisks).where({ assessment_id: assessmentId });

    // Persist new assessed risks
    const entries = evaluated.risks.map(r => ({
      id: cds.utils.uuid(),
      assessment_id: assessmentId,
      template_id: r.templateId,
      riskTitle: r.riskTitle,
      category: r.category,
      probability: r.probability,
      impact: r.impact,
      score: r.score,
      severity: r.severity,
      mitigation: r.mitigation,
      adjustedReason: r.adjustedReason
    }));

    if (entries.length > 0) {
      await INSERT.into(AssessedRisks).entries(entries);
    }

    return entries;
  });
});
