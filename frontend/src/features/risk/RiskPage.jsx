import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { riskService } from '../../services/riskService';
import { formatCurrency } from '../../lib/utils';
import { useToast } from '../../components/Toast';

export function RiskPage() {
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const loadRisks = async () => {
    setLoading(true);
    try {
      const data = await riskService.assessRisks('assessment-ref-case');
      setRiskData(data);
    } catch (err) {
      showToast(`Risk assessment error: ${err.message}`, 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRisks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading || !riskData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const { risks, summary, budgetAnalysis } = riskData;

  const renderHeatmapGrid = () => {
    const rows = [];
    for (let prob = 5; prob >= 1; prob--) {
      const cells = [];
      cells.push(
        <div key={`p-lbl-${prob}`} className="flex items-center justify-center text-[11px] font-bold text-slate-500">
          P {prob}
        </div>
      );
      for (let imp = 1; imp <= 5; imp++) {
        const score = prob * imp;
        const matching = risks.filter(r => r.probability === prob && r.impact === imp);
        const hasRisk = matching.length > 0;

        let bg = 'bg-emerald-950/40 text-emerald-400 border-emerald-900/40';
        if (score >= 16) bg = 'bg-red-950/70 text-red-400 border-red-800/60 font-bold';
        else if (score >= 12) bg = 'bg-amber-950/70 text-amber-400 border-amber-800/60 font-bold';
        else if (score >= 6) bg = 'bg-yellow-950/50 text-yellow-400 border-yellow-800/40';

        cells.push(
          <div
            key={`cell-${prob}-${imp}`}
            className={`h-11 rounded-lg border flex items-center justify-center text-xs relative ${bg}`}
            title={`Prob: ${prob}, Impact: ${imp} (Score: ${score})`}
          >
            {hasRisk ? (
              <span className="w-6 h-6 rounded-full bg-white text-slate-950 text-xs font-black flex items-center justify-center shadow-lg animate-pulse">
                {matching.length}
              </span>
            ) : (
              <span className="opacity-40">{score}</span>
            )}
          </div>
        );
      }
      rows.push(cells);
    }

    const xLabels = [<div key="x-empty" />];
    for (let imp = 1; imp <= 5; imp++) {
      xLabels.push(
        <div key={`i-lbl-${imp}`} className="text-center text-[11px] font-bold text-slate-500 pt-1">
          I {imp}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-6 gap-1.5 p-3 bg-slate-950/70 rounded-xl border border-slate-800">
        {rows.flat()}
        {xLabels}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Enterprise Risk Assessment & Mitigations</h2>
          <p className="text-xs text-slate-400 mt-1">
            Rule-based risk analysis adjusting probabilities based on legacy systems count, data sensitivity, and workforce scale.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={loadRisks}>
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reassess Risks</span>
        </Button>
      </div>

      {/* Overview Grid: 5x5 Heatmap & Budget Fit */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Heatmap Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>5×5 Risk Exposure Heatmap Matrix</CardTitle>
              <CardDescription>Probability (1-5) vs Impact (1-5) mapped against severity thresholds</CardDescription>
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="flex items-center gap-1 text-emerald-400">● Low (1-5)</span>
              <span className="flex items-center gap-1 text-yellow-400">● Med (6-11)</span>
              <span className="flex items-center gap-1 text-amber-400">● High (12-15)</span>
              <span className="flex items-center gap-1 text-red-400">● Crit (16-25)</span>
            </div>
          </CardHeader>
          <CardContent>{renderHeatmapGrid()}</CardContent>
        </Card>

        {/* Budget Fit & Exposure Summary */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Cost Fit & Budget Analysis</CardTitle>
              <CardDescription>Capital expenditure runway</CardDescription>
            </div>
            <Badge variant={budgetAnalysis?.budgetFit === 'Optimal' ? 'success' : 'warning'}>
              {budgetAnalysis?.budgetFit} Fit
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-xs text-slate-400 block">Allocated Annual IT Budget</span>
              <div className="text-2xl font-bold text-white mt-1">{formatCurrency(budgetAnalysis?.itBudget)}</div>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">{budgetAnalysis?.notes}</p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-800/40">
                <span className="text-lg font-bold text-red-400 block">{summary.critical}</span>
                <span className="text-[10px] text-slate-400">Critical</span>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/40">
                <span className="text-lg font-bold text-amber-400 block">{summary.high}</span>
                <span className="text-[10px] text-slate-400">High</span>
              </div>
              <div className="p-2.5 rounded-lg bg-blue-950/40 border border-blue-800/40">
                <span className="text-lg font-bold text-blue-400 block">{summary.medium}</span>
                <span className="text-[10px] text-slate-400">Medium</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assessed Risks List */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white tracking-tight">Evaluated Risk Catalog & Mitigations</h3>
        {risks.map((r) => (
          <Card key={r.templateId} className="hover:border-slate-600 transition">
            <CardHeader className="pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">{r.category}</span>
                <CardTitle className="mt-1">{r.riskTitle}</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono">P: {r.probability} × I: {r.impact} =</span>
                <Badge variant={r.severity === 'Critical' ? 'danger' : r.severity === 'High' ? 'warning' : 'primary'}>
                  {r.severity} ({r.score}/25)
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-0 text-xs">
              <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 text-slate-300 leading-relaxed">
                <strong className="text-slate-200">Contextual Rule Adjustment:</strong> {r.adjustedReason}
              </div>
              <div className="p-3 bg-blue-950/30 rounded-lg border border-blue-900/40 text-blue-200 leading-relaxed">
                <strong className="text-blue-300">Actionable Mitigation Protocol:</strong> {r.mitigation}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
