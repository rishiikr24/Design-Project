import { supabase, shouldUseMocks } from '../lib/supabase';
import { catalogService } from './catalogService';
import { assessmentService } from './assessmentService';
import { evaluateProducts, DEFAULT_WEIGHTS } from '../lib/scoring';

export const recommendationService = {
  async evaluate({ assessmentId = 'assessment-ref-case', weights = DEFAULT_WEIGHTS }) {
    const products = await catalogService.getProducts();
    const assessment = await assessmentService.getAssessmentById(assessmentId);

    const assessmentContext = {
      ...assessment,
      legacyAppsCount: (assessment.legacyApplications || []).length
    };

    if (!shouldUseMocks()) {
      try {
        const { data, error } = await supabase.functions.invoke('evaluate-recommendations', {
          body: { products, weights, assessmentContext }
        });

        if (!error && data && data.results) {
          return {
            weights: data.weights || weights,
            results: data.results
          };
        }
      } catch {
        // Fallback to pure local scoring engine
      }
    }

    const results = evaluateProducts(products, weights, assessmentContext);

    return {
      weights,
      results
    };
  }
};
