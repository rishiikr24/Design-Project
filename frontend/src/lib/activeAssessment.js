const ACTIVE_ASSESSMENT_KEY = 'saas_active_assessment_id';
const DEFAULT_ASSESSMENT_ID = 'assessment-ref-case';

export function getActiveAssessmentId() {
  if (typeof window === 'undefined') return DEFAULT_ASSESSMENT_ID;
  const stored = localStorage.getItem(ACTIVE_ASSESSMENT_KEY);
  return stored || DEFAULT_ASSESSMENT_ID;
}

export function setActiveAssessmentId(id) {
  if (typeof window !== 'undefined') {
    if (id) {
      localStorage.setItem(ACTIVE_ASSESSMENT_KEY, id);
    } else {
      localStorage.removeItem(ACTIVE_ASSESSMENT_KEY);
    }
    window.dispatchEvent(new CustomEvent('saas:assessment_changed', { detail: id }));
  }
}
