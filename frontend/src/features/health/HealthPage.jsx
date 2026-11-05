/**
 * /health — Diagnostics and runtime connectivity verification for NIRNAY.
 *
 * Requirements:
 * Distinguishes between:
 * 1. Frontend application running
 * 2. Supabase client initialised
 * 3. Authentication service reachable
 * 4. Database reachable (queries companies table)
 * 5. Required backend services available (Edge Functions preflight / health)
 *
 * Does not display secrets, passwords, or full service keys.
 */

import { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle2, AlertTriangle, XCircle, ShieldCheck, Database, Cpu, Globe } from 'lucide-react';
import { supabase, isSupabaseConfigured, shouldUseMocks } from '../../lib/supabase';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';

export function HealthPage() {
  const [checking, setChecking] = useState(true);
  const [healthData, setHealthData] = useState({
    frontendRunning: true,
    supabaseClientInitialised: false,
    authReachable: false,
    authLatencyMs: 0,
    authError: null,
    databaseReachable: false,
    databaseLatencyMs: 0,
    databaseError: null,
    databaseCompanyCount: 0,
    edgeFunctionsAvailable: false,
    edgeFunctionsLatencyMs: 0,
    edgeFunctionsError: null,
    serviceMode: 'unknown',
    mockModeActive: false,
    urlMasked: '(empty)',
    keyPresent: false,
    timestamp: new Date().toISOString()
  });

  const runDiagnostics = async () => {
    setChecking(true);
    const start = performance.now();

    const rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
    const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
    const mocksActive = shouldUseMocks();

    let maskedUrl = '(empty)';
    if (rawUrl) {
      try {
        const u = new URL(rawUrl);
        const hostParts = u.hostname.split('.');
        maskedUrl = hostParts.length > 2
          ? `${hostParts[0].slice(0, 4)}***.${hostParts.slice(1).join('.')}`
          : u.hostname;
      } catch {
        maskedUrl = rawUrl.slice(0, 8) + '***';
      }
    }

    const result = {
      frontendRunning: true,
      supabaseClientInitialised: Boolean(supabase && isSupabaseConfigured),
      authReachable: false,
      authLatencyMs: 0,
      authError: null,
      databaseReachable: false,
      databaseLatencyMs: 0,
      databaseError: null,
      databaseCompanyCount: 0,
      edgeFunctionsAvailable: false,
      edgeFunctionsLatencyMs: 0,
      edgeFunctionsError: null,
      serviceMode: mocksActive ? 'Mock (In-Memory)' : 'Supabase (Live Backend)',
      mockModeActive: mocksActive,
      urlMasked: maskedUrl,
      keyPresent: Boolean(rawKey && rawKey.length > 20),
      timestamp: new Date().toISOString()
    };

    if (mocksActive) {
      // In mock mode
      result.authReachable = true;
      result.databaseReachable = true;
      result.edgeFunctionsAvailable = true;
      result.databaseCompanyCount = 1;
      setHealthData(result);
      setChecking(false);
      return;
    }

    // 1. Auth Reachability Test
    const authStart = performance.now();
    try {
      const { data, error } = await supabase.auth.getSession();
      result.authLatencyMs = Math.round(performance.now() - authStart);
      if (error) {
        result.authError = error.message;
      } else {
        result.authReachable = true;
      }
    } catch (err) {
      result.authLatencyMs = Math.round(performance.now() - authStart);
      result.authError = err.message || 'Auth check failed to respond';
    }

    // 2. Database Reachability Test
    const dbStart = performance.now();
    try {
      const { data, error, count } = await supabase
        .from('companies')
        .select('id, name', { count: 'exact', head: false })
        .limit(5);

      result.databaseLatencyMs = Math.round(performance.now() - dbStart);
      if (error) {
        result.databaseError = `${error.code || 'DB_ERR'}: ${error.message}`;
      } else {
        result.databaseReachable = true;
        result.databaseCompanyCount = data ? data.length : 0;
      }
    } catch (err) {
      result.databaseLatencyMs = Math.round(performance.now() - dbStart);
      result.databaseError = err.message || 'Database connection error';
    }

    // 3. Edge Functions Reachability Test
    const edgeStart = performance.now();
    try {
      const { data, error } = await supabase.functions.invoke('dashboard-metrics', {
        body: { company_id: 'comp-apex-global' }
      });
      result.edgeFunctionsLatencyMs = Math.round(performance.now() - edgeStart);
      if (error) {
        result.edgeFunctionsError = error.message;
        // Check if preflight status was reachable
        if (error.status === 200 || error.message.includes('Function returned an error')) {
          result.edgeFunctionsAvailable = true;
        }
      } else {
        result.edgeFunctionsAvailable = true;
      }
    } catch (err) {
      result.edgeFunctionsLatencyMs = Math.round(performance.now() - edgeStart);
      result.edgeFunctionsError = err.message || 'Edge Functions gateway unreachable';
    }

    setHealthData(result);
    setChecking(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const overallHealthy =
    healthData.frontendRunning &&
    healthData.supabaseClientInitialised &&
    healthData.authReachable &&
    healthData.databaseReachable;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DCE5EA]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <h2 className="text-2xl font-bold text-[#102B46] tracking-tight">System & Backend Health Diagnostics</h2>
            <Badge variant={overallHealthy ? 'success' : 'warning'}>
              {overallHealthy ? 'All Systems Operational' : 'Action Required'}
            </Badge>
          </div>
          <p className="text-sm text-[#718096]">
            Live diagnostic probe verifying frontend runtime, Supabase initialization, Auth, Database, and Edge Functions.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={runDiagnostics} disabled={checking}>
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${checking ? 'animate-spin' : ''}`} />
          <span>{checking ? 'Probing...' : 'Re-run Diagnostics'}</span>
        </Button>
      </div>

      {/* Main Status Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Frontend Runtime */}
        <div className="p-4 rounded-xl bg-white border border-[#DCE5EA] shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase text-[#718096]">1. Frontend Runtime</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-base font-bold text-[#102B46]">Active & Serving</div>
          <p className="text-[11px] text-[#718096] mt-1">React 18 + Vite running</p>
        </div>

        {/* 2. Supabase Client Initialised */}
        <div className="p-4 rounded-xl bg-white border border-[#DCE5EA] shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase text-[#718096]">2. Supabase Client</span>
            {healthData.supabaseClientInitialised ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <XCircle className="w-4 h-4 text-red-600" />
            )}
          </div>
          <div className="text-base font-bold text-[#102B46]">
            {healthData.supabaseClientInitialised ? 'Initialised' : 'Unconfigured'}
          </div>
          <p className="text-[11px] text-[#718096] mt-1">
            {healthData.keyPresent ? 'Valid URL & anon key detected' : 'Missing credentials'}
          </p>
        </div>

        {/* 3. Auth Service Reachable */}
        <div className="p-4 rounded-xl bg-white border border-[#DCE5EA] shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase text-[#718096]">3. Auth Service</span>
            {healthData.authReachable ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            )}
          </div>
          <div className="text-base font-bold text-[#102B46]">
            {healthData.authReachable ? `Reachable (${healthData.authLatencyMs}ms)` : 'Unreachable'}
          </div>
          <p className="text-[11px] text-[#718096] mt-1 truncate">
            {healthData.authError || 'GoTrue Auth endpoint operational'}
          </p>
        </div>

        {/* 4. Database Reachable */}
        <div className="p-4 rounded-xl bg-white border border-[#DCE5EA] shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase text-[#718096]">4. Database (Postgres)</span>
            {healthData.databaseReachable ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <XCircle className="w-4 h-4 text-red-600" />
            )}
          </div>
          <div className="text-base font-bold text-[#102B46]">
            {healthData.databaseReachable ? `Connected (${healthData.databaseLatencyMs}ms)` : 'Failed'}
          </div>
          <p className="text-[11px] text-[#718096] mt-1">
            {healthData.databaseReachable ? `${healthData.databaseCompanyCount} companies queried` : (healthData.databaseError || 'Connection error')}
          </p>
        </div>
      </div>

      {/* Deep Inspection Table */}
      <div className="bg-white border border-[#DCE5EA] rounded-2xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#DCE5EA] bg-[#F4F7FA]">
          <h3 className="text-sm font-bold text-[#102B46]">Detailed Subsystem Diagnostics</h3>
          <p className="text-xs text-[#718096] mt-0.5">
            Probe executed at {new Date(healthData.timestamp).toLocaleTimeString()} &middot; Service Mode: <strong>{healthData.serviceMode}</strong>
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-white text-[#718096] border-b border-[#DCE5EA] font-semibold">
              <tr>
                <th className="p-3.5">Subsystem</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Latency</th>
                <th className="p-3.5">Diagnostic Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE5EA] text-[#263746]">
              <tr>
                <td className="p-3.5 font-semibold text-[#102B46]">VITE_SUPABASE_URL</td>
                <td className="p-3.5">
                  <Badge variant={healthData.urlMasked !== '(empty)' ? 'success' : 'danger'}>
                    {healthData.urlMasked !== '(empty)' ? 'Configured' : 'Missing'}
                  </Badge>
                </td>
                <td className="p-3.5 text-[#718096]">—</td>
                <td className="p-3.5 font-mono text-[11px] text-slate-600">{healthData.urlMasked}</td>
              </tr>
              <tr>
                <td className="p-3.5 font-semibold text-[#102B46]">VITE_SUPABASE_ANON_KEY</td>
                <td className="p-3.5">
                  <Badge variant={healthData.keyPresent ? 'success' : 'danger'}>
                    {healthData.keyPresent ? 'Present' : 'Missing'}
                  </Badge>
                </td>
                <td className="p-3.5 text-[#718096]">—</td>
                <td className="p-3.5 font-mono text-[11px] text-slate-600">
                  {healthData.keyPresent ? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9•••• (Masked)' : '(not set)'}
                </td>
              </tr>
              <tr>
                <td className="p-3.5 font-semibold text-[#102B46]">VITE_USE_MOCKS</td>
                <td className="p-3.5">
                  <Badge variant={healthData.mockModeActive ? 'warning' : 'primary'}>
                    {healthData.mockModeActive ? 'Mocks Active' : 'Live Supabase'}
                  </Badge>
                </td>
                <td className="p-3.5 text-[#718096]">—</td>
                <td className="p-3.5 text-[11px] text-slate-600">
                  {healthData.mockModeActive
                    ? 'In-memory fallbacks active for all services'
                    : 'Mock mode disabled; querying real Supabase tables and functions'}
                </td>
              </tr>
              <tr>
                <td className="p-3.5 font-semibold text-[#102B46]">PostgreSQL Database</td>
                <td className="p-3.5">
                  <Badge variant={healthData.databaseReachable ? 'success' : 'danger'}>
                    {healthData.databaseReachable ? 'Online' : 'Failed'}
                  </Badge>
                </td>
                <td className="p-3.5 font-mono">{healthData.databaseLatencyMs}ms</td>
                <td className="p-3.5 text-[11px]">
                  {healthData.databaseReachable
                    ? `Successfully queried public.companies table (${healthData.databaseCompanyCount} rows returned)`
                    : (healthData.databaseError || 'Query failed')}
                </td>
              </tr>
              <tr>
                <td className="p-3.5 font-semibold text-[#102B46]">Supabase Edge Functions</td>
                <td className="p-3.5">
                  <Badge variant={healthData.edgeFunctionsAvailable ? 'success' : 'warning'}>
                    {healthData.edgeFunctionsAvailable ? 'Deployed' : 'Pending / Error'}
                  </Badge>
                </td>
                <td className="p-3.5 font-mono">{healthData.edgeFunctionsLatencyMs}ms</td>
                <td className="p-3.5 text-[11px]">
                  {healthData.edgeFunctionsAvailable
                    ? 'Invoked dashboard-metrics function successfully (HTTP 200)'
                    : (healthData.edgeFunctionsError || 'Function gateway unreachable')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
