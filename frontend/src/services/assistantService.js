import { dashboardService } from './dashboardService';
import { answerQuestion } from '../lib/assistant';

export const assistantService = {
  async askQuestion(question, assessmentId = 'assessment-ref-case') {
    const dashboard = await dashboardService.getDashboardMetrics(assessmentId);
    const context = {
      assessment: dashboard.assessment,
      results: dashboard.recommendations,
      risks: dashboard.risks,
      plan: dashboard.plan
    };

    return answerQuestion(question, context);
  }
};

