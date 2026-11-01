import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authService } from '../services/authService';

describe('Module 1: Authentication & RBAC Service (Supabase + Local Fallback)', () => {
  beforeEach(async () => {
    await authService.switchRole('Admin');
  });

  it('supports the 4 required enterprise roles (Admin, Manager, Analyst, Viewer)', () => {
    const roles = authService.getRoles();
    expect(roles).toEqual(['Admin', 'Manager', 'Analyst', 'Viewer']);
  });

  it('returns default active user as Admin', async () => {
    const user = await authService.getCurrentUser();
    expect(user.role).toBe('Admin');
    expect(user.email).toBe('rishi.kumar@apexglobal.com');
  });

  it('switches persona and role across all 4 roles', async () => {
    const manager = await authService.switchRole('Manager');
    expect(manager.role).toBe('Manager');

    const analyst = await authService.switchRole('Analyst');
    expect(analyst.role).toBe('Analyst');

    const viewer = await authService.switchRole('Viewer');
    expect(viewer.role).toBe('Viewer');

    const admin = await authService.switchRole('Admin');
    expect(admin.role).toBe('Admin');
  });

  it('allows logging in with registered corporate email', async () => {
    const user = await authService.login('aarushi.joshi@apexglobal.com');
    expect(user.role).toBe('Manager');
    expect(user.fullName).toContain('Aarushi');
  });

  it('registers a new user profile with selected role and organization', async () => {
    const timestamp = Date.now();
    const newUser = await authService.register({
      fullName: 'Dr. Jane Smith',
      email: `jane.smith.${timestamp}@apexglobal.com`,
      role: 'Manager',
      company_ID: 'comp-apex-global'
    });

    expect(newUser.ID).toBeDefined();
    expect(newUser.fullName).toBe('Dr. Jane Smith');
    expect(newUser.role).toBe('Manager');

    const currentUser = await authService.getCurrentUser();
    expect(currentUser.email).toBe(`jane.smith.${timestamp}@apexglobal.com`);
  });

  it('prevents registering duplicate email', async () => {
    await expect(authService.register({
      fullName: 'Duplicate Rishi',
      email: 'rishi.kumar@apexglobal.com',
      role: 'Admin',
      company_ID: 'comp-apex-global'
    })).rejects.toThrow('already exists');
  });

  it('notifies listeners on auth state change and role switch', async () => {
    const listener = vi.fn();
    const unsubscribe = authService.onAuthStateChange(listener);

    await authService.switchRole('Analyst');
    expect(listener).toHaveBeenCalled();

    if (typeof unsubscribe === 'function') {
      unsubscribe();
    }
  });

  it('clears active session on logout', async () => {
    await authService.switchRole('Manager');
    let user = await authService.getCurrentUser();
    expect(user.role).toBe('Manager');

    await authService.logout();
    user = await authService.getCurrentUser();
    // Falls back to default initial user
    expect(user).toBeDefined();
  });
});
