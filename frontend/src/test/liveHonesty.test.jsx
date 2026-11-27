import { describe, it, expect, vi, beforeEach } from "vitest";
import { assessmentService } from "../services/assessmentService";
import { companyService } from "../services/companyService";
import { catalogService } from "../services/catalogService";
import { supabase } from "../lib/supabase";

// Stub window APIs if needed
globalThis.ResizeObserver = globalThis.ResizeObserver || class { observe() {} unobserve() {} disconnect() {} };
window.HTMLElement.prototype.scrollIntoView = window.HTMLElement.prototype.scrollIntoView || function() {};

describe("Live-Mode Honesty (_syncError reporting)", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("does not attach _syncError in mock mode", async () => {
    const newComp = await companyService.createCompany({
      name: "Honest Mock Corp",
      industry: "Technology"
    });
    expect(newComp._syncError).toBeUndefined();
    expect(newComp.name).toBe("Honest Mock Corp");
  });

  it("attaches _syncError when Supabase upsert fails for assessment", async () => {
    // Mock import.meta.env to simulate live mode
    const originalEnv = import.meta.env.VITE_USE_MOCKS;
    import.meta.env.VITE_USE_MOCKS = 'false';

    const mockUpsert = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "new row violates row-level security policy for table assessments" }
    });
    vi.spyOn(supabase, 'from').mockReturnValue({
      upsert: mockUpsert,
      insert: vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: null, error: { message: "RLS blocked" } }) }) }),
      update: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: { message: "RLS blocked" } }) }) })
    });

    try {
      const saved = await assessmentService.saveAssessment({
        assessment: {
          id: 'test-sync-error',
          companyName: 'Test Sync Co'
        },
        responses: {},
        legacyApps: []
      });

      expect(saved._syncError).toBe("new row violates row-level security policy for table assessments");
    } finally {
      import.meta.env.VITE_USE_MOCKS = originalEnv;
    }
  });

  it("attaches _syncError when Supabase insert fails for catalog product", async () => {
    const originalEnv = import.meta.env.VITE_USE_MOCKS;
    import.meta.env.VITE_USE_MOCKS = 'false';

    vi.spyOn(supabase, 'from').mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: "permission denied for table saas_products" }
          })
        })
      })
    });

    try {
      const added = await catalogService.addProduct({
        name: "Sync Fail CRM",
        vendor: "TestVendor",
        category: "CRM"
      });

      expect(added._syncError).toBe("permission denied for table saas_products");
    } finally {
      import.meta.env.VITE_USE_MOCKS = originalEnv;
    }
  });
});
