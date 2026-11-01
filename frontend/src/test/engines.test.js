import { describe, it, expect } from 'vitest';
import {
  DEFAULT_WEIGHTS,
  validateWeights,
  scoreProduct,
  evaluateProducts,
  generateReason
} from '../../../supabase/functions/evaluate-recommendations/index.ts';
import {
  getSeverity,
  assessRisks
} from '../../../supabase/functions/assess-risks/index.ts';
import {
  calculateDashboardMetrics
} from '../../../supabase/functions/dashboard-metrics/index.ts';
import {
  answerQuestionDeterministic
} from '../../../supabase/functions/assistant-advisor/index.ts';

describe('Ported Engines (Edge & Postgres Function Logic Parity)', () => {
  // --------------------------------------------------------------------------
  // Exact Fixtures Reused from test/unit/scoring.test.js
  // --------------------------------------------------------------------------
  const mockProducts = [
    {
      id: 'prod-a',
      name: 'Product Alpha',
      vendor: 'Vendor A',
      category: 'CRM',
      costScore: 80,
      securityScore: 90,
      scalabilityScore: 85,
      integrationScore: 70,
      featuresScore: 95
    },
    {
      id: 'prod-b',
      name: 'Product Beta',
      vendor: 'Vendor B',
      category: 'CRM',
      costScore: 90,
      securityScore: 70,
      scalabilityScore: 75,
      integrationScore: 80,
      featuresScore: 85
    },
    {
      id: 'prod-c',
      name: 'Product Gamma',
      vendor: 'Vendor C',
      category: 'ERP',
      costScore: 60,
      securityScore: 95,
      scalabilityScore: 95,
      integrationScore: 90,
      featuresScore: 90
    }
  ];

  // --------------------------------------------------------------------------
  // Exact Fixtures Reused from test/unit/risk.test.js
  // --------------------------------------------------------------------------
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

  describe('1. SaaS Recommendation Scoring Engine (evaluate-recommendations)', () => {
    it('validates that default weights total 100', () => {
      expect(validateWeights(DEFAULT_WEIGHTS)).toBe(true);
      expect(validateWeights({ cost: 10, security: 20, scalability: 30, integration: 10, features: 10 })).toBe(false);
    });

    it('correctly calculates weighted score for a single product matching CAP result (84.25)', () => {
      // prod-a with default weights: 80*0.2 + 90*0.3 + 85*0.25 + 70*0.15 + 95*0.1 = 16 + 27 + 21.25 + 10.5 + 9.5 = 84.25
      const result = scoreProduct(mockProducts[0], DEFAULT_WEIGHTS);
      expect(result.totalScore).toBe(84.25);
      expect(result.costSubScore).toBe(80);
      expect(result.securitySubScore).toBe(90);
    });

    it('ranks evaluated products in descending score order', () => {
      const results = evaluateProducts(mockProducts, DEFAULT_WEIGHTS);
      expect(results.length).toBe(3);
      expect(results[0].rank).toBe(1);
      expect(results[1].rank).toBe(2);
      expect(results[2].rank).toBe(3);
      expect(results[0].totalScore).toBeGreaterThanOrEqual(results[1].totalScore);
      expect(results[1].totalScore).toBeGreaterThanOrEqual(results[2].totalScore);
    });

    it('filters by target category when specified', () => {
      const results = evaluateProducts(mockProducts, DEFAULT_WEIGHTS, { targetCategory: 'ERP' });
      expect(results.length).toBe(1);
      expect(results[0].productId).toBe('prod-c');
    });

    it('produces reproducible results and explanation reason matching reasons.test.js', () => {
      const run1 = evaluateProducts(mockProducts, DEFAULT_WEIGHTS, { dataSensitivity: 'High' });
      const run2 = evaluateProducts(mockProducts, DEFAULT_WEIGHTS, { dataSensitivity: 'High' });
      expect(run1).toEqual(run2);
      expect(run1[0].reason.length).toBeGreaterThan(10);
      expect(run1[0].reason).toContain('Recommended as top choice');
    });

    it('generates rich rationale based on highest weighted criteria', () => {
      const customWeights = { cost: 10, security: 40, scalability: 30, integration: 10, features: 10 };
      const reason = generateReason(mockProducts[0], customWeights, { dataSensitivity: 'High' });
      expect(reason).toContain('Security');
      expect(reason).toContain('40%');
    });
  });

  describe('2. Rule-Based Risk Assessment Engine (assess-risks)', () => {
    it('correctly maps severity thresholds from score', () => {
      expect(getSeverity(20)).toBe('Critical');
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

    it('derives overall risk level correctly matching CAP', () => {
      const highRiskEval = assessRisks(mockTemplates, {
        infrastructure: 'On-premise',
        legacyAppsCount: 5,
        dataSensitivity: 'High'
      });
      expect(highRiskEval.overallRiskLevel).toBe('High');
    });
  });

  describe('3. Dashboard Telemetry Roll-up (dashboard-metrics)', () => {
    it('aggregates executive KPI telemetry matching srv/dashboard-service.js', () => {
      const metrics = calculateDashboardMetrics({
        assessment: {
          readinessScore: 75.0,
          toeTechScore: 78.0,
          toeOrgScore: 70.0,
          toeEnvScore: 77.0
        },
        legacyApplications: [{ id: 'app1' }, { id: 'app2' }, { id: 'app3' }, { id: 'app4' }],
        risks: [
          { riskTitle: 'Risk A', severity: 'Critical', score: 20 },
          { riskTitle: 'Risk B', severity: 'High', score: 12 }
        ],
        plan: { overallProgress: 45.0 },
        topResult: { productName: 'SAP S/4HANA Cloud', totalScore: 89.5 }
      });

      expect(metrics.readinessScore).toBe(75.0);
      expect(metrics.legacyCount).toBe(4);
      expect(metrics.overallRiskLevel).toBe('High');
      expect(metrics.migrationProgress).toBe(45.0);
      expect(metrics.topProduct).toBe('SAP S/4HANA Cloud');
      expect(metrics.topScore).toBe(89.5);
      expect(metrics.adoptionRate).toBe(88.4);
      expect(metrics.costEfficiency).toBe(24.6);
      expect(metrics.licenseUtilization).toBe(92.1);
    });
  });

  describe('4. AI Assistant Advisor (assistant-advisor)', () => {
    it('answers scoring questions with mathematical fit and rankings', () => {
      const response = answerQuestionDeterministic('Why is the top product ranked #1?', {
        results: [
          {
            productName: 'SAP S/4HANA Cloud',
            totalScore: 91.2,
            costSubScore: 80,
            securitySubScore: 96,
            scalabilitySubScore: 98,
            integrationSubScore: 95,
            featuresSubScore: 98,
            reason: 'Top ERP alignment'
          }
        ]
      });

      expect(response.category).toBe('Scoring Rationale');
      expect(response.answer).toContain('Rank #1');
      expect(response.answer).toContain('SAP S/4HANA Cloud');
      expect(response.answer).toContain('91.2/100');
    });

    it('answers risk questions with critical mitigations', () => {
      const response = answerQuestionDeterministic('What are our most critical risks?', {
        risks: [
          { riskTitle: 'Data Loss', severity: 'Critical', score: 20, mitigation: 'Checksum validation' }
        ],
        assessment: { infrastructure: 'On-premise', dataSensitivity: 'High' }
      });

      expect(response.category).toBe('Risk Analysis');
      expect(response.answer).toContain('Data Loss');
      expect(response.answer).toContain('Critical');
    });
  });
});

