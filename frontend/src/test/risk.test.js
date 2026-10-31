import { describe, it, expect } from 'vitest';
import { getSeverity, assessRisks } from '../lib/risk';
import riskTemplates from '../data/riskTemplates.json';

describe('Frontend Risk Engine & Module 5 5x5 Heatmap Analysis', () => {
  it('correctly maps severity thresholds from score', () => {
    expect(getSeverity(20)).toBe('Critical');
    expect(getSeverity(16)).toBe('Critical');
    expect(getSeverity(15)).toBe('High');
    expect(getSeverity(12)).toBe('High');
    expect(getSeverity(10)).toBe('Medium');
    expect(getSeverity(6)).toBe('Medium');
    expect(getSeverity(4)).toBe('Low');
    expect(getSeverity(1)).toBe('Low');
  });

  it('elevates probability on high data sensitivity and on-premise infrastructure', () => {
    const evaluated = assessRisks(riskTemplates, {
      infrastructure: 'On-premise',
      legacyAppsCount: 4,
      dataSensitivity: 'High',
      itBudget: 1500000
    });

    expect(evaluated.overallRiskLevel).toBe('High');
    const dataLossRisk = evaluated.risks.find(r => r.templateId === 'risk-data-loss');
    expect(dataLossRisk.probability).toBe(4);
    expect(dataLossRisk.severity).toBe('Critical');
  });

  it('ensures all evaluated risks map to valid 5x5 heatmap coordinates (P 1-5, I 1-5)', () => {
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

  it('generates summary risk counts for dashboard and heatmap indicators', () => {
    const evaluated = assessRisks(riskTemplates, {
      infrastructure: 'On-premise',
      legacyAppsCount: 4,
      dataSensitivity: 'High',
      itBudget: 1500000
    });

    const total = evaluated.summary.critical + evaluated.summary.high + evaluated.summary.medium + evaluated.summary.low;
    expect(total).toBe(5);
    expect(evaluated.summary.critical).toBeGreaterThanOrEqual(1);
  });
});
