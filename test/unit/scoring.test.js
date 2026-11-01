const { describe, it } = require('node:test');
const assert = require('node:assert');
const { DEFAULT_WEIGHTS, validateWeights, scoreProduct, evaluateProducts } = require('../../legacy-sap/srv/lib/scoring');

describe('SaaS Recommendation Scoring Engine', () => {
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
    assert.strictEqual(validateWeights(DEFAULT_WEIGHTS), true);
    assert.strictEqual(validateWeights({ cost: 10, security: 20, scalability: 30, integration: 10, features: 10 }), false);
  });

  it('correctly calculates weighted score for a single product', () => {
    // prod-a with default weights (Cost 20, Sec 30, Scale 25, Int 15, Feat 10)
    // 80*0.2 + 90*0.3 + 85*0.25 + 70*0.15 + 95*0.1 = 16 + 27 + 21.25 + 10.5 + 9.5 = 84.25
    const result = scoreProduct(mockProducts[0], DEFAULT_WEIGHTS);
    assert.strictEqual(result.totalScore, 84.25);
    assert.strictEqual(result.costSubScore, 80);
    assert.strictEqual(result.securitySubScore, 90);
  });

  it('ranks evaluated products in descending score order', () => {
    const results = evaluateProducts(mockProducts, DEFAULT_WEIGHTS);
    assert.strictEqual(results.length, 3);
    assert.strictEqual(results[0].rank, 1);
    assert.strictEqual(results[1].rank, 2);
    assert.strictEqual(results[2].rank, 3);
    assert.ok(results[0].totalScore >= results[1].totalScore);
    assert.ok(results[1].totalScore >= results[2].totalScore);
  });

  it('filters by target category when specified', () => {
    const results = evaluateProducts(mockProducts, DEFAULT_WEIGHTS, { targetCategory: 'ERP' });
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].productId, 'prod-c');
  });

  it('produces reproducible results and explanation reason', () => {
    const run1 = evaluateProducts(mockProducts, DEFAULT_WEIGHTS, { dataSensitivity: 'High' });
    const run2 = evaluateProducts(mockProducts, DEFAULT_WEIGHTS, { dataSensitivity: 'High' });
    assert.deepStrictEqual(run1, run2);
    assert.ok(run1[0].reason.length > 10);
  });
});
