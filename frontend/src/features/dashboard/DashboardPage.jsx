import { useEffect, useState, useCallback } from 'react';
import { RefreshCw, Award, AlertCircle, FileText, Printer, X } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { dashboardService } from '../../services/dashboardService';
import { formatNumber, formatCurrency } from '../../lib/utils';
import { useToast } from '../../components/Toast';

export function DashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const { showToast } = useToast();

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dashboardService.getDashboardMetrics('assessment-ref-case');
      if (!data || !data.assessment) {
        setMetrics(null);
      } else {
        setMetrics(data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load executive telemetry');
      showToast(`Dashboard error: ${err.message}`, 'danger');
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

  // Loading State
  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto p-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 animate-pulse">
          <div className="h-6 w-64 bg-slate-800 rounded"></div>
          <div className="h-8 w-28 bg-slate-800 rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="h-4 w-28 bg-slate-800 rounded"></div>
              <div className="h-8 w-16 bg-slate-800 rounded"></div>
              <div className="h-2 w-full bg-slate-800 rounded"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
          <div className="lg:col-span-2 h-72 bg-slate-900 border border-slate-800 rounded-xl"></div>
          <div className="h-72 bg-slate-900 border border-slate-800 rounded-xl"></div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 rounded-2xl bg-red-950/40 border border-red-500/40 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">Error Loading Dashboard</h3>
          <p className="text-xs text-red-300 mt-1">{error}</p>
        </div>
        <Button variant="primary" size="sm" onClick={loadData}>
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Connection</span>
        </Button>
      </div>
    );
  }

  // Empty State
  if (!metrics) {
    return (
      <div className="max-w-lg mx-auto my-16 p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4">
        <FileText className="w-10 h-10 text-slate-500 mx-auto" />
        <div>
          <h3 className="text-base font-bold text-white">No Active Assessment Data</h3>
          <p className="text-xs text-slate-400 mt-1">
            Complete the Enterprise Readiness Assessment wizard to generate executive telemetry, risk calculations, and recommendation scores.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => window.location.assign('/assessment')}>
          <span>Open Assessment Wizard</span>
        </Button>
      </div>
    );
  }

  const { assessment, legacyCount, overallRiskLevel, risks, plan, recommendations, postGoLive } = metrics;
  const topRec = recommendations && recommendations.length > 0 ? recommendations[0] : null;

  // Recharts Dataset for TOE Readiness Pillars
  const toeChartData = [
    { name: 'Technology (40%)', score: assessment.toeTechScore || 65, fill: '#3b82f6' },
    { name: 'Organisation (35%)', score: assessment.toeOrgScore || 85, fill: '#06b6d4' },
    { name: 'Environment (25%)', score: assessment.toeEnvScore || 87, fill: '#10b981' },
    { name: 'Overall Readiness', score: assessment.readinessScore || 77.5, fill: '#6366f1' }
  ];

  // Recharts Dataset for Post-Go-Live Telemetry
  const telemetryChartData = [
    { metric: 'Adoption Rate', value: postGoLive?.adoptionRate || 88.4, benchmark: 75.0, fill: '#10b981' },
    { metric: 'Cost Efficiency', value: postGoLive?.costEfficiency || 24.6, benchmark: 15.0, fill: '#06b6d4' },
    { metric: 'License Utilization', value: postGoLive?.licenseUtilization || 92.1, benchmark: 80.0, fill: '#3b82f6' }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-white tracking-tight">Executive Transformation Dashboard</h2>
            <Badge variant="cyan">Module 7</Badge>
          </div>
          <p className="text-xs text-slate-400">
            Real-time SaaS adoption metrics, TOE readiness, multi-criteria recommendations, and migration progress.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsReportModalOpen(true)}>
            <FileText className="w-3.5 h-3.5" />
            <span>Executive Report</span>
          </Button>
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Telemetry</span>
          </Button>
        </div>
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
              <Badge variant="success">Phase 4/8 Active</Badge>
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

      {/* Main Visualizations: Recharts TOE Readiness & Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: TOE Readiness Pillars (Recharts) */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>TOE SaaS Readiness Framework</CardTitle>
              <CardDescription>Multi-dimensional readiness breakdown across Technology, Organisation & Environment</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={toeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} interval={0} angle={-15} textAnchor="end" />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '12px' }}
                    formatter={(val) => [`${val}/100`, 'Score']}
                  />
                  <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                    {toeChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Chart 2: Post-Go-Live Value Realization (Recharts) */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Post-Go-Live Telemetry & Value Realization</CardTitle>
              <CardDescription>Target performance benchmarks versus actual production cloud telemetry</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={telemetryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis dataKey="metric" stroke="#94a3b8" fontSize={11} />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} unit="%" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '12px' }}
                    formatter={(val) => [`${val}%`, 'Actual Value']}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {telemetryChartData.map((entry, index) => (
                      <Cell key={`cell-tel-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Top Spotlight Solution & Evaluated Risks List */}
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
                  <CardDescription>Calibrated against weighted enterprise criteria (Cost 20, Sec 30, Scale 25, Int 15, Feat 10)</CardDescription>
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

        {/* Risk Distribution List */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Top Migration Risks</CardTitle>
              <CardDescription>Primary exposure factors requiring active mitigation</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {risks.slice(0, 4).map((r) => (
              <div key={r.templateId} className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/50 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white truncate max-w-[180px]">{r.riskTitle}</span>
                  <Badge variant={r.severity === 'Critical' ? 'danger' : r.severity === 'High' ? 'warning' : 'primary'}>
                    {r.severity} ({r.score}/25)
                  </Badge>
                </div>
                <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      r.severity === 'Critical' ? 'bg-red-500' : r.severity === 'High' ? 'bg-amber-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${(r.score / 25) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-1">{r.mitigation}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Executive Report Modal */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="Executive Transformation Summary Report"
        subtitle="Confidential Transformation Advisory Briefing (Design Project-I)"
        maxWidth="max-w-3xl"
      >
        <div className="space-y-5 text-xs text-slate-300">
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-2">
            <div className="flex justify-between items-center text-sm font-bold text-white">
              <span>{assessment.company?.name || 'Apex Global Enterprises'}</span>
              <span className="text-emerald-400">TOE Readiness: {assessment.readinessScore}/100</span>
            </div>
            <p className="text-slate-400">
              Annual IT Budget: <strong className="text-white">{formatCurrency(assessment.company?.itBudget || 1500000)}</strong> | Headcount: <strong className="text-white">{(assessment.company?.employees || 1000).toLocaleString()} Employees</strong>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block font-semibold">Recommended Cloud Suite:</span>
              <div className="text-sm font-bold text-blue-400 mt-1">{topRec?.productName} ({topRec?.vendor})</div>
              <span className="text-[11px] text-slate-500">Evaluation Score: {topRec?.totalScore}/100</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block font-semibold">Transformation Timeline:</span>
              <div className="text-sm font-bold text-emerald-400 mt-1">8 Phases ({plan.estimatedDurationMonths} Months)</div>
              <span className="text-[11px] text-slate-500">Target Go-Live: {plan.targetEndDate}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="font-semibold text-white">Strategic Summary & Recommendation:</span>
            <p className="p-3 rounded-lg bg-slate-900 border border-slate-800 leading-relaxed">
              Based on multi-criteria optimization, {topRec?.productName} demonstrates the strongest architectural alignment with your organization&apos;s security mandate (30% weight) and high-volume data classification. Phased migration across {legacyCount} legacy systems is scheduled over 12 months with comprehensive dual-run reconciliations.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setIsReportModalOpen(false)}>
              <X className="w-3.5 h-3.5" />
              <span>Close Report</span>
            </Button>
            <Button variant="primary" size="sm" onClick={() => window.print()}>
              <Printer className="w-3.5 h-3.5" />
              <span>Print Briefing</span>
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
