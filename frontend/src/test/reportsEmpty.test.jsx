import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '../components/Toast';
import { ReportsPage } from '../features/reports/ReportsPage';
import { dashboardService } from '../services/dashboardService';

describe('Reports Empty State (Item 5)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders helpful empty state when no active assessment exists', async () => {
    vi.spyOn(dashboardService, 'getDashboardMetrics').mockResolvedValueOnce(null);

    render(
      <MemoryRouter>
        <ToastProvider>
          <ReportsPage />
        </ToastProvider>
      </MemoryRouter>
    );

    expect(await screen.findByText('No Active Assessment Data', {}, { timeout: 4000 })).toBeInTheDocument();
    expect(screen.getByText('Open Assessment Wizard')).toBeInTheDocument();
  });

  it('renders executive report content when assessment data exists', async () => {
    render(
      <MemoryRouter>
        <ToastProvider>
          <ReportsPage />
        </ToastProvider>
      </MemoryRouter>
    );

    expect(await screen.findByText('Executive Transformation Reports', {}, { timeout: 4000 })).toBeInTheDocument();
    expect(screen.getByText('NIRNAY TRANSFORMATION AUDIT')).toBeInTheDocument();
  });
});
