const cds = require('@sap/cds');
const { calculateReadiness } = require('./lib/readiness');

module.exports = cds.service.impl(async function() {
  const { Assessments } = this.entities;

  // Compute TOE readiness before creating or updating assessment
  this.before(['CREATE', 'UPDATE'], 'Assessments', async (req) => {
    const data = req.data;
    const readiness = calculateReadiness(data);
    data.readinessScore = readiness.readinessScore;
    data.toeTechScore = readiness.toeTechScore;
    data.toeOrgScore = readiness.toeOrgScore;
    data.toeEnvScore = readiness.toeEnvScore;
  });

  this.on('calculateReadiness', async (req) => {
    const { assessmentId } = req.data;
    const assessment = await SELECT.one.from(Assessments).where({ id: assessmentId });
    if (!assessment) req.error(404, `Assessment ${assessmentId} not found`);
    return calculateReadiness(assessment);
  });
});
