import { describe, it, expect } from 'vitest';
import { getSeverity, assessRisks } from '../lib/risk';
import riskTemplates from '../data/riskTemplates.json';

describe('Frontend Risk Engine', () => {
  it('correctly maps severity thresholds from score', () => {
    expect(getSeverity(20)).toBe('Critical');
    expect(getSeverity(12)).toBe('High');
    expect(getSeverity(8)).toBe('Medium');
    expect(getSeverity(4)).toBe('Low');
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
});

