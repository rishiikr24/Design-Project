import { describe, it, expect } from 'vitest';
import { DEFAULT_WEIGHTS, validateWeights, scoreProduct, evaluateProducts } from '../lib/scoring';
import productsData from '../data/products.json';

describe('Frontend Scoring Engine & Module 4 Recommendation Simulation', () => {
  it('validates default weights total exactly 100', () => {
    expect(validateWeights(DEFAULT_WEIGHTS)).toBe(true);
    expect(validateWeights({ cost: 10, security: 20, scalability: 30, integration: 10, features: 10 })).toBe(false);
  });

  it('correctly calculates weighted score for a single product', () => {
    const prod = productsData[0]; // Salesforce Sales Cloud
    const scored = scoreProduct(prod, DEFAULT_WEIGHTS);
    expect(scored.productId).toBe(prod.ID);
    expect(scored.totalScore).toBeGreaterThan(0);
    expect(scored.totalScore).toBeLessThanOrEqual(100);
  });

  it('ranks evaluated products in descending score order', () => {
    const results = evaluateProducts(productsData, DEFAULT_WEIGHTS);
    expect(results.length).toBe(productsData.length);
    expect(results[0].rank).toBe(1);
    expect(results[1].rank).toBe(2);
    expect(results[0].totalScore).toBeGreaterThanOrEqual(results[1].totalScore);
  });

  it('filters by category when specified', () => {
    const results = evaluateProducts(productsData, DEFAULT_WEIGHTS, { targetCategory: 'ERP' });
    expect(results.length).toBe(2); // SAP S/4HANA Cloud and Oracle Fusion Cloud ERP
    expect(results.every(r => r.category === 'ERP')).toBe(true);
  });

  it('shifts rankings dynamically when sensitivity simulation weights change', () => {
    // Extreme security-first priority: Security 80% (SAP S/4HANA Cloud has Sec 96 vs Cost 65)
    const securityHeavyWeights = { cost: 5, security: 80, scalability: 5, integration: 5, features: 5 };
    const secResults = evaluateProducts(productsData, securityHeavyWeights);

    // Extreme cost-first priority: Cost 80% (Jira/PowerBI have Cost 90-92 vs SAP Cost 65)
    const costHeavyWeights = { cost: 80, security: 5, scalability: 5, integration: 5, features: 5 };
    const costResults = evaluateProducts(productsData, costHeavyWeights);

    const sapInSec = secResults.find(r => r.productId === 'sap-cloud-erp');
    const sapInCost = costResults.find(r => r.productId === 'sap-cloud-erp');

    // SAP ranks significantly better in security-first than in cost-first
    expect(sapInSec.rank).toBeLessThan(sapInCost.rank);
  });

  it('generates explainable justification reasons for each recommendation', () => {
    const results = evaluateProducts(productsData, DEFAULT_WEIGHTS);
    results.forEach((r) => {
      expect(r.reason).toBeDefined();
      expect(typeof r.reason).toBe('string');
      expect(r.reason.length).toBeGreaterThan(15);
    });
  });
});
