import { describe, it, expect } from 'vitest';
import { catalogService } from '../services/catalogService';
import { assessmentService } from '../services/assessmentService';
import { recommendationService } from '../services/recommendationService';
import { riskService } from '../services/riskService';
import { plannerService } from '../services/plannerService';
import { dashboardService } from '../services/dashboardService';
import { companyService } from '../services/companyService';
import { assistantService } from '../services/assistantService';

describe('Data Services (Hard Rule Verification)', () => {
  it('companyService returns registered tenants and profiles', async () => {
    const data = await companyService.getCompanies();
    expect(data.companies.length).toBeGreaterThan(0);
    expect(data.users.length).toBeGreaterThan(0);
  });

  it('catalogService returns 10 active products', async () => {
    const prods = await catalogService.getProducts();
    expect(prods.length).toBe(10);
  });

  it('assessmentService retrieves reference case and computes TOE', async () => {
    const assessment = await assessmentService.getAssessmentById('assessment-ref-case');
    expect(assessment.ID).toBe('assessment-ref-case');
    expect(assessment.legacyApplications.length).toBe(4);
  });

  it('recommendationService scores candidates and ranks them', async () => {
    const res = await recommendationService.evaluate({});
    expect(res.results.length).toBe(10);
    expect(res.results[0].rank).toBe(1);
    expect(res.results[0].totalScore).toBeGreaterThan(0);
  });

  it('riskService returns assessed risks with severity breakdown', async () => {
    const data = await riskService.assessRisks();
    expect(data.risks.length).toBe(5);
    expect(data.overallRiskLevel).toBeDefined();
  });

  it('plannerService returns 8-phase transformation plan', async () => {
    const plan = await plannerService.getPlan({});
    expect(plan.totalPhases).toBe(8);
    expect(plan.phases.length).toBe(8);
  });

  it('dashboardService aggregates consolidated metrics', async () => {
    const dash = await dashboardService.getDashboardMetrics();
    expect(dash.assessment).toBeDefined();
    expect(dash.legacyCount).toBe(4);
    expect(dash.recommendations.length).toBe(10);
    expect(dash.postGoLive.adoptionRate).toBe(88.4);
  });

  it('assistantService answers advisory questions', async () => {
    const res = await assistantService.askQuestion('Why is the top product ranked #1?');
    expect(res.answer).toContain('Rank #1');
    expect(res.category).toBe('Scoring Rationale');
  });
});

