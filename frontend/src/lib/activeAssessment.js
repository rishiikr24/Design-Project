const ACTIVE_ASSESSMENT_KEY = 'saas_active_assessment_id';
const DEFAULT_ASSESSMENT_ID = 'assessment-ref-case';
const ACTIVE_COMPANY_KEY = 'saas_active_company_id';
const DEFAULT_COMPANY_ID = 'comp-apex-global';

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

export function getActiveCompanyId() {
  if (typeof window === 'undefined') return DEFAULT_COMPANY_ID;
  const userStr = localStorage.getItem('saas_current_user');
  if (userStr) {
    try {
      const u = JSON.parse(userStr);
      if (u?.company_id || u?.company_ID) {
        return u.company_id || u.company_ID;
      }
    } catch {
      // fallback
    }
  }
  const stored = localStorage.getItem(ACTIVE_COMPANY_KEY);
  return stored || DEFAULT_COMPANY_ID;
}

export function setActiveCompanyId(id) {
  if (typeof window !== 'undefined') {
    if (id) {
      localStorage.setItem(ACTIVE_COMPANY_KEY, id);
    } else {
      localStorage.removeItem(ACTIVE_COMPANY_KEY);
    }
    window.dispatchEvent(new CustomEvent('saas:company_changed', { detail: id }));
  }
}

