const { describe, it } = require('node:test');
const assert = require('node:assert');
const { assessRisks, getSeverity } = require('../../srv/lib/risk');

describe('Rule-Based Risk Assessment Engine', () => {
  const mockTemplates = [
    {
      id: 'risk-data-loss',
      category: 'Data Governance',
      riskTitle: 'Data Loss During Migration',
      baseProbability: 3,
      baseImpact: 5,
      defaultMitigation: 'Checksum validation and parallel testing.'
    },
    {
      id: 'risk-integration',
      category: 'Integration',
      riskTitle: 'Integration Failure',
      baseProbability: 3,
      baseImpact: 4,
      defaultMitigation: 'Deploy API gateway.'
    },
    {
      id: 'risk-change-mgmt',
      category: 'Organization',
      riskTitle: 'Employee Resistance',
      baseProbability: 3,
      baseImpact: 3,
      defaultMitigation: 'Role-based workshops.'
    }
  ];

  it('correctly maps severity thresholds from score', () => {
    assert.strictEqual(getSeverity(20), 'Critical');
    assert.strictEqual(getSeverity(12), 'High');
    assert.strictEqual(getSeverity(8), 'Medium');
    assert.strictEqual(getSeverity(4), 'Low');
  });

  it('elevates data loss probability when data sensitivity is High', () => {
    const baseline = assessRisks(mockTemplates, { dataSensitivity: 'Low' });
    const elevated = assessRisks(mockTemplates, { dataSensitivity: 'High' });

    const baselineDataLoss = baseline.risks.find(r => r.templateId === 'risk-data-loss');
    const elevatedDataLoss = elevated.risks.find(r => r.templateId === 'risk-data-loss');

    assert.strictEqual(baselineDataLoss.probability, 3);
    assert.strictEqual(elevatedDataLoss.probability, 4);
    assert.ok(elevatedDataLoss.score > baselineDataLoss.score);
  });

  it('elevates integration failure probability on on-premise infrastructure with high legacy apps count', () => {
    const evaluated = assessRisks(mockTemplates, {
      infrastructure: 'On-premise',
      legacyAppsCount: 5
    });

    const integrationRisk = evaluated.risks.find(r => r.templateId === 'risk-integration');
    assert.strictEqual(integrationRisk.probability, 5); // 3 base + 1 on-prem + 1 legacyCount
    assert.strictEqual(integrationRisk.score, 20); // 5 * 4
    assert.strictEqual(integrationRisk.severity, 'Critical');
  });

  it('derives overall risk level correctly', () => {
    const highRiskEval = assessRisks(mockTemplates, {
      infrastructure: 'On-premise',
      legacyAppsCount: 5,
      dataSensitivity: 'High'
    });
    assert.strictEqual(highRiskEval.overallRiskLevel, 'High');
  });
});
