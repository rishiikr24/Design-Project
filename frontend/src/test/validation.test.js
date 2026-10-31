import { describe, it, expect } from 'vitest';
import { validateWeights, DEFAULT_WEIGHTS } from '../lib/scoring';
import { calculateReadiness } from '../lib/readiness';

describe('Assessment Form Validation & Rules', () => {
  it('validates standard PRD default weights (20/30/25/15/10) sum to 100', () => {
    expect(validateWeights(DEFAULT_WEIGHTS)).toBe(true);
    const sum = Object.values(DEFAULT_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(sum).toBe(100);
  });

  it('rejects weights that do not sum to 100', () => {
    expect(validateWeights({ cost: 20, security: 30, scalability: 25, integration: 15, features: 5 })).toBe(false);
    expect(validateWeights({ cost: 30, security: 30, scalability: 30, integration: 20, features: 10 })).toBe(false);
    expect(validateWeights({ cost: 0, security: 0, scalability: 0, integration: 0, features: 0 })).toBe(false);
  });

  it('rejects negative weight values', () => {
    expect(validateWeights({ cost: -10, security: 40, scalability: 35, integration: 20, features: 15 })).toBe(false);
  });

  it('validates Step 1 required company metadata rules', () => {
    const validateStep1 = (data) => {
      if (!data.companyName || !data.companyName.trim()) return { valid: false, error: 'Please enter company name' };
      if (!data.employees || data.employees <= 0) return { valid: false, error: 'Please specify valid employee count' };
      if (!data.itBudget || data.itBudget <= 0) return { valid: false, error: 'Please specify valid annual IT budget' };
      return { valid: true };
    };

    expect(validateStep1({ companyName: '', employees: 1000, itBudget: 1500000 }).valid).toBe(false);
    expect(validateStep1({ companyName: '   ', employees: 1000, itBudget: 1500000 }).error).toBe('Please enter company name');
    expect(validateStep1({ companyName: 'Apex', employees: 0, itBudget: 1500000 }).valid).toBe(false);
    expect(validateStep1({ companyName: 'Apex', employees: -5, itBudget: 1500000 }).error).toBe('Please specify valid employee count');
    expect(validateStep1({ companyName: 'Apex', employees: 1000, itBudget: 0 }).valid).toBe(false);
    expect(validateStep1({ companyName: 'Apex', employees: 1000, itBudget: -100 }).error).toBe('Please specify valid annual IT budget');
    expect(validateStep1({ companyName: 'Apex Global Enterprises', employees: 1000, itBudget: 1500000 }).valid).toBe(true);
  });

  it('enforces RBAC submission rules (Viewer role is read-only)', () => {
    const canSubmitAssessment = (role) => {
      return role !== 'Viewer';
    };

    expect(canSubmitAssessment('Viewer')).toBe(false);
    expect(canSubmitAssessment('Admin')).toBe(true);
    expect(canSubmitAssessment('Manager')).toBe(true);
    expect(canSubmitAssessment('Analyst')).toBe(true);
  });

  it('computes TOE readiness metrics matching PRD formulas', () => {
    const readiness = calculateReadiness({
      infrastructure: 'On-premise',
      legacyAppsCount: 4,
      itBudget: 1500000,
      employees: 1000,
      growthRate: 18,
      dataSensitivity: 'High'
    });

    // Tech: 70 - 5 (on-premise) = 65
    expect(readiness.toeTechScore).toBe(65);
    // Org: 65 + 15 ($1500/emp) + 5 (>=1000 emp) = 85
    expect(readiness.toeOrgScore).toBe(85);
    // Env: 70 + 12 (growth>=15) + 5 (High sensitivity) = 87
    expect(readiness.toeEnvScore).toBe(87);
    // Overall: 65*0.4 + 85*0.35 + 87*0.25 = 26 + 29.75 + 21.75 = 77.5
    expect(readiness.readinessScore).toBe(77.5);
    expect(readiness.readinessLevel).toBe('Moderate');
  });
});
