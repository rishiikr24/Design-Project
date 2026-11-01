import { supabase, shouldUseMocks } from '../lib/supabase';
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

    if (!shouldUseMocks()) {
      try {
        const { data, error } = await supabase.functions.invoke('assistant-advisor', {
          body: { question, context }
        });

        if (!error && data && data.answer) {
          return data;
        }
      } catch {
        // Fallback to local intelligence engine
      }
    }

    return answerQuestion(question, context);
  }
};
