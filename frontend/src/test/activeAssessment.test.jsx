import { describe, it, expect, beforeEach } from 'vitest';
import { getActiveAssessmentId, setActiveAssessmentId } from '../lib/activeAssessment';
import { assessmentService } from '../services/assessmentService';
import { dashboardService } from '../services/dashboardService';
import { riskService } from '../services/riskService';
import { recommendationService } from '../services/recommendationService';

describe('Active Assessment Management (Item 2)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to assessment-ref-case when no active assessment is set', () => {
    expect(getActiveAssessmentId()).toBe('assessment-ref-case');
  });

  it('updates active assessment ID and synchronizes with localStorage', () => {
    setActiveAssessmentId('assessment-new-123');
    expect(getActiveAssessmentId()).toBe('assessment-new-123');
    expect(localStorage.getItem('saas_active_assessment_id')).toBe('assessment-new-123');
  });

  it('services default to active assessment ID', async () => {
    const custom = {
      ID: 'assessment-active-probe',
      id: 'assessment-active-probe',
      title: 'Active Probe Assessment',
      company_ID: 'comp-apex-global',
      growthRate: 30,
      infrastructure: 'Private Cloud',
      dataSensitivity: 'High',
      legacyApplications: []
    };
    await assessmentService.saveAssessment(custom);
    setActiveAssessmentId('assessment-active-probe');

    const metrics = await dashboardService.getDashboardMetrics();
    expect(metrics.assessment.id).toBe('assessment-active-probe');

    const risks = await riskService.assessRisks();
    expect(risks).toBeDefined();

    const recs = await recommendationService.evaluate();
    expect(recs.results.length).toBeGreaterThan(0);
  });
});
