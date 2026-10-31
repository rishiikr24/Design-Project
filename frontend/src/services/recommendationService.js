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

    const results = evaluateProducts(products, weights, assessmentContext);

    return {
      weights,
      results
    };
  }
};

