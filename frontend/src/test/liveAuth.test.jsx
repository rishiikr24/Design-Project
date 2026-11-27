import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../app/ProtectedRoute';
import { authService } from '../services/authService';
import { supabase } from '../lib/supabase';
import * as supabaseModule from '../lib/supabase';
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

  it('in live mode, constructs authenticated user from session metadata when profiles query returns null', async () => {
    vi.spyOn(supabaseModule, 'shouldUseMocks').mockReturnValue(false);

    vi.spyOn(supabase.auth, 'getUser').mockResolvedValue({
      data: {
        user: {
          id: 'usr-live-789',
          email: 'admin@nirnay.app',
          user_metadata: {
            full_name: 'Ladu Gopal',
            role: 'Admin'
          }
        }
      },
      error: null
    });

    vi.spyOn(supabase, 'from').mockReturnValue({
      select: () => ({
        eq: () => ({
          maybeSingle: () => Promise.resolve({ data: null, error: null })
        })
      })
    });

    const user = await authService.getCurrentUser();

    expect(user).not.toBeNull();
    expect(user.fullName).toBe('Ladu Gopal');
    expect(user.email).toBe('admin@nirnay.app');
    expect(user.role).toBe('Admin');
    expect(user.company_id).toBe('comp-apex-global');
    // Ensure it did not fall back to Alex Morgan or default mock user
    expect(user.fullName).not.toBe('Alex Morgan');
    expect(user.email).not.toBe('alex@company.com');
  });
});
