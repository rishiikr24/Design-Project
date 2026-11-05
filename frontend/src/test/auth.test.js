import { describe, it, expect, beforeEach } from 'vitest';
import { authService } from '../services/authService';

describe('Auth Service (Unified Access Model)', () => {
  beforeEach(async () => {
    await authService.login('rishi.kumar@apexglobal.com');
  });

  it('authenticates user and returns profile metadata', async () => {
    const user = await authService.getCurrentUser();
    expect(user).toBeDefined();
    expect(user.email).toBe('rishi.kumar@apexglobal.com');
    expect(user.fullName).toBeDefined();
  });

  it('registers a new user profile with organization association', async () => {
    const uniqueEmail = `test-${Date.now()}@testcorp.com`;
    const newUser = await authService.register({
      fullName: 'Test User',
      email: uniqueEmail,
      company_ID: 'comp-apex-global'
    });

    expect(newUser).toBeDefined();
    expect(newUser.email).toBe(uniqueEmail);
    expect(newUser.fullName).toBe('Test User');
    expect(newUser.company_ID).toBe('comp-apex-global');
  });

  it('persists current user across sessions', async () => {
    const user = await authService.getCurrentUser();
    expect(user.email).toBeDefined();
  });

  it('logs out and clears active user session', async () => {
    await authService.logout();
    const user = await authService.getCurrentUser();
    expect(user).toBeNull();
  });
});
