import { supabase, shouldUseMocks } from '../lib/supabase';
import riskTemplates from '../data/riskTemplates.json';
import { assessmentService } from './assessmentService';
import { assessRisks } from '../lib/risk';

function mapTemplateFromPostgres(row) {
  if (!row) return null;
  return {
    ID: row.id,
    id: row.id,
    category: row.category,
    riskTitle: row.risk_title,
    description: row.description,
    baseProbability: Number(row.base_probability),
    baseImpact: Number(row.base_impact),
    defaultMitigation: row.default_mitigation
  };
}

export const riskService = {
  async getTemplates() {
    if (!shouldUseMocks()) {
      try {
        const { data, error } = await supabase
          .from('risk_templates')
          .select('*')
          .order('category');

        if (!error && data && data.length > 0) {
          return data.map(mapTemplateFromPostgres);
        }
      } catch {
        // Fallback
      }
    }
    return riskTemplates;
  },

  async assessRisks(assessmentId = 'assessment-ref-case') {
    const templates = await this.getTemplates();
    const assessment = await assessmentService.getAssessmentById(assessmentId);
    const assessmentContext = {
      ...assessment,
      legacyAppsCount: (assessment.legacyApplications || []).length
    };

    const result = assessRisks(templates, assessmentContext);

    if (!shouldUseMocks()) {
      try {
        // Persist assessed risks to Supabase
        const rowsToUpsert = result.risks.map(r => ({
          id: `arisk-${assessmentId}-${r.templateId || r.riskTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
          assessment_id: assessmentId,
          template_id: r.templateId || null,
          risk_title: r.riskTitle,
          category: r.category,
          probability: r.probability,
          impact: r.impact,
          score: r.score,
          severity: r.severity,
          mitigation: r.mitigation,
          adjusted_reason: r.adjustedReason
        }));

        await supabase.from('assessed_risks').upsert(rowsToUpsert);
      } catch {
        // Continue with calculated memory result
      }
    }

    return result;
  }
};
