import { describe, it, expect, beforeEach } from 'vitest';
import { assessmentService } from '../services/assessmentService';
import { plannerService } from '../services/plannerService';
import { catalogService } from '../services/catalogService';

describe('LocalStorage Persistence (Item 1)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('persists newly saved assessments across calls', async () => {
    const customAssessment = {
      ID: 'assessment-custom-1',
      id: 'assessment-custom-1',
      title: 'Custom Test Assessment',
      company_ID: 'comp-apex-global',
      growthRate: 25,
      infrastructure: 'Hybrid Cloud',
      dataSensitivity: 'Medium',
      legacyApplications: []
    };

    const saved = await assessmentService.saveAssessment(customAssessment);
    expect(saved.title).toBe('Custom Test Assessment');

    // Verify localStorage item was created
    const storedRaw = localStorage.getItem('saas_assessments_data');
    expect(storedRaw).not.toBeNull();
    const stored = JSON.parse(storedRaw);
    expect(stored.some(a => a.id === 'assessment-custom-1')).toBe(true);

    // Verify getAssessmentById finds it
    const fetched = await assessmentService.getAssessmentById('assessment-custom-1');
    expect(fetched.title).toBe('Custom Test Assessment');
  });

  it('persists planner phase progress to localStorage', async () => {
    const plan = await plannerService.getPlan({ assessmentId: 'assessment-test', productId: 'sap-cloud-erp' });
    expect(plan.phases.length).toBeGreaterThan(0);

    const updated = await plannerService.updatePhase(1, { progress: 85, status: 'Active' });
    expect(updated.phase.progress).toBe(85);

    const storedRaw = localStorage.getItem('saas_planner_plan_data_assessment-test_sap-cloud-erp');
    expect(storedRaw).not.toBeNull();
    const storedPlan = JSON.parse(storedRaw);
    expect(storedPlan.phases.find(p => p.sequence === 1).progress).toBe(85);
  });

  it('persists user-added catalog products to localStorage', async () => {
    const newProd = {
      name: 'Custom Enterprise Cloud App',
      vendor: 'Test Vendor',
      category: 'ERP',
      costScore: 90,
      securityScore: 92
    };

    const added = await catalogService.addProduct(newProd);
    expect(added.name).toBe('Custom Enterprise Cloud App');

    const storedRaw = localStorage.getItem('saas_catalog_products_data');
    expect(storedRaw).not.toBeNull();
    const storedProducts = JSON.parse(storedRaw);
    expect(storedProducts.some(p => p.name === 'Custom Enterprise Cloud App')).toBe(true);

    const all = await catalogService.getProducts();
    expect(all.some(p => p.name === 'Custom Enterprise Cloud App')).toBe(true);
  });
});
