import { supabase, shouldUseMocks } from '../lib/supabase';
import { assessmentService } from './assessmentService';
import { catalogService } from './catalogService';
import { riskService } from './riskService';
import { generateMigrationPlan, calculateOverallProgress } from '../lib/planner';

let planState = null;

function mapPlanFromPostgres(planRow, phases = []) {
  if (!planRow) return null;
  return {
    ID: planRow.id,
    id: planRow.id,
    assessmentId: planRow.assessment_id,
    selectedProductId: planRow.selected_product_id,
    title: planRow.title,
    totalPhases: planRow.total_phases,
    overallProgress: Number(planRow.overall_progress) || 0,
    startDate: planRow.start_date,
    targetEndDate: planRow.target_end_date,
    phases: phases.sort((a, b) => a.sequence - b.sequence).map(p => ({
      ID: p.id,
      id: p.id,
      sequence: p.sequence,
      name: p.name,
      status: p.status,
      progress: Number(p.progress) || 0,
      startDate: p.start_date,
      endDate: p.end_date,
      deliverables: p.deliverables,
      notes: p.notes,
      riskMitigationFocus: p.risk_mitigation_focus
    }))
  };
}

export const plannerService = {
  async getPlan({ assessmentId = 'assessment-ref-case', productId = 'sap-cloud-erp' }) {
    if (planState && planState.selectedProductId === productId) {
      return planState;
    }

    if (!shouldUseMocks()) {
      try {
        const { data: dbPlan, error } = await supabase
          .from('migration_plans')
          .select('*, migration_phases(*)')
          .eq('assessment_id', assessmentId)
          .eq('selected_product_id', productId)
          .single();

        if (!error && dbPlan) {
          planState = mapPlanFromPostgres(dbPlan, dbPlan.migration_phases || []);
          return planState;
        }
      } catch {
        // Fallback to generation
      }
    }

    const assessment = await assessmentService.getAssessmentById(assessmentId);
    const product = await catalogService.getProductById(productId);
    const riskEval = await riskService.assessRisks(assessmentId);

    planState = generateMigrationPlan(assessment, product, riskEval.risks);

    if (!shouldUseMocks()) {
      try {
        // Persist newly generated plan to Supabase
        const planId = planState.ID || `plan-${Date.now()}`;
        await supabase
          .from('migration_plans')
          .upsert({
            id: planId,
            assessment_id: assessmentId,
            selected_product_id: productId,
            title: planState.title,
            total_phases: planState.totalPhases,
            overall_progress: planState.overallProgress,
            start_date: planState.startDate,
            target_end_date: planState.targetEndDate,
            estimated_duration_months: planState.estimatedDurationMonths || 12
          });

        if (planState.phases && planState.phases.length > 0) {
          const phasesToUpsert = planState.phases.map(p => ({
            id: `phase-${planId}-${p.sequence}`,
            plan_id: planId,
            sequence: p.sequence,
            name: p.name,
            status: p.status,
            progress: p.progress,
            start_date: p.startDate,
            end_date: p.endDate,
            deliverables: p.deliverables,
            notes: p.notes,
            risk_mitigation_focus: p.riskMitigationFocus
          }));

          await supabase.from('migration_phases').upsert(phasesToUpsert);
        }
      } catch {
        // Continue with in-memory plan
      }
    }

    return planState;
  },

  async updatePhase(phaseSequence, { status, progress }) {
    if (!planState) {
      await this.getPlan({});
    }

    const phase = planState.phases.find(p => p.sequence === Number(phaseSequence));
    if (!phase) throw new Error(`Phase sequence ${phaseSequence} not found`);

    if (status !== undefined) phase.status = status;
    if (progress !== undefined) phase.progress = Number(progress);

    planState.overallProgress = calculateOverallProgress(planState.phases);

    if (!shouldUseMocks()) {
      try {
        const planId = planState.ID || planState.id;
        if (planId) {
          await supabase
            .from('migration_phases')
            .update({
              status: phase.status,
              progress: phase.progress
            })
            .eq('plan_id', planId)
            .eq('sequence', Number(phaseSequence));

          await supabase
            .from('migration_plans')
            .update({
              overall_progress: planState.overallProgress
            })
            .eq('id', planId);
        }
      } catch {
        // Continue with in-memory state
      }
    }

    return {
      phase,
      overallProgress: planState.overallProgress
    };
  }
};
