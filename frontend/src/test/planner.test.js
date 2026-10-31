import { describe, it, expect } from 'vitest';
import { STANDARD_PHASES, generateMigrationPlan, calculateOverallProgress } from '../lib/planner';
import { plannerService } from '../services/plannerService';

describe('Frontend Roadmap Planner Engine & Module 6 Phased Execution', () => {
  it('contains exactly 8 sequential transformation phases', () => {
    expect(STANDARD_PHASES.length).toBe(8);
    expect(STANDARD_PHASES.map(p => p.sequence)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(STANDARD_PHASES[0].name).toBe('Assessment & Strategy');
    expect(STANDARD_PHASES[7].name).toContain('Post-Go-Live');
  });

  it('generates a sequential migration plan with risk adaptations', () => {
    const plan = generateMigrationPlan({}, { ID: 'sap-cloud-erp', name: 'SAP S/4HANA Cloud', migrationComplexity: 'High' });
    expect(plan.totalPhases).toBe(8);
    expect(plan.phases.length).toBe(8);
    expect(plan.phases[0].sequence).toBe(1);
    expect(plan.phases[7].sequence).toBe(8);
    expect(plan.estimatedDurationMonths).toBeGreaterThanOrEqual(12);

    // Each phase has dates and deliverables
    plan.phases.forEach((p) => {
      expect(p.startDate).toBeDefined();
      expect(p.endDate).toBeDefined();
      expect(p.deliverables).toBeDefined();
      expect(p.riskMitigationFocus).toBeDefined();
    });
  });

  it('calculates arithmetic mean overall progress', () => {
    const progress = calculateOverallProgress([{ progress: 100 }, { progress: 100 }, { progress: 50 }, { progress: 0 }]);
    expect(progress).toBe(62.5);

    const empty = calculateOverallProgress([]);
    expect(empty).toBe(0);

    const complete = calculateOverallProgress([
      { progress: 100 }, { progress: 100 }, { progress: 100 }, { progress: 100 },
      { progress: 100 }, { progress: 100 }, { progress: 100 }, { progress: 100 }
    ]);
    expect(complete).toBe(100);
  });

  it('plannerService updates individual phase and updates overall rolled-up progress', async () => {
    const plan = await plannerService.getPlan({});
    expect(plan.phases.length).toBe(8);

    const result = await plannerService.updatePhase(1, { status: 'Completed', progress: 100 });
    expect(result.phase.sequence).toBe(1);
    expect(result.phase.progress).toBe(100);
    expect(result.phase.status).toBe('Completed');
    expect(result.overallProgress).toBeGreaterThan(0);
  });
});
