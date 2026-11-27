import { supabase, shouldUseMocks } from '../lib/supabase';
import { assessmentService } from './assessmentService';
import { recommendationService } from './recommendationService';
import { riskService } from './riskService';
import { plannerService } from './plannerService';
import referenceCase from '../data/referenceCase.json';
import { getActiveAssessmentId } from '../lib/activeAssessment';

export const dashboardService = {
  async getDashboardMetrics(assessmentId = getActiveAssessmentId()) {
    if (!assessmentId) return null;
    const assessment = await assessmentService.getAssessmentById(assessmentId);
    if (!assessment) {
      return null;
    }
    const evalData = (await recommendationService.evaluate({ assessmentId })) || { results: [] };
    const riskData = (await riskService.assessRisks(assessmentId)) || { risks: [], overallRiskLevel: 'Low' };
    const plan = (await plannerService.getPlan({ assessmentId })) || { phases: [] };

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
            legacyCount: data.legacyCount ?? (assessment.legacyApplications || []).length,
            overallRiskLevel: data.overallRiskLevel || riskData.overallRiskLevel || 'Low',
            risks: riskData.risks || [],
            plan,
            phases: plan.phases || [],
            recommendations: evalData.results || [],
            postGoLive: {
              adoptionRate: data.adoptionRate ?? 88.4,
              costEfficiency: data.costEfficiency ?? 24.6,
              licenseUtilization: data.licenseUtilization ?? 92.1
            }
          };
        }
      } catch (err) {
        console.warn('Supabase edge function dashboard-metrics error, falling back locally:', err);
      }
    }

    return {
      assessment,
      legacyCount: (assessment.legacyApplications || []).length,
      overallRiskLevel: riskData?.overallRiskLevel || 'Low',
      risks: riskData?.risks || [],
      plan,
      phases: plan?.phases || [],
      recommendations: evalData?.results || [],
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
