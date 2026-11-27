import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ToastProvider } from "../components/Toast";
import { DashboardPage } from "../features/dashboard/DashboardPage";

// jsdom has no ResizeObserver (Recharts needs it); real browsers do.
globalThis.ResizeObserver = globalThis.ResizeObserver || class { observe() {} unobserve() {} disconnect() {} };

describe("DashboardPage", () => {
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
});
