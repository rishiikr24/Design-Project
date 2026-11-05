import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, Database, Shield, Bell, Sliders, RefreshCw, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Input, Select } from '../../components/FormElements';
import { DEFAULT_WEIGHTS } from '../../lib/scoring';
import { shouldUseMocks } from '../../lib/supabase';
import { useToast } from '../../components/Toast';

export function SettingsPage() {
  const [weights, setWeights] = useState({ ...DEFAULT_WEIGHTS });
  const [autoSave, setAutoSave] = useState(true);
  const [telemetryFrequency, setTelemetryFrequency] = useState('daily');
  const isMockMode = shouldUseMocks();
  const { showToast } = useToast();

  const handleSave = () => {
    showToast('Platform preferences saved successfully', 'success');
  };

  const handleReset = () => {
    setWeights({ ...DEFAULT_WEIGHTS });
    showToast('Weights reset to baseline standards', 'info');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <PageHeader
        title="Platform Settings & Preferences"
        subtitle="Configure default evaluation criteria weighting, telemetry collection, and enterprise preferences."
        badge="System Configuration"
        actions={
          <Button variant="primary" size="sm" onClick={handleSave}>
            <Save className="w-3.5 h-3.5" />
            <span>Save Settings</span>
          </Button>
        }
      />

      {/* Connectivity & Environment Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#247C78]/10 text-[#247C78] flex items-center justify-center shrink-0">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-sm">Database & Environment Status</CardTitle>
              <CardDescription>Supabase PostgreSQL connection mode and operational health</CardDescription>
            </div>
          </div>
          <Badge variant={isMockMode ? 'warning' : 'success'}>
            {isMockMode ? 'Offline / Mock Engine' : 'Live Supabase Connected'}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          <div className="p-3.5 rounded-xl bg-[#F4F7FA] border border-[#DCE5EA] flex items-center justify-between">
            <div>
              <span className="font-semibold text-[#102B46] block">Data Persistence Layer</span>
              <span className="text-[#718096] text-[11px]">
                {isMockMode
                  ? 'Local deterministic store active with full offline calculation parity'
                  : 'Remote Supabase PostgreSQL schema with RLS protection'}
              </span>
            </div>
            <a
              href="/health"
              className="text-xs font-semibold text-[#247C78] hover:underline"
            >
              Inspect /health
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Default Recommendation Weightings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#102B46]/10 text-[#102B46] flex items-center justify-center shrink-0">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-sm">Default Multi-Criteria Weightings</CardTitle>
              <CardDescription>Standard enterprise scoring formula: Cost (20%), Security (30%), Scalability (25%), Integration (15%), Features (10%)</CardDescription>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Standards</span>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
            {Object.entries(weights).map(([k, v]) => (
              <div key={k} className="p-3 rounded-xl bg-[#F4F7FA] border border-[#DCE5EA] space-y-1">
                <span className="capitalize font-semibold text-[#102B46] block">{k}</span>
                <div className="text-lg font-black text-[#247C78]">{v}%</div>
                <span className="text-[10px] text-[#718096]">Standard weight</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Automated Telemetry & Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-sm">Telemetry & Notification Sync</CardTitle>
              <CardDescription>Periodic status updates and auto-saving behavior</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#DCE5EA] bg-white">
            <div>
              <span className="font-semibold text-[#102B46] block">Assessment Auto-Save Drafts</span>
              <span className="text-[#718096] text-[11px]">Continuously preserve progress across all 5 readiness dimensions</span>
            </div>
            <input
              type="checkbox"
              checked={autoSave}
              onChange={(e) => setAutoSave(e.target.checked)}
              className="w-4 h-4 text-[#247C78] rounded border-[#DCE5EA] focus:ring-[#247C78] cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#DCE5EA] bg-white">
            <div>
              <span className="font-semibold text-[#102B46] block">Post-Go-Live Telemetry Sync Frequency</span>
              <span className="text-[#718096] text-[11px]">Frequency for pulling live SaaS license and adoption metrics</span>
            </div>
            <select
              value={telemetryFrequency}
              onChange={(e) => setTelemetryFrequency(e.target.value)}
              className="bg-[#F4F7FA] border border-[#DCE5EA] rounded-lg px-3 py-1.5 text-xs text-[#102B46] font-medium focus:outline-none focus:border-[#247C78]"
            >
              <option value="hourly">Hourly Real-Time</option>
              <option value="daily">Daily Aggregation</option>
              <option value="weekly">Weekly Rollup</option>
            </select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

