import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../app/ProtectedRoute';
import { authService } from '../services/authService';
import { getActiveCompanyId, setActiveCompanyId } from '../lib/activeAssessment';

// Stubs for JSDOM
globalThis.ResizeObserver = globalThis.ResizeObserver || class { observe() {} unobserve() {} disconnect() {} };

describe('Live Auth & Protected Route Routing', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('redirects unauthenticated users to /login', async () => {
    vi.spyOn(authService, 'getCurrentUser').mockResolvedValue(null);
    vi.spyOn(authService, 'onAuthStateChange').mockImplementation(() => () => {});

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/login" element={<div>Login Page Screen</div>} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Secret Protected Dashboard</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('Login Page Screen')).toBeInTheDocument();
    expect(screen.queryByText('Secret Protected Dashboard')).not.toBeInTheDocument();
  });

  it('allows authenticated users through ProtectedRoute', async () => {
    const mockUser = {
      id: 'usr-123',
      email: 'jane@enterprise.com',
      fullName: 'Jane Doe',
      role: 'Manager',
      company_id: 'comp-tenant-456'
    };
    vi.spyOn(authService, 'getCurrentUser').mockResolvedValue(mockUser);
    vi.spyOn(authService, 'onAuthStateChange').mockImplementation(() => () => {});

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/login" element={<div>Login Page Screen</div>} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Secret Protected Dashboard</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('Secret Protected Dashboard')).toBeInTheDocument();
  });

  it('resolves active company id from signed-in user profile with comp-apex-global fallback', () => {
    // 1. Empty localStorage fallback
    expect(getActiveCompanyId()).toBe('comp-apex-global');

    // 2. Explicit company stored
    setActiveCompanyId('comp-custom-org');
    expect(getActiveCompanyId()).toBe('comp-custom-org');

    // 3. Authenticated user takes precedence
    localStorage.setItem(
      'saas_current_user',
      JSON.stringify({
        id: 'usr-abc',
        email: 'user@tenant.com',
        company_id: 'comp-signedin-tenant'
      })
    );
    expect(getActiveCompanyId()).toBe('comp-signedin-tenant');
  });

  it('logout clears active session cleanly', async () => {
    localStorage.setItem(
      'saas_current_user',
      JSON.stringify({ id: 'usr-1', email: 'test@apex.com', role: 'Admin' })
    );

    await authService.logout();

    expect(localStorage.getItem('saas_current_user')).toBeNull();
    expect(localStorage.getItem('saas_auth_logged_out')).toBe('true');
  });
});
