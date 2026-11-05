import React, { useState, useEffect } from 'react';
import { FileText, Printer, Download, Calendar, Building2, Award, TrendingUp, Layers, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { dashboardService } from '../../services/dashboardService';
import { companyService } from '../../services/companyService';
import { formatCurrency, formatNumber } from '../../lib/utils';
import { useToast } from '../../components/Toast';

export function ReportsPage() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    async function loadData() {
      try {
        const data = await dashboardService.getDashboardMetrics('assessment-ref-case');
        setMetrics(data);
      } catch (err) {
        showToast(`Failed to load report data: ${err.message}`, 'danger');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [showToast]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <div className="animate-spin rounded-xl h-9 w-9 border-2 border-[#247C78] border-t-transparent"></div>
        <p className="text-xs text-[#718096]">Compiling executive transformation report...</p>
      </div>
    );
  }

  const assessment = metrics?.assessment || {};
  const topRec = metrics?.recommendations?.[0] || null;
  const plan = metrics?.plan || {};
  const risks = metrics?.risks || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title="Executive Transformation Reports"
        subtitle="Comprehensive decision-support summaries, architectural assessments, and board briefing materials."
        badge="Executive Briefing"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="w-3.5 h-3.5" />
              <span>Print Briefing</span>
            </Button>
            <Button variant="primary" size="sm" onClick={() => window.print()}>
              <Download className="w-3.5 h-3.5" />
              <span>Export PDF</span>
            </Button>
          </div>
        }
      />

      {/* Main Printable Document Card */}
      <div className="bg-white rounded-2xl border border-[#DCE5EA] p-8 shadow-sm space-y-8">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[#DCE5EA]">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#102B46] text-white flex items-center justify-center font-black text-lg tracking-wider">
              N
            </div>
            <div>
              <h2 className="text-xl font-black text-[#102B46] tracking-tight">NIRNAY TRANSFORMATION AUDIT</h2>
              <p className="text-xs text-[#718096] mt-0.5">Confidential Enterprise Cloud Migration Briefing</p>
            </div>
          </div>
          <div className="text-right text-xs text-[#718096]">
            <div>Date: <strong className="text-[#102B46]">{new Date().toLocaleDateString()}</strong></div>
            <div>Ref ID: <strong className="text-[#102B46] font-mono">NIRNAY-DP1-2026</strong></div>
          </div>
        </div>

        {/* Executive Entity Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-[#F4F7FA] border border-[#DCE5EA] text-xs">
          <div>
            <span className="text-[#718096] block font-medium">Enterprise Entity</span>
            <div className="text-sm font-bold text-[#102B46] mt-0.5">{assessment.company?.name || 'Apex Global Enterprises'}</div>
            <span className="text-[11px] text-[#718096]">{assessment.company?.industry || 'Manufacturing'} • {assessment.company?.region || 'Global'}</span>
          </div>
          <div>
            <span className="text-[#718096] block font-medium">Annual IT Operating Budget</span>
            <div className="text-sm font-bold text-[#247C78] mt-0.5">{formatCurrency(assessment.company?.itBudget || 1500000)}</div>
            <span className="text-[11px] text-[#718096]">{(assessment.company?.employees || 1000).toLocaleString()} Active Users</span>
          </div>
          <div>
            <span className="text-[#718096] block font-medium">Infrastructure Topology</span>
            <div className="text-sm font-bold text-[#102B46] mt-0.5">{assessment.infrastructure || 'On-Premise Monolith'}</div>
            <span className="text-[11px] text-[#718096]">{metrics?.legacyCount || 4} Legacy Monoliths Mapped</span>
          </div>
        </div>

        {/* Key Findings Grid */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-[#102B46] uppercase tracking-wider">1. Strategic Readiness & Evaluation Score</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-xl border border-[#DCE5EA] bg-white">
              <span className="text-[#718096] block font-medium">Composite Readiness</span>
              <div className="text-2xl font-black text-[#247C78] mt-1">{assessment.readinessScore}/100</div>
              <span className="text-[10px] text-[#718096]">Target threshold: 75+</span>
            </div>
            <div className="p-3.5 rounded-xl border border-[#DCE5EA] bg-white">
              <span className="text-[#718096] block font-medium">Technology Pillar</span>
              <div className="text-2xl font-black text-[#102B46] mt-1">{assessment.toeTechScore}/100</div>
              <span className="text-[10px] text-[#718096]">40% TOE Weight</span>
            </div>
            <div className="p-3.5 rounded-xl border border-[#DCE5EA] bg-white">
              <span className="text-[#718096] block font-medium">Organisation Pillar</span>
              <div className="text-2xl font-black text-[#102B46] mt-1">{assessment.toeOrgScore}/100</div>
              <span className="text-[10px] text-[#718096]">35% TOE Weight</span>
            </div>
            <div className="p-3.5 rounded-xl border border-[#DCE5EA] bg-white">
              <span className="text-[#718096] block font-medium">Environment Pillar</span>
              <div className="text-2xl font-black text-[#102B46] mt-1">{assessment.toeEnvScore}/100</div>
              <span className="text-[10px] text-[#718096]">25% TOE Weight</span>
            </div>
          </div>
        </div>

        {/* Recommendation Spotlight */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-[#102B46] uppercase tracking-wider">2. Primary Recommended SaaS Architecture</h3>
          <div className="p-5 rounded-xl border border-[#247C78]/30 bg-[#247C78]/5 space-y-3 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-sm font-bold text-[#102B46]">{topRec?.productName}</span>
                <span className="text-[#718096] ml-2">by {topRec?.vendor} • {topRec?.category}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[#718096]">Multi-Criteria Score:</span>
                <span className="text-lg font-black text-[#247C78]">{formatNumber(topRec?.totalScore)}/100</span>
              </div>
            </div>
            <p className="text-[#263746] leading-relaxed">
              <strong>Architectural Justification:</strong> {topRec?.reason}
            </p>
          </div>
        </div>

        {/* Phased Roadmap Execution */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-[#102B46] uppercase tracking-wider">3. 8-Phase Transformation Roadmap</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {(plan?.phases || []).map((p) => (
              <div key={p.sequence} className="p-2.5 rounded-lg border border-[#DCE5EA] bg-[#F4F7FA]/50">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#102B46]">
                  <span>Phase {p.sequence}</span>
                  <Badge variant={p.progress === 100 ? 'success' : p.status === 'Active' ? 'primary' : 'neutral'}>
                    {p.progress}%
                  </Badge>
                </div>
                <div className="text-[11px] text-[#718096] truncate mt-1">{p.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Mitigation Summary */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-[#102B46] uppercase tracking-wider">4. Critical Risk Vectors & Mitigations</h3>
          <div className="space-y-2 text-xs">
            {risks.slice(0, 3).map((r) => (
              <div key={r.riskTitle} className="p-3 rounded-lg border border-[#DCE5EA] bg-white flex items-start justify-between gap-3">
                <div>
                  <span className="font-bold text-[#102B46]">{r.riskTitle}</span>
                  <p className="text-[#718096] text-[11px] mt-0.5">{r.mitigation}</p>
                </div>
                <Badge variant={r.severity === 'Critical' ? 'danger' : r.severity === 'High' ? 'warning' : 'primary'}>
                  {r.severity} ({r.score}/25)
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Sign-Off Footer */}
        <div className="pt-6 border-t border-[#DCE5EA] flex flex-col sm:flex-row justify-between items-center text-xs text-[#718096] gap-4">
          <span>Prepared by NIRNAY Enterprise Transformation Advisory Engine</span>
          <span className="font-semibold text-[#102B46]">Design Project-I | E1ITA306</span>
        </div>
      </div>
    </div>
  );
}

