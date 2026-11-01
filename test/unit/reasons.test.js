const { describe, it } = require('node:test');
const assert = require('node:assert');
const { generateReason } = require('../../legacy-sap/srv/lib/reasons');
const { DEFAULT_WEIGHTS } = require('../../legacy-sap/srv/lib/scoring');

describe('Explainability Reason Generator', () => {
  it('generates rich rationale based on highest weighted criteria', () => {
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

    assert.ok(reason.includes('Security'));
    assert.ok(reason.includes('High Data Sensitivity'));
    assert.ok(reason.includes('1000+ users'));
    assert.ok(reason.includes('legacy systems'));
    assert.ok(reason.toLowerCase().includes('high migration complexity'));
  });
});
