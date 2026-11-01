import { supabase, shouldUseMocks } from '../lib/supabase';
import referenceCase from '../data/referenceCase.json';
import { calculateReadiness } from '../lib/readiness';

let assessmentsState = [referenceCase.assessment];

function mapAssessmentFromPostgres(row, legacyApps = [], requirements = []) {
  if (!row) return null;
  const readiness = calculateReadiness({
    infrastructure: row.infrastructure,
    growthRate: Number(row.growth_rate),
    dataSensitivity: row.data_sensitivity,
    legacyAppsCount: legacyApps.length
  });

  return {
    ID: row.id,
    id: row.id,
    title: row.title,
    company_ID: row.company_id,
    company_id: row.company_id,
    infrastructure: row.infrastructure,
    growthRate: Number(row.growth_rate) || 0,
    dataSensitivity: row.data_sensitivity,
    painPoints: row.pain_points || '',
    targetCategory: row.target_category || 'All',
    readinessScore: Number(row.readiness_score) || readiness.readinessScore,
    toeTechScore: Number(row.toe_tech_score) || readiness.toeTechScore,
    toeOrgScore: Number(row.toe_org_score) || readiness.toeOrgScore,
    toeEnvScore: Number(row.toe_env_score) || readiness.toeEnvScore,
    status: row.status || 'Draft',
    legacyApplications: legacyApps.map(app => ({
      ID: app.id,
      id: app.id,
      name: app.name,
      function: app.function,
      hosting: app.hosting,
      criticality: app.criticality,
      userCount: app.user_count,
      yearsInUse: app.years_in_use
    })),
    requirements: requirements.map(req => ({
      ID: req.id,
      id: req.id,
      category: req.category,
      description: req.description,
      priority: req.priority
    })),
    readinessDetails: readiness
  };
}

export const assessmentService = {
  async getAssessments(companyId = 'comp-apex-global') {
    if (!shouldUseMocks()) {
      try {
        const { data, error } = await supabase
          .from('assessments')
          .select('*, legacy_applications(*), requirements(*)')
          .eq('company_id', companyId);

        if (!error && data && data.length > 0) {
          return data.map(item => 
            mapAssessmentFromPostgres(item, item.legacy_applications || [], item.requirements || [])
          );
        }
      } catch {
        // Fallback to local
      }
    }

    return assessmentsState.filter(a => a.company_ID === companyId || a.company_id === companyId);
  },

  async getAssessmentById(id = 'assessment-ref-case') {
    if (!shouldUseMocks()) {
      try {
        const { data, error } = await supabase
          .from('assessments')
          .select('*, legacy_applications(*), requirements(*)')
          .eq('id', id)
          .single();

        if (!error && data) {
          return mapAssessmentFromPostgres(data, data.legacy_applications || [], data.requirements || []);
        }
      } catch {
        // Fallback to local
      }
    }

    const found = assessmentsState.find(a => a.ID === id || a.id === id);
    if (found) return found;
    return referenceCase.assessment;
  },

  async saveAssessment(payload) {
    const id = payload.ID || payload.id || `assessment-${Date.now()}`;
    const legacyApps = payload.legacyApplications || [];
    const readiness = calculateReadiness({
      ...payload,
      legacyAppsCount: legacyApps.length
    });

    const record = {
      ID: id,
      id: id,
      title: payload.title || 'Enterprise SaaS Transformation Assessment',
      company_ID: payload.company_ID || payload.company_id || 'comp-apex-global',
      company_id: payload.company_ID || payload.company_id || 'comp-apex-global',
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
      legacyApplications: legacyApps,
      requirements: payload.requirements || [],
      readinessDetails: readiness
    };

    if (!shouldUseMocks()) {
      try {
        // Upsert assessment in Supabase
        await supabase
          .from('assessments')
          .upsert({
            id: record.id,
            title: record.title,
            company_id: record.company_id,
            infrastructure: record.infrastructure,
            growth_rate: record.growthRate,
            data_sensitivity: record.dataSensitivity,
            pain_points: record.painPoints,
            target_category: record.targetCategory,
            readiness_score: record.readinessScore,
            toe_tech_score: record.toeTechScore,
            toe_org_score: record.toeOrgScore,
            toe_env_score: record.toeEnvScore,
            status: record.status
          });

        // Sync legacy applications
        if (legacyApps.length > 0) {
          const appsToUpsert = legacyApps.map(app => ({
            id: app.ID || app.id || `leg-app-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            assessment_id: record.id,
            name: app.name,
            function: app.function,
            hosting: app.hosting,
            criticality: app.criticality || 'Medium',
            user_count: Number(app.userCount) || 0,
            years_in_use: Number(app.yearsInUse) || 0
          }));

          await supabase.from('legacy_applications').upsert(appsToUpsert);
        }
      } catch {
        // Continue and save to local state
      }
    }

    const existingIdx = assessmentsState.findIndex(a => a.ID === id || a.id === id);
    if (existingIdx >= 0) {
      assessmentsState[existingIdx] = record;
    } else {
      assessmentsState.push(record);
    }

    return record;
  }
};
