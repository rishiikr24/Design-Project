import { supabase, shouldUseMocks } from '../lib/supabase';
import { dashboardService } from './dashboardService';
import { answerQuestion } from '../lib/assistant';
import { getActiveAssessmentId } from '../lib/activeAssessment';

export const assistantService = {
  async askQuestion(question, assessmentId = getActiveAssessmentId()) {
    const dashboard = await dashboardService.getDashboardMetrics(assessmentId);
    if (!dashboard || !dashboard.assessment) {
      return {
        answer: "No active transformation assessment data found. Please complete the Enterprise Readiness Assessment wizard first so I can analyze your organization's readiness scores, risks, and migration roadmap.",
        suggestedQuestions: [
          "What is the Enterprise Readiness Assessment?",
          "How does the TOE Framework evaluate readiness?",
          "How do I create a new assessment?"
        ],
        category: 'Assessment Required'
      };
    }

    const context = {
      assessment: dashboard.assessment,
      results: dashboard.recommendations || [],
      risks: dashboard.risks || [],
      plan: dashboard.plan || {}
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
