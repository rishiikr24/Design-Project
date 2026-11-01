const cds = require('@sap/cds');
const { answerQuestion } = require('./lib/assistant');

module.exports = cds.service.impl(async function() {
  const { AssistantMessages } = this.entities;
  const db = await cds.connect.to('db');
  const { Assessments, AssessedRisks, MigrationPlans, EvaluationResults } = db.entities('saas.transformation');

  this.on('askAssistant', async (req) => {
    const { assessmentId, question } = req.data;
    const assessment = await SELECT.one.from(Assessments).where({ id: assessmentId });
    const risks = await SELECT.from(AssessedRisks).where({ assessment_id: assessmentId });
    const plan = await SELECT.one.from(MigrationPlans).where({ assessment_id: assessmentId });
    const results = await SELECT.from(EvaluationResults).orderBy('rank asc');

    const context = {
      assessment: assessment || {},
      risks: risks || [],
      plan: plan || {},
      results: results || []
    };

    const response = answerQuestion(question, context);

    // Persist conversation history
    if (assessmentId) {
      await INSERT.into(AssistantMessages).entries([
        {
          id: cds.utils.uuid(),
          assessment_id: assessmentId,
          sender: 'user',
          messageText: question,
          timestamp: new Date().toISOString()
        },
        {
          id: cds.utils.uuid(),
          assessment_id: assessmentId,
          sender: 'assistant',
          messageText: response.answer,
          timestamp: new Date().toISOString()
        }
      ]);
    }

    return response;
  });
});
