import { supabase, shouldUseMocks } from '../lib/supabase';
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

    if (!shouldUseMocks()) {
      try {
        const { data, error } = await supabase.functions.invoke('dashboard-metrics', {
          body: {
            assessment,
            legacyApplications: assessment?.legacyApplications || [],
            risks: riskData?.risks || [],
            plan,
            topResult: evalData?.results?.[0] || null
          }
        });

        if (!error && data) {
          return {
            assessment,
            legacyCount: data.legacyCount,
            overallRiskLevel: data.overallRiskLevel,
            risks: riskData.risks,
            plan,
            phases: plan.phases,
            recommendations: evalData.results,
            postGoLive: {
              adoptionRate: data.adoptionRate,
              costEfficiency: data.costEfficiency,
              licenseUtilization: data.licenseUtilization
            }
          };
        }
      } catch {
        // Fallback to local aggregation
      }
    }

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
