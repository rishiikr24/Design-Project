import { describe, it, expect } from 'vitest';
import { getSeverity, assessRisks } from '../lib/risk';
import riskTemplates from '../data/riskTemplates.json';

describe('Rule-Based Risk Assessment Engine (Matching test/unit exactly)', () => {
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
    expect(getSeverity(20)).toBe('Critical');
    expect(getSeverity(16)).toBe('Critical');
    expect(getSeverity(12)).toBe('High');
    expect(getSeverity(8)).toBe('Medium');
    expect(getSeverity(4)).toBe('Low');
  });

  it('elevates data loss probability when data sensitivity is High', () => {
    const baseline = assessRisks(mockTemplates, { dataSensitivity: 'Low' });
    const elevated = assessRisks(mockTemplates, { dataSensitivity: 'High' });

    const baselineDataLoss = baseline.risks.find(r => r.templateId === 'risk-data-loss');
    const elevatedDataLoss = elevated.risks.find(r => r.templateId === 'risk-data-loss');

    expect(baselineDataLoss.probability).toBe(3);
    expect(elevatedDataLoss.probability).toBe(4);
    expect(elevatedDataLoss.score).toBeGreaterThan(baselineDataLoss.score);
  });

  it('elevates integration failure probability on on-premise infrastructure with high legacy apps count', () => {
    const evaluated = assessRisks(mockTemplates, {
      infrastructure: 'On-premise',
      legacyAppsCount: 5
    });

    const integrationRisk = evaluated.risks.find(r => r.templateId === 'risk-integration');
    expect(integrationRisk.probability).toBe(5); // 3 base + 1 on-prem + 1 legacyCount
    expect(integrationRisk.score).toBe(20); // 5 * 4
    expect(integrationRisk.severity).toBe('Critical');
  });

  it('derives overall risk level correctly', () => {
    const highRiskEval = assessRisks(mockTemplates, {
      infrastructure: 'On-premise',
      legacyAppsCount: 5,
      dataSensitivity: 'High'
    });
    expect(highRiskEval.overallRiskLevel).toBe('High');
  });

  it('maps all seeded risks to valid 5x5 heatmap coordinates (P 1-5, I 1-5)', () => {
    const evaluated = assessRisks(riskTemplates, {
      infrastructure: 'On-premise',
      legacyAppsCount: 4,
      dataSensitivity: 'High',
      itBudget: 1500000
    });

    expect(evaluated.risks.length).toBe(5);
    evaluated.risks.forEach((r) => {
      expect(r.probability).toBeGreaterThanOrEqual(1);
      expect(r.probability).toBeLessThanOrEqual(5);
      expect(r.impact).toBeGreaterThanOrEqual(1);
      expect(r.impact).toBeLessThanOrEqual(5);
      expect(r.score).toBe(r.probability * r.impact);
      expect(r.severity).toBe(getSeverity(r.score));
      expect(r.mitigation).toBeDefined();
    });
  });
});
