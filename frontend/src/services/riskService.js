import riskTemplates from '../data/riskTemplates.json';
import { assessmentService } from './assessmentService';
import { assessRisks } from '../lib/risk';

export const riskService = {
  async assessRisks(assessmentId = 'assessment-ref-case') {
    const assessment = await assessmentService.getAssessmentById(assessmentId);
    const assessmentContext = {
      ...assessment,
      legacyAppsCount: (assessment.legacyApplications || []).length
    };

    return assessRisks(riskTemplates, assessmentContext);
  }
};

