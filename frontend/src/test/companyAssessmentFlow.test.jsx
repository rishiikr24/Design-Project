import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { CompanyPage } from '../features/company/CompanyPage';
import { AssessmentPage } from '../features/assessment/AssessmentPage';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { companyService } from '../services/companyService';
import { assessmentService } from '../services/assessmentService';
import { dashboardService } from '../services/dashboardService';
import { ToastProvider } from '../components/Toast';

// Stub window APIs for JSDOM
globalThis.ResizeObserver = globalThis.ResizeObserver || class { observe() {} unobserve() {} disconnect() {} };
window.scrollTo = window.scrollTo || vi.fn();

function LocationTracker() {
  const location = useLocation();
  return <div data-testid="current-location">{location.pathname + location.search}</div>;
}

describe('End-to-End Flow: Company -> Assessment -> Dashboard', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('renders "Take Assessment" button on CompanyPage and navigates with companyId query param', async () => {
    const mockCompanies = [
      {
        id: 'comp-alpha-tech',
        ID: 'comp-alpha-tech',
        name: 'Alpha Technologies',
        industry: 'Cloud Computing',
        employees: 300,
        itBudget: 1200000,
        region: 'North America'
      }
    ];

    vi.spyOn(companyService, 'getCompanies').mockResolvedValue({
      companies: mockCompanies,
      users: []
    });
    vi.spyOn(companyService, 'getCompanyAssessments').mockResolvedValue([]);

    render(
      <ToastProvider>
        <MemoryRouter initialEntries={['/company']}>
          <Routes>
            <Route
              path="/company"
              element={
                <>
                  <LocationTracker />
                  <CompanyPage />
                </>
              }
            />
            <Route
              path="/assessment"
              element={
                <>
                  <LocationTracker />
                  <div>Assessment Wizard Screen</div>
                </>
              }
            />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    );

    // Wait for companies to load
    const matched = await screen.findAllByText('Alpha Technologies');
    expect(matched.length).toBeGreaterThan(0);

    // Verify Take Assessment button exists
    const takeAssessmentButtons = screen.getAllByRole('button', { name: /take assessment/i });
    expect(takeAssessmentButtons.length).toBeGreaterThan(0);

    // Click Take Assessment
    fireEvent.click(takeAssessmentButtons[0]);

    // Verify navigation with query param
    await waitFor(() => {
      const tracker = screen.getByTestId('current-location');
      expect(tracker.textContent).toBe('/assessment?companyId=comp-alpha-tech');
    });
  });

  it('AssessmentPage pre-selects companyId from URL and redirects to dashboard with query params on submit', async () => {
    const mockCompanies = [
      {
        id: 'comp-beta-corp',
        ID: 'comp-beta-corp',
        name: 'Beta Global Corp',
        industry: 'FinTech',
        employees: 450,
        itBudget: 2500000,
        region: 'EMEA'
      }
    ];

    vi.spyOn(companyService, 'getCompanies').mockResolvedValue({
      companies: mockCompanies,
      users: []
    });

    vi.spyOn(assessmentService, 'saveAssessment').mockImplementation(async (data) => ({
      ...data,
      id: 'assessment-beta-999',
      ID: 'assessment-beta-999',
      readinessScore: 82
    }));

    render(
      <ToastProvider>
        <MemoryRouter initialEntries={['/assessment?companyId=comp-beta-corp']}>
          <Routes>
            <Route
              path="/assessment"
              element={
                <>
                  <LocationTracker />
                  <AssessmentPage />
                </>
              }
            />
            <Route
              path="/dashboard"
              element={
                <>
                  <LocationTracker />
                  <div>Dashboard Result View</div>
                </>
              }
            />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    );

    // Confirm that company name is pre-selected and filled
    await waitFor(() => {
      const companyInput = screen.getByPlaceholderText(/Apex Global Enterprises/i);
      expect(companyInput.value).toBe('Beta Global Corp');
    });

    // Advance through the wizard steps: 1 -> 2 -> 3 -> 4 -> 5
    fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    fireEvent.click(await screen.findByRole('button', { name: /next step/i }));
    fireEvent.click(await screen.findByRole('button', { name: /next step/i }));
    fireEvent.click(await screen.findByRole('button', { name: /next step/i }));

    // Step 5 -> Submit
    const submitBtn = await screen.findByRole('button', { name: /save & submit assessment/i });
    fireEvent.click(submitBtn);

    // Verify redirection to /dashboard with companyId and assessmentId
    await waitFor(() => {
      const tracker = screen.getByTestId('current-location');
      expect(tracker.textContent).toContain('/dashboard?companyId=comp-beta-corp&assessmentId=assessment-beta-999');
    });
  });

  it('DashboardPage selects exact company and assessment specified in URL query params', async () => {
    const mockCompanies = [
      { id: 'comp-1', name: 'Company One' },
      { id: 'comp-gamma-target', name: 'Gamma Enterprises' }
    ];

    const mockAssessments = [
      {
        id: 'assessment-gamma-777',
        title: 'Gamma Cloud Transformation',
        company_ID: 'comp-gamma-target'
      }
    ];

    const mockMetrics = {
      assessment: {
        id: 'assessment-gamma-777',
        title: 'Gamma Cloud Transformation',
        companyName: 'Gamma Enterprises',
        company_ID: 'comp-gamma-target',
        readinessScore: 85,
        toeTechScore: 80,
        toeOrgScore: 88,
        toeEnvScore: 87
      },
      legacyCount: 2,
      overallRiskLevel: 'Moderate',
      risks: [],
      plan: { phases: [] },
      recommendations: []
    };

    vi.spyOn(companyService, 'getCompanies').mockResolvedValue({
      companies: mockCompanies,
      users: []
    });

    vi.spyOn(assessmentService, 'getAssessments').mockResolvedValue(mockAssessments);
    vi.spyOn(dashboardService, 'getDashboardMetrics').mockResolvedValue(mockMetrics);

    render(
      <ToastProvider>
        <MemoryRouter initialEntries={['/dashboard?companyId=comp-gamma-target&assessmentId=assessment-gamma-777']}>
          <Routes>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    );

    // Verify that Gamma Enterprises is loaded and selected on the executive dashboard
    expect(await screen.findByText('Gamma Enterprises')).toBeInTheDocument();

    const assessmentOption = screen.getByRole('option', { name: /Gamma Cloud Transformation/i });
    expect(assessmentOption).toBeInTheDocument();
    expect(assessmentOption.selected).toBe(true);

    // Verify dashboardService was called with the exact assessmentId from the URL
    expect(dashboardService.getDashboardMetrics).toHaveBeenCalledWith('assessment-gamma-777');
  });
});
