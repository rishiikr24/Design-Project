import { describe, it, expect } from 'vitest';
import { STANDARD_PHASES, generateMigrationPlan, calculateOverallProgress } from '../lib/planner';
import { plannerService } from '../services/plannerService';

describe('8-Phase Migration Planner Engine (Matching test/unit exactly)', () => {
  it('contains exactly 8 standard transformation phases', () => {
    expect(STANDARD_PHASES.length).toBe(8);
    const sequences = STANDARD_PHASES.map(p => p.sequence);
    expect(sequences).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it('generates a sequential migration plan with dates and risk adaptations', () => {
    const mockProduct = {
      id: 'sap-cloud-erp',
      name: 'SAP S/4HANA Cloud',
      migrationComplexity: 'High'
    };
    const mockRisks = [
      { templateId: 'risk-data-loss', category: 'Data Governance', mitigation: 'Strict checksum validation.' }
    ];

    const plan = generateMigrationPlan({}, mockProduct, mockRisks, '2026-01-01');

    expect(plan.totalPhases).toBe(8);
    expect(plan.selectedProductId).toBe('sap-cloud-erp');
    expect(plan.phases.length).toBe(8);
    expect(plan.phases[0].sequence).toBe(1);
    expect(plan.phases[7].sequence).toBe(8);

    // Phase 3 should reflect High migration complexity
    expect(plan.phases[2].riskMitigationFocus).toContain('High migration complexity');
    // Phase 4 should reflect data loss risk
    expect(plan.phases[3].riskMitigationFocus).toContain('checksum validation');
  });

  it('correctly calculates overall progress percentage', () => {
    const mockPhases = [
      { progress: 100 },
      { progress: 100 },
      { progress: 50 },
      { progress: 0 }
    ];
    // (100 + 100 + 50 + 0) / 4 = 250 / 4 = 62.5%
    const progress = calculateOverallProgress(mockPhases);
    expect(progress).toBe(62.5);
  });

  it('plannerService updates individual phase and recalculates overall progress', async () => {
    const plan = await plannerService.getPlan({});
    expect(plan.phases.length).toBe(8);

    const result = await plannerService.updatePhase(1, { status: 'Completed', progress: 100 });
    expect(result.phase.sequence).toBe(1);
    expect(result.phase.progress).toBe(100);
    expect(result.phase.status).toBe('Completed');
    expect(result.overallProgress).toBeGreaterThan(0);
  });
});
