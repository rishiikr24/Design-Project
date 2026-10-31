import referenceCase from '../data/referenceCase.json';
import { calculateReadiness } from '../lib/readiness';

let assessmentsState = [referenceCase.assessment];

export const assessmentService = {
  async getAssessments(companyId = 'comp-apex-global') {
    return assessmentsState.filter(a => a.company_ID === companyId);
  },

  async getAssessmentById(id = 'assessment-ref-case') {
    const found = assessmentsState.find(a => a.ID === id);
    if (found) return found;
    return referenceCase.assessment;
  },

  async saveAssessment(payload) {
    const id = payload.ID || `assessment-${Date.now()}`;
    const readiness = calculateReadiness({
      ...payload,
      legacyAppsCount: (payload.legacyApplications || []).length
    });

    const record = {
      ID: id,
      title: payload.title || 'Enterprise SaaS Transformation Assessment',
      company_ID: payload.company_ID || 'comp-apex-global',
      infrastructure: payload.infrastructure || 'On-premise',
      growthRate: Number(payload.growthRate) || 18.0,
      dataSensitivity: payload.dataSensitivity || 'High',
      painPoints: payload.painPoints || '',
      targetCategory: payload.targetCategory || 'All',
      readinessScore: readiness.readinessScore,
      toeTechScore: readiness.toeTechScore,
      toeOrgScore: readiness.toeOrgScore,
      toeEnvScore: readiness.toeEnvScore,
      status: payload.status || 'Completed',
      legacyApplications: payload.legacyApplications || [],
      requirements: payload.requirements || [],
      readinessDetails: readiness
    };

    const existingIdx = assessmentsState.findIndex(a => a.ID === id);
    if (existingIdx >= 0) {
      assessmentsState[existingIdx] = record;
    } else {
      assessmentsState.push(record);
    }

    return record;
  }
};

