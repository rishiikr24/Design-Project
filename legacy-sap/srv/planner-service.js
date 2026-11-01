const cds = require('@sap/cds');
const { generateMigrationPlan, calculateOverallProgress } = require('./lib/planner');

module.exports = cds.service.impl(async function() {
  const { MigrationPlans, MigrationPhases } = this.entities;
  const db = await cds.connect.to('db');
  const { Assessments, SaaSProducts, AssessedRisks } = db.entities('saas.transformation');

  this.on('generatePlan', async (req) => {
    const { assessmentId, productId } = req.data;
    const assessment = await SELECT.one.from(Assessments).where({ id: assessmentId });
    const product = await SELECT.one.from(SaaSProducts).where({ id: productId || 'sap-cloud-erp' });
    const risks = await SELECT.from(AssessedRisks).where({ assessment_id: assessmentId });

    const planData = generateMigrationPlan(assessment || {}, product || {}, risks || []);

    const planId = cds.utils.uuid();
    const planRecord = {
      id: planId,
      assessment_id: assessmentId,
      selectedProduct_id: product ? product.id : null,
      title: planData.title,
      totalPhases: planData.totalPhases,
      overallProgress: planData.overallProgress,
      startDate: planData.startDate,
      targetEndDate: planData.targetEndDate,
      estimatedDurationMonths: planData.estimatedDurationMonths
    };

    await INSERT.into(MigrationPlans).entries(planRecord);

    const phasesToInsert = planData.phases.map(p => ({
      id: cds.utils.uuid(),
      plan_id: planId,
      sequence: p.sequence,
      name: p.name,
      status: p.status,
      progress: p.progress,
      startDate: p.startDate,
      endDate: p.endDate,
      deliverables: p.deliverables,
      notes: p.notes,
      riskMitigationFocus: p.riskMitigationFocus
    }));

    await INSERT.into(MigrationPhases).entries(phasesToInsert);

    planRecord.phases = phasesToInsert;
    return planRecord;
  });

  this.on('updatePhase', async (req) => {
    const { phaseId, status, progress } = req.data;
    await UPDATE(MigrationPhases).set({ status, progress }).where({ id: phaseId });
    const phase = await SELECT.one.from(MigrationPhases).where({ id: phaseId });

    if (phase && phase.plan_id) {
      const allPhases = await SELECT.from(MigrationPhases).where({ plan_id: phase.plan_id });
      const newOverall = calculateOverallProgress(allPhases);
      await UPDATE(MigrationPlans).set({ overallProgress: newOverall }).where({ id: phase.plan_id });
    }

    return phase;
  });
});
