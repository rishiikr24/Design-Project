import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ToastProvider } from "../components/Toast";
import { DashboardPage } from "../features/dashboard/DashboardPage";
import { companyService } from "../services/companyService";
import { assessmentService } from "../services/assessmentService";
import { dashboardService } from "../services/dashboardService";

// jsdom has no ResizeObserver (Recharts needs it); real browsers do.
globalThis.ResizeObserver = globalThis.ResizeObserver || class { observe() {} unobserve() {} disconnect() {} };

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("leaves the loading skeleton and renders the executive dashboard (mock mode)", async () => {
    render(
      <MemoryRouter>
        <ToastProvider>
          <DashboardPage />
        </ToastProvider>
      </MemoryRouter>
    );
    expect(await screen.findByText("Executive Dashboard", {}, { timeout: 4000 })).toBeInTheDocument();
  });

  it("renders the post-go-live telemetry chart with simulated reference values label", async () => {
    render(
      <MemoryRouter>
        <ToastProvider>
          <DashboardPage />
        </ToastProvider>
      </MemoryRouter>
    );
    expect(await screen.findByText("Post-Go-Live Telemetry & Value Realization", {}, { timeout: 4000 })).toBeInTheDocument();
    expect(screen.getByText("Simulated reference values")).toBeInTheDocument();
  });

  it("exits loading skeleton and renders clean empty state when companies list is empty", async () => {
    vi.spyOn(companyService, "getCompanies").mockResolvedValue({ companies: [], users: [] });
    vi.spyOn(dashboardService, "getDashboardMetrics").mockResolvedValue(null);

    render(
      <MemoryRouter>
        <ToastProvider>
          <DashboardPage />
        </ToastProvider>
      </MemoryRouter>
    );

    expect(await screen.findByText("No Active Assessment Data", {}, { timeout: 4000 })).toBeInTheDocument();
    expect(screen.getByText("Open Assessment Wizard")).toBeInTheDocument();
  });

  it("exits loading skeleton and renders clean empty state when company has zero assessments", async () => {
    vi.spyOn(companyService, "getCompanies").mockResolvedValue({
      companies: [{ id: "comp-new", name: "Brand New Tenant Corp" }],
      users: []
    });
    vi.spyOn(assessmentService, "getAssessments").mockResolvedValue([]);
    vi.spyOn(dashboardService, "getDashboardMetrics").mockResolvedValue(null);

    render(
      <MemoryRouter>
        <ToastProvider>
          <DashboardPage />
        </ToastProvider>
      </MemoryRouter>
    );

    expect(await screen.findByText("No Active Assessment Data", {}, { timeout: 4000 })).toBeInTheDocument();
    expect(screen.getByText("Open Assessment Wizard")).toBeInTheDocument();
  });
});

