import { assessmentService } from './assessmentService';
import { recommendationService } from './recommendationService';
import { riskService } from './riskService';
import { plannerService } from './plannerService';
import referenceCase from '../data/referenceCase.json';

export const dashboardService = {
  async getDashboardMetrics(assessmentId = 'assessment-ref-case') {
    const assessment = await assessmentService.getAssessmentById(assessmentId);
    const evalData = await recommendationService.evaluate({ assessmentId });
    const riskData = await riskService.assessRisks(assessmentId);
    const plan = await plannerService.getPlan({ assessmentId });

    return {
      assessment,
      legacyCount: (assessment.legacyApplications || []).length,
      overallRiskLevel: riskData.overallRiskLevel,
      risks: riskData.risks,
      plan,
      phases: plan.phases,
      recommendations: evalData.results,
      postGoLive: referenceCase.postGoLive
    };
  },

  async seedReferenceCase() {
    await assessmentService.saveAssessment(referenceCase.assessment);
    await plannerService.getPlan({ assessmentId: 'assessment-ref-case', productId: 'sap-cloud-erp' });
    return {
      success: true,
      message: 'Reference case successfully initialized',
      assessmentId: 'assessment-ref-case'
    };
  }
};

