const { describe, it } = require('node:test');
const assert = require('node:assert');
const { STANDARD_PHASES, generateMigrationPlan, calculateOverallProgress } = require('../../legacy-sap/srv/lib/planner');

describe('8-Phase Migration Planner Engine', () => {
  it('contains exactly 8 standard transformation phases', () => {
    assert.strictEqual(STANDARD_PHASES.length, 8);
    const sequences = STANDARD_PHASES.map(p => p.sequence);
    assert.deepStrictEqual(sequences, [1, 2, 3, 4, 5, 6, 7, 8]);
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

    assert.strictEqual(plan.totalPhases, 8);
    assert.strictEqual(plan.selectedProductId, 'sap-cloud-erp');
    assert.strictEqual(plan.phases.length, 8);
    assert.strictEqual(plan.phases[0].sequence, 1);
    assert.strictEqual(plan.phases[7].sequence, 8);

    // Phase 3 should reflect High migration complexity
    assert.ok(plan.phases[2].riskMitigationFocus.includes('High migration complexity'));
    // Phase 4 should reflect data loss risk
    assert.ok(plan.phases[3].riskMitigationFocus.includes('checksum validation'));
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
    assert.strictEqual(progress, 62.5);
  });
});
