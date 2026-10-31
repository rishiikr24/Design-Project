import { describe, it, expect } from 'vitest';
import { DEFAULT_WEIGHTS, validateWeights, scoreProduct, evaluateProducts } from '../lib/scoring';
import { generateReason } from '../lib/reasons';
import productsData from '../data/products.json';

describe('SaaS Recommendation Scoring Engine (Matching test/unit exactly)', () => {
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

  it('validates that default weights total 100', () => {
    expect(validateWeights(DEFAULT_WEIGHTS)).toBe(true);
    expect(validateWeights({ cost: 10, security: 20, scalability: 30, integration: 10, features: 10 })).toBe(false);
  });

  it('correctly calculates weighted score for a single product', () => {
    // prod-a with default weights (Cost 20, Sec 30, Scale 25, Int 15, Feat 10)
    // 80*0.2 + 90*0.3 + 85*0.25 + 70*0.15 + 95*0.1 = 16 + 27 + 21.25 + 10.5 + 9.5 = 84.25
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

  it('produces reproducible results and explanation reason', () => {
    const run1 = evaluateProducts(mockProducts, DEFAULT_WEIGHTS, { dataSensitivity: 'High' });
    const run2 = evaluateProducts(mockProducts, DEFAULT_WEIGHTS, { dataSensitivity: 'High' });
    expect(run1).toEqual(run2);
    expect(run1[0].reason.length).toBeGreaterThan(10);
  });

  it('generates rich rationale based on highest weighted criteria (matching test/unit/reasons.test.js)', () => {
    const mockProduct = {
      id: 'sap-cloud-erp',
      name: 'SAP S/4HANA Cloud',
      securityRating: 'ISO 27001 / SOC 2',
      integrationCapability: 'SAP BTP / OData V4',
      migrationComplexity: 'High'
    };
    const mockScores = {
      costSubScore: 65,
      securitySubScore: 96,
      scalabilitySubScore: 98,
      integrationSubScore: 95,
      featuresSubScore: 98
    };

    const reason = generateReason(mockProduct, mockScores, DEFAULT_WEIGHTS, {
      dataSensitivity: 'High',
      employees: 1000,
      legacyAppsCount: 4
    });

    expect(reason).toContain('Security');
    expect(reason).toContain('High Data Sensitivity');
    expect(reason).toContain('1000+ users');
    expect(reason).toContain('legacy systems');
    expect(reason.toLowerCase()).toContain('high migration complexity');
  });

  it('supports sensitivity slider dynamic ranking shifts', () => {
    const securityHeavyWeights = { cost: 5, security: 80, scalability: 5, integration: 5, features: 5 };
    const secResults = evaluateProducts(productsData, securityHeavyWeights);

    const costHeavyWeights = { cost: 80, security: 5, scalability: 5, integration: 5, features: 5 };
    const costResults = evaluateProducts(productsData, costHeavyWeights);

    const sapInSec = secResults.find(r => r.productId === 'sap-cloud-erp');
    const sapInCost = costResults.find(r => r.productId === 'sap-cloud-erp');

    expect(sapInSec.rank).toBeLessThan(sapInCost.rank);
  });
});
