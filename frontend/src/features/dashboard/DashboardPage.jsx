import { useEffect, useState, useCallback } from 'react';
import { RefreshCw, Award } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { dashboardService } from '../../services/dashboardService';
import { formatNumber } from '../../lib/utils';
import { useToast } from '../../components/Toast';

export function DashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await dashboardService.getDashboardMetrics('assessment-ref-case');
      setMetrics(data);
    } catch (err) {
      showToast(`Failed to load dashboard: ${err.message}`, 'danger');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
    const handleRefresh = () => loadData();
    window.addEventListener('saas:data_refreshed', handleRefresh);
    return () => window.removeEventListener('saas:data_refreshed', handleRefresh);
  }, [loadData]);

  if (loading || !metrics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const { assessment, legacyCount, overallRiskLevel, risks, plan, recommendations, postGoLive } = metrics;
  const topRec = recommendations && recommendations.length > 0 ? recommendations[0] : null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Executive Transformation Dashboard</h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time SaaS adoption metrics, TOE readiness, multi-criteria recommendations, and migration progress.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData}>
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Telemetry</span>
        </Button>
      </div>

      {/* KPI Tiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tile 1: TOE Readiness */}
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">TOE SaaS Readiness</span>
              <Badge variant={assessment.readinessScore >= 75 ? 'success' : 'warning'}>
                {assessment.readinessScore >= 75 ? 'High Readiness' : 'Moderate'}
              </Badge>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-white">{formatNumber(assessment.readinessScore)}</span>
              <span className="text-xs text-slate-400 font-mono">/100</span>
            </div>
            <div className="w-full bg-slate-700/60 rounded-full h-1.5 overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full" style={{ width: `${assessment.readinessScore}%` }} />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 pt-1">
              <span>Tech: <strong className="text-slate-200">{formatNumber(assessment.toeTechScore)}</strong></span>
              <span>Org: <strong className="text-slate-200">{formatNumber(assessment.toeOrgScore)}</strong></span>
              <span>Env: <strong className="text-slate-200">{formatNumber(assessment.toeEnvScore)}</strong></span>
            </div>
          </CardContent>
        </Card>

        {/* Tile 2: Risk Profile */}
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Migration Risk Profile</span>
              <Badge variant={overallRiskLevel === 'High' ? 'danger' : 'warning'}>
                {overallRiskLevel} Risk
              </Badge>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-white">{risks.length}</span>
              <span className="text-xs text-slate-400">Evaluated Risks</span>
            </div>
            <div className="flex gap-2 pt-2">
              <span className="px-2 py-0.5 rounded bg-red-950/80 text-red-400 text-[10px] font-bold border border-red-800/40">
                {risks.filter(r => r.severity === 'Critical').length} Critical
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-400 text-[10px] font-bold border border-amber-800/40">
                {risks.filter(r => r.severity === 'High').length} High
              </span>
              <span className="px-2 py-0.5 rounded bg-blue-950/80 text-blue-400 text-[10px] font-bold border border-blue-800/40">
                {risks.filter(r => r.severity === 'Medium').length} Med
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Tile 3: Legacy Inventory */}
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Legacy Footprint</span>
              <Badge variant="purple">On-Premise</Badge>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-white">{legacyCount}</span>
              <span className="text-xs text-slate-400">Active Monoliths</span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {(assessment.legacyApplications || []).slice(0, 3).map((app) => (
                <span key={app.name} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono border border-slate-700">
                  {app.name.split(' ')[0]}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tile 4: Phased Roadmap Progress */}
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Roadmap Progress</span>
              <Badge variant="success">Phase 4/8</Badge>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-white">{formatNumber(plan.overallProgress)}%</span>
              <span className="text-xs text-slate-400">Complete</span>
            </div>
            <div className="w-full bg-slate-700/60 rounded-full h-1.5 overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${plan.overallProgress}%` }} />
            </div>
            <div className="text-[11px] text-slate-400 pt-1">
              Target: <strong className="text-slate-200">{plan.estimatedDurationMonths || 12} Months</strong>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Top Spotlight Solution & Post-Go-Live Value */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spotlight Solution */}
        {topRec && (
          <Card className="lg:col-span-2 border-blue-500/30">
            <CardHeader className="bg-gradient-to-r from-blue-950/40 to-slate-800/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle>Top Recommended SaaS Platform</CardTitle>
                  <CardDescription>Calibrated against weighted enterprise criteria</CardDescription>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-blue-400">{formatNumber(topRec.totalScore)}</span>
                <span className="text-xs text-slate-400 font-mono">/100</span>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-5">
              <div>
                <h4 className="text-lg font-bold text-white">{topRec.productName}</h4>
                <p className="text-xs text-slate-400">{topRec.vendor} • {topRec.category}</p>
                <p className="text-xs text-slate-300 mt-2 bg-slate-800/60 p-3 rounded-lg border border-slate-700/60 leading-relaxed">
                  <strong>Decision Rationale:</strong> {topRec.reason}
                </p>
              </div>

              {/* Subscores breakdown */}
              <div className="space-y-2 pt-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Security Fit (30% weight)</span>
                    <span className="font-semibold text-slate-200">{topRec.securitySubScore}/100</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${topRec.securitySubScore}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Scalability Fit (25% weight)</span>
                    <span className="font-semibold text-slate-200">{topRec.scalabilitySubScore}/100</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${topRec.scalabilitySubScore}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Cost Fit (20% weight)</span>
                    <span className="font-semibold text-slate-200">{topRec.costSubScore}/100</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${topRec.costSubScore}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Integration Fit (15% weight)</span>
                    <span className="font-semibold text-slate-200">{topRec.integrationSubScore}/100</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${topRec.integrationSubScore}%` }} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Post-Go-Live Value Monitoring */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Post-Go-Live Telemetry</CardTitle>
              <CardDescription>Target vs actual value realization</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-xs text-slate-400">User Adoption Rate</span>
              <div className="text-2xl font-bold text-emerald-400 mt-1">{postGoLive?.adoptionRate}%</div>
              <span className="text-[11px] text-slate-400">+12% vs baseline expectation</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-xs text-slate-400">TCO Cost Efficiency</span>
              <div className="text-2xl font-bold text-cyan-400 mt-1">+{postGoLive?.costEfficiency}%</div>
              <span className="text-[11px] text-slate-400">Infrastructure run-rate reduction</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-xs text-slate-400">Active License Utilization</span>
              <div className="text-2xl font-bold text-blue-400 mt-1">{postGoLive?.licenseUtilization}%</div>
              <span className="text-[11px] text-slate-400">Zero orphaned tier licenses</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
