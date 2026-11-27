import { describe, it, expect } from 'vitest';
import { assistantService } from '../services/assistantService';

describe('Assistant Null Dashboard Guard (Item 3)', () => {
  it('returns helpful guidance instead of throwing when assessment metrics are missing', async () => {
    const res = await assistantService.askQuestion('What are our top risks?', 'non-existent-assessment-id-xyz');
    expect(res).toBeDefined();
    expect(res.category).toBe('Assessment Required');
    expect(res.answer).toContain('Please complete the Enterprise Readiness Assessment wizard first');
    expect(res.suggestedQuestions.length).toBeGreaterThan(0);
  });

  it('answers normally when a valid assessment exists', async () => {
    const res = await assistantService.askQuestion('How can we improve technology readiness?', 'assessment-ref-case');
    expect(res).toBeDefined();
    expect(res.answer).toContain('Technology Readiness score');
  });
});
