import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RefreshCw,
  Award,
  AlertCircle,
  FileText,
  Printer,
  X,
  TrendingUp,
  ShieldAlert,
  Server,
  Layers,
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Building2,
  CheckCircle2,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { dashboardService } from '../../services/dashboardService';
import { companyService } from '../../services/companyService';
import { assessmentService } from '../../services/assessmentService';
import { formatNumber, formatCurrency } from '../../lib/utils';
import { useToast } from '../../components/Toast';

export function DashboardPage() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [companyAssessments, setCompanyAssessments] = useState([]);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const { showToast } = useToast();

  // Load companies for the enterprise filter
  useEffect(() => {
    async function initFilters() {
      try {
        const comps = await companyService.getCompanies();
        setCompanies(comps || []);
        if (comps && comps.length > 0) {
          const defaultComp = comps[0].id || comps[0].ID;
          setSelectedCompanyId(defaultComp);
        }
      } catch (err) {
        console.warn('Failed to load companies for filter:', err);
      }
    }
    initFilters();
  }, []);

  // When selected company changes, load company assessments
  useEffect(() => {
    async function loadAssessments() {
      if (!selectedCompanyId) return;
      try {
        const list = await assessmentService.getAssessments(selectedCompanyId);
        setCompanyAssessments(list || []);
        if (list && list.length > 0) {
          setSelectedAssessmentId(list[0].id || list[0].ID);
        } else {
          setSelectedAssessmentId('assessment-ref-case');
        }
      } catch (err) {
        console.warn('Failed to load assessments for company:', err);
        setSelectedAssessmentId('assessment-ref-case');
      }
    }
    loadAssessments();
  }, [selectedCompanyId]);

  // Load telemetry data whenever the active assessment changes
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const activeId = selectedAssessmentId || 'assessment-ref-case';
      const data = await dashboardService.getDashboardMetrics(activeId);
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
  }, [selectedAssessmentId, showToast]);

  useEffect(() => {
    if (selectedAssessmentId) {
      loadData();
    }
    const handleRefresh = () => loadData();
    window.addEventListener('saas:data_refreshed', handleRefresh);
    return () => window.removeEventListener('saas:data_refreshed', handleRefresh);
  }, [loadData, selectedAssessmentId]);

  // Recharts Dataset for TOE Readiness Pillars
  const toeChartData = useMemo(() => {
    if (!metrics?.assessment) return [];
    const a = metrics.assessment;
    return [
      { name: 'Technology (40%)', score: a.toeTechScore || 65, fill: '#102B46' },
      { name: 'Organisation (35%)', score: a.toeOrgScore || 85, fill: '#247C78' },
      { name: 'Environment (25%)', score: a.toeEnvScore || 87, fill: '#E7B65C' },
      { name: 'Overall Composite', score: a.readinessScore || 77.5, fill: '#0D9488' }
    ];
  }, [metrics]);

  // Radar chart data for 5 Dimensions (if available in assessmentDetails or synthesized)
  const dimensionRadarData = useMemo(() => {
    if (!metrics?.assessment) return [];
    const a = metrics.assessment;
    const dims = a.readinessDetails?.dimensionScores || {
      'Business & Org': a.toeOrgScore || 80,
      'Technology': a.toeTechScore || 70,
      'Security & Comp': Math.min(100, (a.toeTechScore || 70) + 5),
      'Financial': Math.min(100, (a.toeOrgScore || 80) - 2),
      'Sustainability': a.toeEnvScore || 85
    };

    return [
      { subject: 'Business & Org', A: dims['Business & Org'] || a.toeOrgScore || 80, fullMark: 100 },
      { subject: 'Technology', A: dims['Technology'] || a.toeTechScore || 70, fullMark: 100 },
      { subject: 'Security & Comp', A: dims['Security & Comp'] || 82, fullMark: 100 },
      { subject: 'Financial', A: dims['Financial'] || 78, fullMark: 100 },
      { subject: 'Sustainability', A: dims['Sustainability'] || a.toeEnvScore || 85, fullMark: 100 }
    ];
  }, [metrics]);

  // Recharts Dataset for Post-Go-Live Telemetry
  const telemetryChartData = useMemo(() => {
    if (!metrics?.postGoLive) return [];
    return [
      { metric: 'User Adoption', value: metrics.postGoLive.adoptionRate || 88.4, benchmark: 75.0, fill: '#247C78' },
      { metric: 'Cost Efficiency', value: metrics.postGoLive.costEfficiency || 24.6, benchmark: 15.0, fill: '#102B46' },
      { metric: 'License Util.', value: metrics.postGoLive.licenseUtilization || 92.1, benchmark: 80.0, fill: '#E7B65C' }
    ];
  }, [metrics]);

  // Loading State
  if (loading && !metrics) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto p-4 animate-pulse">
        <div className="flex items-center justify-between pb-3 border-b border-[#DCE5EA]">
          <div className="space-y-2">
            <div className="h-6 w-48 bg-[#DCE5EA] rounded"></div>
            <div className="h-4 w-96 bg-[#DCE5EA] rounded"></div>
          </div>
          <div className="h-9 w-32 bg-[#DCE5EA] rounded-lg"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white border border-[#DCE5EA] rounded-xl p-4 space-y-3">
              <div className="h-4 w-28 bg-[#F4F7FA] rounded"></div>
              <div className="h-8 w-16 bg-[#F4F7FA] rounded"></div>
              <div className="h-2 w-full bg-[#F4F7FA] rounded"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 bg-white border border-[#DCE5EA] rounded-xl"></div>
          <div className="h-72 bg-white border border-[#DCE5EA] rounded-xl"></div>
        </div>
      </div>
    );
  }

  // Error State
  if (error && !metrics) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 rounded-2xl bg-white border border-red-200 shadow-sm text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-600 mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-[#102B46]">Error Loading Dashboard</h3>
          <p className="text-xs text-[#718096] mt-1">{error}</p>
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
      <div className="max-w-lg mx-auto my-16 p-8 rounded-2xl bg-white border border-[#DCE5EA] shadow-sm text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-[#F4F7FA] border border-[#DCE5EA] flex items-center justify-center text-[#718096] mx-auto">
          <FileText className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-[#102B46]">No Active Assessment Data</h3>
          <p className="text-xs text-[#718096] mt-1">
            Complete the Enterprise Readiness Assessment wizard to generate executive telemetry, risk calculations, and recommendation scores.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => navigate('/assessment')}>
          <span>Open Assessment Wizard</span>
        </Button>
      </div>
    );
  }

  const { assessment, legacyCount, overallRiskLevel, risks, plan, recommendations, postGoLive } = metrics;
  const topRec = recommendations && recommendations.length > 0 ? recommendations[0] : null;

  // Derive upcoming milestones from the 8-phase plan
  const upcomingPhases = (plan?.phases || []).filter(p => p.progress < 100).slice(0, 3);

  // Derive recent activity feed from assessment and roadmap state
  const activities = [
    {
      id: 1,
      title: `Assessment Completed: ${assessment.title || 'Enterprise Readiness'}`,
      time: 'Just now',
      type: 'assessment',
      tag: `${assessment.readinessScore}/100 Score`
    },
    {
      id: 2,
      title: `Top SaaS Candidate Evaluated: ${topRec?.productName || 'Cloud ERP'}`,
      time: '2 hours ago',
      type: 'recommendation',
      tag: `${topRec?.totalScore || 90}/100 Match`
    },
    {
      id: 3,
      title: `Migration Phase Active: ${plan?.phases?.find(p => p.status === 'Active')?.name || 'Phase 4 - Data Migration'}`,
      time: '1 day ago',
      type: 'planner',
      tag: `${plan?.overallProgress || 35}% Progress`
    },
    {
      id: 4,
      title: `Risk Profile Audited: ${risks.length} threats evaluated`,
      time: '2 days ago',
      type: 'risk',
      tag: `${overallRiskLevel} Risk`
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      {/* Page Header with Breadcrumbs & Action Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#DCE5EA]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-[#102B46] tracking-tight">Executive Dashboard</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#247C78]/10 text-[#247C78] border border-[#247C78]/20">
              Decision Support
            </span>
          </div>
          <p className="text-xs text-[#718096]">
            Enterprise transformation overview, multi-criteria telemetry and decision-support insights.
          </p>
        </div>

        {/* Company & Assessment Filters + Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {companies.length > 0 && (
            <div className="flex items-center gap-1.5 bg-white border border-[#DCE5EA] rounded-lg px-2.5 py-1 text-xs">
              <Building2 className="w-3.5 h-3.5 text-[#718096]" />
              <select
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                className="bg-transparent text-[#263746] font-medium focus:outline-none cursor-pointer"
              >
                {companies.map((c) => (
                  <option key={c.id || c.ID} value={c.id || c.ID}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {companyAssessments.length > 1 && (
            <div className="flex items-center gap-1.5 bg-white border border-[#DCE5EA] rounded-lg px-2.5 py-1 text-xs">
              <span className="text-[#718096] text-[11px]">Assessment:</span>
              <select
                value={selectedAssessmentId}
                onChange={(e) => setSelectedAssessmentId(e.target.value)}
                className="bg-transparent text-[#263746] font-medium focus:outline-none cursor-pointer max-w-[150px] truncate"
              >
                {companyAssessments.map((a) => (
                  <option key={a.id || a.ID} value={a.id || a.ID}>
                    {a.title || `Assessment #${(a.id || '').slice(0, 6)}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Button variant="outline" size="sm" onClick={() => setIsReportModalOpen(true)}>
            <FileText className="w-3.5 h-3.5 text-[#247C78]" />
            <span>Executive Report</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            title="Refresh dashboard with latest database telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* KPI Hero Tiles Grid (Clickable Navigation to Modules) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tile 1: Overall TOE Readiness */}
        <div
          onClick={() => navigate('/assessment')}
          className="group bg-white rounded-xl border border-[#DCE5EA] p-4 shadow-sm hover:border-[#247C78] hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#247C78]" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#718096] uppercase tracking-wider">Overall Readiness</span>
            <div className="w-7 h-7 rounded-lg bg-[#247C78]/10 flex items-center justify-center text-[#247C78] group-hover:bg-[#247C78] group-hover:text-white transition-colors">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-[#102B46]">{formatNumber(assessment.readinessScore)}</span>
            <span className="text-xs font-medium text-[#718096]">/100</span>
            <span className="ml-auto text-[11px] font-semibold text-[#247C78] bg-[#247C78]/10 px-2 py-0.5 rounded-full">
              {assessment.readinessScore >= 75 ? 'Ready' : 'In Progress'}
            </span>
          </div>
          <div className="w-full bg-[#F4F7FA] rounded-full h-1.5 mt-3 overflow-hidden border border-[#DCE5EA]/60">
            <div className="bg-[#247C78] h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, assessment.readinessScore)}%` }} />
          </div>
          <div className="flex justify-between items-center text-[11px] text-[#718096] mt-2.5 pt-2 border-t border-[#DCE5EA]">
            <span>Tech: <strong className="text-[#263746]">{formatNumber(assessment.toeTechScore)}</strong></span>
            <span>Org: <strong className="text-[#263746]">{formatNumber(assessment.toeOrgScore)}</strong></span>
            <span>Env: <strong className="text-[#263746]">{formatNumber(assessment.toeEnvScore)}</strong></span>
          </div>
        </div>

        {/* Tile 2: Migration Risk Profile */}
        <div
          onClick={() => navigate('/risk')}
          className="group bg-white rounded-xl border border-[#DCE5EA] p-4 shadow-sm hover:border-amber-500 hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#718096] uppercase tracking-wider">Risk Profile</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-[#102B46]">{risks.length}</span>
            <span className="text-xs font-medium text-[#718096]">Risks Monitored</span>
            <span className={`ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-full ${
              overallRiskLevel === 'High' || overallRiskLevel === 'Critical'
                ? 'bg-red-50 text-red-600 border border-red-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              {overallRiskLevel} Severity
            </span>
          </div>
          <div className="flex gap-2 mt-3 pt-1">
            <span className="px-2 py-0.5 rounded bg-red-50 text-red-600 text-[10px] font-bold border border-red-200">
              {risks.filter(r => r.severity === 'Critical').length} Critical
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200">
              {risks.filter(r => r.severity === 'High').length} High
            </span>
            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
              {risks.filter(r => r.severity === 'Medium' || r.severity === 'Low').length} Med/Low
            </span>
          </div>
          <div className="flex justify-between items-center text-[11px] text-[#718096] mt-2 pt-2 border-t border-[#DCE5EA]">
            <span>Active Mitigations: <strong className="text-[#263746]">{risks.filter(r => r.mitigation).length}</strong></span>
            <span className="flex items-center text-amber-600 font-medium group-hover:underline">
              Inspect 5x5 <ArrowRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
        </div>

        {/* Tile 3: Legacy Inventory Footprint */}
        <div
          onClick={() => navigate('/assessment')}
          className="group bg-white rounded-xl border border-[#DCE5EA] p-4 shadow-sm hover:border-[#102B46] hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#102B46]" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#718096] uppercase tracking-wider">Legacy Footprint</span>
            <div className="w-7 h-7 rounded-lg bg-[#102B46]/10 flex items-center justify-center text-[#102B46] group-hover:bg-[#102B46] group-hover:text-white transition-colors">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-[#102B46]">{legacyCount}</span>
            <span className="text-xs font-medium text-[#718096]">Monolith Systems</span>
            <span className="ml-auto text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
              {assessment.infrastructure || 'On-premise'}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3 pt-1">
            {(assessment.legacyApplications || []).slice(0, 3).map((app) => (
              <span key={app.id || app.name} className="px-2 py-0.5 rounded bg-[#F4F7FA] text-[#263746] text-[10px] font-mono border border-[#DCE5EA]">
                {(app.name || '').split(' ')[0]}
              </span>
            ))}
            {(assessment.legacyApplications || []).length > 3 && (
              <span className="px-1.5 py-0.5 rounded bg-[#F4F7FA] text-[#718096] text-[10px] border border-[#DCE5EA]">
                +{(assessment.legacyApplications || []).length - 3}
              </span>
            )}
          </div>
          <div className="flex justify-between items-center text-[11px] text-[#718096] mt-2 pt-2 border-t border-[#DCE5EA]">
            <span>Data: <strong className="text-[#263746]">{assessment.dataSensitivity || 'High'}</strong></span>
            <span className="flex items-center text-[#102B46] font-medium group-hover:underline">
              Inventory <ArrowRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
        </div>

        {/* Tile 4: Phased Migration Progress */}
        <div
          onClick={() => navigate('/planner')}
          className="group bg-white rounded-xl border border-[#DCE5EA] p-4 shadow-sm hover:border-[#247C78] hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#247C78]" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#718096] uppercase tracking-wider">Migration Progress</span>
            <div className="w-7 h-7 rounded-lg bg-[#247C78]/10 flex items-center justify-center text-[#247C78] group-hover:bg-[#247C78] group-hover:text-white transition-colors">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-[#102B46]">{formatNumber(plan.overallProgress)}%</span>
            <span className="text-xs font-medium text-[#718096]">Execution</span>
            <span className="ml-auto text-[11px] font-semibold bg-[#247C78]/10 text-[#247C78] px-2 py-0.5 rounded-full">
              Phase {plan.phases?.findIndex(p => p.status === 'Active') + 1 || 4}/8 Active
            </span>
          </div>
          <div className="w-full bg-[#F4F7FA] rounded-full h-1.5 mt-3 overflow-hidden border border-[#DCE5EA]/60">
            <div className="bg-[#247C78] h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, plan.overallProgress)}%` }} />
          </div>
          <div className="flex justify-between items-center text-[11px] text-[#718096] mt-2.5 pt-2 border-t border-[#DCE5EA]">
            <span>Horizon: <strong className="text-[#263746]">{plan.estimatedDurationMonths || 12} Months</strong></span>
            <span className="flex items-center text-[#247C78] font-medium group-hover:underline">
              Gantt View <ArrowRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
        </div>
      </div>

      {/* Main Visualizations: TOE Framework Bar Chart & 5-Dimension Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* TOE Readiness Pillars (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#DCE5EA] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#102B46]">TOE SaaS Readiness Framework</h3>
              <p className="text-xs text-[#718096]">
                Technology (40%), Organisation (35%) and Environment (25%) weighted composite benchmark
              </p>
            </div>
            <span className="text-xs font-semibold text-[#247C78] bg-[#247C78]/10 px-2.5 py-1 rounded-full">
              Actual Telemetry
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={toeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="name" stroke="#718096" fontSize={11} interval={0} />
                <YAxis domain={[0, 100]} stroke="#718096" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#DCE5EA', borderRadius: '0.5rem', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
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
        </div>

        {/* 5-Dimension Radar Profile (1 Col) */}
        <div className="bg-white rounded-xl border border-[#DCE5EA] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-[#102B46]">Dimension Balance</h3>
              <p className="text-xs text-[#718096]">5-dimension diagnostic profile</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={dimensionRadarData}>
                <PolarGrid stroke="#DCE5EA" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#718096', fontSize: 10 }} />
                <PolarRadiusAxis domain={[0, 100]} stroke="#DCE5EA" />
                <Radar name="Readiness" dataKey="A" stroke="#247C78" fill="#247C78" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Secondary Row: Top SaaS Recommendation Spotlight & Evaluated Risks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spotlight Recommendation Solution */}
        {topRec ? (
          <div className="lg:col-span-2 bg-white rounded-xl border border-[#DCE5EA] p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#DCE5EA]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#247C78]/10 border border-[#247C78]/20 flex items-center justify-center text-[#247C78]">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#102B46]">{topRec.productName}</h3>
                    <p className="text-xs text-[#718096]">{topRec.vendor} • {topRec.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#718096]">Score:</span>
                  <span className="text-2xl font-black text-[#247C78]">{formatNumber(topRec.totalScore)}</span>
                  <span className="text-xs text-[#718096] font-mono">/100</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-2"
                    onClick={() => navigate('/recommendations')}
                  >
                    <span>View All</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* Rationale Quote */}
              <div className="mt-3 p-3.5 rounded-lg bg-[#F4F7FA] border border-[#DCE5EA] text-xs text-[#263746] leading-relaxed">
                <strong className="text-[#102B46]">Decision Rationale:</strong> {topRec.reason}
              </div>

              {/* Multi-Criteria Subscores Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                <div className="p-2.5 rounded-lg border border-[#DCE5EA] bg-[#F4F7FA]/50">
                  <span className="text-[11px] text-[#718096] block font-medium">Security (30%)</span>
                  <span className="text-sm font-bold text-[#102B46]">{topRec.securitySubScore}/100</span>
                  <div className="w-full bg-[#DCE5EA] rounded-full h-1 mt-1.5 overflow-hidden">
                    <div className="bg-[#247C78] h-full rounded-full" style={{ width: `${topRec.securitySubScore}%` }} />
                  </div>
                </div>

                <div className="p-2.5 rounded-lg border border-[#DCE5EA] bg-[#F4F7FA]/50">
                  <span className="text-[11px] text-[#718096] block font-medium">Scalability (25%)</span>
                  <span className="text-sm font-bold text-[#102B46]">{topRec.scalabilitySubScore}/100</span>
                  <div className="w-full bg-[#DCE5EA] rounded-full h-1 mt-1.5 overflow-hidden">
                    <div className="bg-[#102B46] h-full rounded-full" style={{ width: `${topRec.scalabilitySubScore}%` }} />
                  </div>
                </div>

                <div className="p-2.5 rounded-lg border border-[#DCE5EA] bg-[#F4F7FA]/50">
                  <span className="text-[11px] text-[#718096] block font-medium">Cost Fit (20%)</span>
                  <span className="text-sm font-bold text-[#102B46]">{topRec.costSubScore}/100</span>
                  <div className="w-full bg-[#DCE5EA] rounded-full h-1 mt-1.5 overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: `${topRec.costSubScore}%` }} />
                  </div>
                </div>

                <div className="p-2.5 rounded-lg border border-[#DCE5EA] bg-[#F4F7FA]/50">
                  <span className="text-[11px] text-[#718096] block font-medium">Integration (15%)</span>
                  <span className="text-sm font-bold text-[#102B46]">{topRec.integrationSubScore}/100</span>
                  <div className="w-full bg-[#DCE5EA] rounded-full h-1 mt-1.5 overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${topRec.integrationSubScore}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 mt-4 border-t border-[#DCE5EA] text-xs">
              <span className="text-[#718096]">Configured with enterprise weights</span>
              <button
                onClick={() => navigate('/catalog')}
                className="text-[#247C78] font-medium hover:underline flex items-center gap-1"
              >
                <span>Browse Product in Catalogue</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 bg-white rounded-xl border border-[#DCE5EA] p-8 text-center flex flex-col items-center justify-center">
            <Award className="w-10 h-10 text-[#718096] mb-2" />
            <h4 className="text-sm font-bold text-[#102B46]">No Recommendation Evaluated</h4>
            <p className="text-xs text-[#718096] mt-1 mb-3">Execute the recommendation engine to generate ranked SaaS candidates.</p>
            <Button variant="primary" size="sm" onClick={() => navigate('/recommendations')}>
              Run Recommendations
            </Button>
          </div>
        )}

        {/* Top Risks Monitoring */}
        <div className="bg-white rounded-xl border border-[#DCE5EA] p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE5EA]">
              <div>
                <h3 className="text-sm font-bold text-[#102B46]">Top Transformation Risks</h3>
                <p className="text-xs text-[#718096]">Highest exposure vectors</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/risk')}>
                <span className="text-xs">Matrix</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>

            <div className="space-y-3 mt-3">
              {risks.slice(0, 3).map((r) => (
                <div key={r.templateId || r.id || r.riskTitle} className="p-3 rounded-lg bg-[#F4F7FA] border border-[#DCE5EA] space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#102B46] truncate max-w-[180px]">{r.riskTitle}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      r.severity === 'Critical'
                        ? 'bg-red-50 text-red-600 border border-red-200'
                        : r.severity === 'High'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {r.severity} ({r.score}/25)
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-[#DCE5EA] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        r.severity === 'Critical' ? 'bg-red-500' : r.severity === 'High' ? 'bg-amber-500' : 'bg-[#247C78]'
                      }`}
                      style={{ width: `${(r.score / 25) * 100}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-[#718096] line-clamp-1">{r.mitigation || 'Mitigation plan established'}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-[#DCE5EA] text-right">
            <span className="text-[11px] text-[#718096]">
              All risks mapped to 5x5 Probability x Impact grid
            </span>
          </div>
        </div>
      </div>

      {/* Third Row: Upcoming Milestones & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Migration Milestones */}
        <div className="bg-white rounded-xl border border-[#DCE5EA] p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#DCE5EA]">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#247C78]" />
              <h3 className="text-sm font-bold text-[#102B46]">Upcoming Milestones</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/planner')}>
              <span className="text-xs">Roadmap</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>

          <div className="space-y-3 mt-3">
            {upcomingPhases.map((phase) => (
              <div key={phase.id || phase.sequence} className="p-3.5 rounded-lg border border-[#DCE5EA] hover:bg-[#F4F7FA]/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#102B46] text-white text-[11px] font-bold flex items-center justify-center">
                      {phase.sequence}
                    </span>
                    <span className="text-xs font-bold text-[#102B46]">{phase.name}</span>
                  </div>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    phase.status === 'Active'
                      ? 'bg-[#247C78]/10 text-[#247C78] border border-[#247C78]/20'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {phase.status} ({phase.progress}%)
                  </span>
                </div>
                <div className="w-full bg-[#DCE5EA] rounded-full h-1.5 mt-2.5 overflow-hidden">
                  <div className="bg-[#247C78] h-full rounded-full" style={{ width: `${phase.progress}%` }} />
                </div>
                <div className="flex justify-between text-[11px] text-[#718096] mt-2">
                  <span>Deliverable: <strong className="text-[#263746]">{phase.deliverables?.split(',')[0] || 'Core milestone'}</strong></span>
                  <span>Target: <strong className="text-[#263746]">{phase.endDate || 'Scheduled'}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transformation Activity */}
        <div className="bg-white rounded-xl border border-[#DCE5EA] p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#DCE5EA]">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#102B46]" />
              <h3 className="text-sm font-bold text-[#102B46]">Recent Activity Feed</h3>
            </div>
            <span className="text-[11px] text-[#718096]">Audit Trail</span>
          </div>

          <div className="space-y-3 mt-3">
            {activities.map((act) => (
              <div key={act.id} className="flex items-start gap-3 p-3 rounded-lg border border-[#DCE5EA] bg-[#F4F7FA]/30">
                <div className="w-8 h-8 rounded-lg bg-[#247C78]/10 text-[#247C78] flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-[#102B46] truncate">{act.title}</p>
                    <span className="text-[10px] text-[#718096] shrink-0">{act.time}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-semibold text-[#247C78] bg-[#247C78]/10 px-2 py-0.5 rounded">
                      {act.tag}
                    </span>
                    <span className="text-[10px] text-[#718096] capitalize">• Module: {act.type}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Transformation Advisor Teaser Card */}
      <div className="bg-gradient-to-r from-[#102B46] to-[#1a3f63] rounded-xl p-5 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-amber-300 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Need AI Transformation Guidance?</h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Consult the AI Advisor to interpret readiness gaps, risk trade-offs, and migration sequence recommendations.
            </p>
          </div>
        </div>
        <Button
          variant="primary"
          size="sm"
          className="bg-[#247C78] hover:bg-[#1f6b67] text-white border-none shrink-0"
          onClick={() => navigate('/assistant')}
        >
          <span>Open AI Advisor</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Executive Report Modal */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="Executive Transformation Summary Report"
        subtitle="Confidential Transformation Advisory Briefing (Design Project-I)"
        maxWidth="max-w-3xl"
      >
        <div className="space-y-5 text-xs text-[#263746]">
          <div className="p-4 rounded-xl bg-[#F4F7FA] border border-[#DCE5EA] space-y-2">
            <div className="flex justify-between items-center text-sm font-bold text-[#102B46]">
              <span>{assessment.company?.name || 'Enterprise Assessment'}</span>
              <span className="text-[#247C78]">TOE Readiness: {assessment.readinessScore}/100</span>
            </div>
            <p className="text-[#718096]">
              Annual IT Budget: <strong className="text-[#102B46]">{formatCurrency(assessment.company?.itBudget || 1500000)}</strong> | Headcount: <strong className="text-[#102B46]">{(assessment.company?.employees || 1000).toLocaleString()} Employees</strong>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-lg bg-white border border-[#DCE5EA]">
              <span className="text-[#718096] block font-semibold">Recommended Cloud Solution:</span>
              <div className="text-sm font-bold text-[#247C78] mt-1">{topRec?.productName} ({topRec?.vendor})</div>
              <span className="text-[11px] text-[#718096]">Evaluation Score: {topRec?.totalScore}/100</span>
            </div>
            <div className="p-3.5 rounded-lg bg-white border border-[#DCE5EA]">
              <span className="text-[#718096] block font-semibold">Transformation Timeline:</span>
              <div className="text-sm font-bold text-[#102B46] mt-1">8 Phases ({plan.estimatedDurationMonths} Months)</div>
              <span className="text-[11px] text-[#718096]">Target Go-Live: {plan.targetEndDate}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="font-semibold text-[#102B46]">Strategic Summary & Recommendation:</span>
            <p className="p-3.5 rounded-lg bg-white border border-[#DCE5EA] leading-relaxed text-[#263746]">
              Based on multi-criteria optimization, {topRec?.productName} demonstrates the strongest architectural alignment with your organization&apos;s security mandate (30% weight) and high-volume data classification. Phased migration across {legacyCount} legacy systems is scheduled over {plan.estimatedDurationMonths} months with comprehensive dual-run reconciliations.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#DCE5EA]">
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
