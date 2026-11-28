import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '../components/Toast';
import { LandingPage } from '../features/landing/LandingPage';
import { AboutPage } from '../features/landing/AboutPage';
import { ResetPasswordPage } from '../features/auth/ResetPasswordPage';
import { AuthPage } from '../features/auth/AuthPage';
import { authService } from '../services/authService';

// Stubs for JSDOM
globalThis.ResizeObserver = globalThis.ResizeObserver || class { observe() {} unobserve() {} disconnect() {} };

describe('Public Landing, About, and Auth Extensions', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('renders LandingPage with hero, feature grid, and navigation links', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <ToastProvider>
          <LandingPage />
        </ToastProvider>
      </MemoryRouter>
    );

    // Hero title
    expect(
      screen.getByText(/Data-Driven Enterprise SaaS Readiness, Evaluation & Migration Intelligence/i)
    ).toBeInTheDocument();

    // 6 Feature cards
    expect(screen.getByText(/1\. TOE Readiness Assessment/i)).toBeInTheDocument();
    expect(screen.getByText(/2\. Multi-Criteria Recommendation Engine/i)).toBeInTheDocument();
    expect(screen.getByText(/3\. 5×5 Risk Exposure & Heatmap/i)).toBeInTheDocument();
    expect(screen.getByText(/4\. 8-Phase Transformation Planner/i)).toBeInTheDocument();
    expect(screen.getByText(/5\. Context-Aware AI Advisor/i)).toBeInTheDocument();
    expect(screen.getByText(/6\. Executive Telemetry & Reports/i)).toBeInTheDocument();

    // How it works steps
    expect(screen.getByRole('heading', { name: 'Assess' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'De-Risk' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Evaluate' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Migrate' })).toBeInTheDocument();
  });

  it('renders AboutPage with TOE 40-35-25 weights and architecture details', async () => {
    render(
      <MemoryRouter initialEntries={['/about']}>
        <ToastProvider>
          <AboutPage />
        </ToastProvider>
      </MemoryRouter>
    );

    expect(screen.getByText(/About NIRNAY Decision Platform/i)).toBeInTheDocument();
    expect(screen.getByText(/40% Weight/i)).toBeInTheDocument();
    expect(screen.getByText(/35% Weight/i)).toBeInTheDocument();
    expect(screen.getByText(/25% Weight/i)).toBeInTheDocument();
    expect(screen.getByText(/React 18 \+ Vite/i)).toBeInTheDocument();
    expect(screen.getByText(/Supabase PostgreSQL/i)).toBeInTheDocument();
  });

  it('AuthPage allows switching to Forgot Password mode and submitting reset link', async () => {
    const resetSpy = vi.spyOn(authService, 'resetPassword').mockResolvedValue(true);

    render(
      <MemoryRouter initialEntries={['/login']}>
        <ToastProvider>
          <AuthPage />
        </ToastProvider>
      </MemoryRouter>
    );

    // Click Forgot password?
    const forgotBtn = screen.getByRole('button', { name: /forgot password\?/i });
    fireEvent.click(forgotBtn);

    // Form switches to Reset Your Password view
    expect(screen.getByText(/Reset Your Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();

    // Enter email and submit
    const emailInput = screen.getByPlaceholderText(/name@company\.com/i);
    fireEvent.change(emailInput, { target: { value: 'user@enterprise.com' } });

    const submitBtn = screen.getByRole('button', { name: /send reset link/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(resetSpy).toHaveBeenCalledWith('user@enterprise.com');
    });
  });

  it('AuthPage renders Continue with Google and triggers signInWithGoogle', async () => {
    const googleSpy = vi.spyOn(authService, 'signInWithGoogle').mockResolvedValue({
      email: 'demo.user@gmail.com',
      fullName: 'Google Demo User'
    });

    render(
      <MemoryRouter initialEntries={['/login']}>
        <ToastProvider>
          <AuthPage />
        </ToastProvider>
      </MemoryRouter>
    );

    const googleBtn = screen.getByRole('button', { name: /continue with google/i });
    expect(googleBtn).toBeInTheDocument();

    fireEvent.click(googleBtn);

    await waitFor(() => {
      expect(googleSpy).toHaveBeenCalled();
    });
  });

  it('ResetPasswordPage updates password on valid input and matching confirmation', async () => {
    const updateSpy = vi.spyOn(authService, 'updateUserPassword').mockResolvedValue(true);

    render(
      <MemoryRouter initialEntries={['/reset-password']}>
        <ToastProvider>
          <ResetPasswordPage />
        </ToastProvider>
      </MemoryRouter>
    );

    expect(screen.getByText(/Set New Password/i)).toBeInTheDocument();

    const [pwdInput, confirmInput] = screen.getAllByPlaceholderText('••••••••');
    fireEvent.change(pwdInput, { target: { value: 'NewSecret123!' } });
    fireEvent.change(confirmInput, { target: { value: 'NewSecret123!' } });

    const saveBtn = screen.getByRole('button', { name: /save new password/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith('NewSecret123!');
    });
  });
});
