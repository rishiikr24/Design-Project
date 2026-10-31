import { assessmentService } from './assessmentService';
import { catalogService } from './catalogService';
import { riskService } from './riskService';
import { generateMigrationPlan, calculateOverallProgress } from '../lib/planner';

let planState = null;

export const plannerService = {
  async getPlan({ assessmentId = 'assessment-ref-case', productId = 'sap-cloud-erp' }) {
    if (planState && planState.selectedProductId === productId) {
      return planState;
    }

    const assessment = await assessmentService.getAssessmentById(assessmentId);
    const product = await catalogService.getProductById(productId);
    const riskEval = await riskService.assessRisks(assessmentId);

    planState = generateMigrationPlan(assessment, product, riskEval.risks);
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

    return {
      phase,
      overallProgress: planState.overallProgress
    };
  }
};

