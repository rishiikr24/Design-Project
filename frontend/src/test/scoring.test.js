import { describe, it, expect } from 'vitest';
import { DEFAULT_WEIGHTS, validateWeights, scoreProduct, evaluateProducts } from '../lib/scoring';
import productsData from '../data/products.json';

describe('Frontend Scoring Engine', () => {
  it('validates default weights total exactly 100', () => {
    expect(validateWeights(DEFAULT_WEIGHTS)).toBe(true);
    expect(validateWeights({ cost: 10, security: 20, scalability: 30, integration: 10, features: 10 })).toBe(false);
  });

  it('correctly calculates weighted score for a single product', () => {
    const prod = productsData[0]; // Salesforce
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
});

