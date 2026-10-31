import { describe, it, expect } from 'vitest';
import { STANDARD_PHASES, generateMigrationPlan, calculateOverallProgress } from '../lib/planner';

describe('Frontend Roadmap Planner Engine', () => {
  it('contains exactly 8 sequential transformation phases', () => {
    expect(STANDARD_PHASES.length).toBe(8);
    expect(STANDARD_PHASES.map(p => p.sequence)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it('generates a sequential migration plan with risk adaptations', () => {
    const plan = generateMigrationPlan({}, { ID: 'sap-cloud-erp', name: 'SAP S/4HANA Cloud', migrationComplexity: 'High' });
    expect(plan.totalPhases).toBe(8);
    expect(plan.phases.length).toBe(8);
    expect(plan.phases[0].sequence).toBe(1);
    expect(plan.phases[7].sequence).toBe(8);
  });

  it('calculates arithmetic mean overall progress', () => {
    const progress = calculateOverallProgress([{ progress: 100 }, { progress: 100 }, { progress: 50 }, { progress: 0 }]);
    expect(progress).toBe(62.5);
  });
});

