const cds = require('@sap/cds');
const { evaluateProducts, DEFAULT_WEIGHTS } = require('./lib/scoring');

module.exports = cds.service.impl(async function() {
  const { Evaluations, EvaluationResults, CriteriaWeights } = this.entities;
  const db = await cds.connect.to('db');
  const { SaaSProducts, Assessments } = db.entities('saas.transformation');

  this.on('evaluate', async (req) => {
    const { assessmentId, weights } = req.data;
    const effectiveWeights = weights || DEFAULT_WEIGHTS;

    const assessment = await SELECT.one.from(Assessments).where({ id: assessmentId });
    const products = await SELECT.from(SaaSProducts).where({ status: 'Active' });

    const scoredResults = evaluateProducts(products, effectiveWeights, assessment || {});

    // Save evaluation record
    const evaluationId = cds.utils.uuid();
    await INSERT.into(Evaluations).entries({
      id: evaluationId,
      assessment_id: assessmentId,
      evaluationDate: new Date().toISOString(),
      status: 'Completed'
    });

    await INSERT.into(CriteriaWeights).entries({
      id: cds.utils.uuid(),
      evaluation_id: evaluationId,
      costWeight: effectiveWeights.cost,
      securityWeight: effectiveWeights.security,
      scalabilityWeight: effectiveWeights.scalability,
      integrationWeight: effectiveWeights.integration,
      featuresWeight: effectiveWeights.features
    });

    // Save results
    const resultsToInsert = scoredResults.map(sr => ({
      id: cds.utils.uuid(),
      evaluation_id: evaluationId,
      product_id: sr.productId,
      totalScore: sr.totalScore,
      costSubScore: sr.costSubScore,
      securitySubScore: sr.securitySubScore,
      scalabilitySubScore: sr.scalabilitySubScore,
      integrationSubScore: sr.integrationSubScore,
      featuresSubScore: sr.featuresSubScore,
      rank: sr.rank,
      reason: sr.reason
    }));

    await INSERT.into(EvaluationResults).entries(resultsToInsert);

    return scoredResults;
  });
});
