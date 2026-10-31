import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { Card, CardTitle, CardContent } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { plannerService } from '../../services/plannerService';
import { authService } from '../../services/authService';
import { formatNumber } from '../../lib/utils';
import { useToast } from '../../components/Toast';

export function PlannerPage() {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  const loadPlan = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await plannerService.getPlan({});
      setPlan(data);
    } catch (err) {
      setError(err.message || 'Error generating roadmap');
      showToast(`Error loading roadmap: ${err.message}`, 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePhaseChange = async (seq, updates) => {
    const user = await authService.getCurrentUser();
    if (user?.role === 'Viewer') {
      showToast('Viewer role cannot modify roadmap progress', 'warning');
      return;
    }
    try {
      const result = await plannerService.updatePhase(seq, updates);
      setPlan(prev => ({
        ...prev,
        overallProgress: result.overallProgress,
        phases: prev.phases.map(p => (p.sequence === seq ? { ...p, ...updates } : p))
      }));
      showToast(`Updated Phase ${seq} (${result.overallProgress}% overall)`, 'success');
      window.dispatchEvent(new CustomEvent('saas:data_refreshed'));
    } catch (err) {
      showToast(`Error updating phase: ${err.message}`, 'danger');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 rounded-2xl bg-red-950/40 border border-red-500/40 text-center space-y-4">
        <h3 className="text-base font-bold text-white">Roadmap Generation Failed</h3>
        <p className="text-xs text-red-300">{error}</p>
        <Button variant="primary" size="sm" onClick={loadPlan}>
          Retry Generation
        </Button>
      </div>
    );
  }

  if (!plan || !plan.phases || plan.phases.length === 0) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4">
        <h3 className="text-base font-bold text-white">No Roadmap Plan Available</h3>
        <p className="text-xs text-slate-400">Run an evaluation to calibrate roadmap phases.</p>
        <Button variant="primary" size="sm" onClick={loadPlan}>
          Generate Roadmap
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">8-Phase Transformation Migration Roadmap</h2>
          <p className="text-xs text-slate-400 mt-1">
            Phased execution plan adapted to target SaaS product complexity, legacy system volume, and identified risks.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={loadPlan}>
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Regenerate Roadmap</span>
        </Button>
      </div>

      {/* Hero Progress Banner */}
      <Card className="border-emerald-500/30 bg-gradient-to-r from-emerald-950/30 to-slate-900">
        <CardContent className="space-y-4 pt-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg">{plan.title}</CardTitle>
              <span className="text-xs text-slate-400 font-mono mt-1 block">
                Target Duration: {plan.estimatedDurationMonths} Months | {plan.startDate} → {plan.targetEndDate}
              </span>
            </div>
            <div className="text-right">
              <span className="text-3xl font-extrabold text-emerald-400">{formatNumber(plan.overallProgress)}%</span>
              <span className="text-xs text-slate-400 block font-medium">Overall Progress</span>
            </div>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden shadow-inner">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${plan.overallProgress}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* 8-Phase Timeline */}
      <div className="space-y-4">
        {plan.phases.map((p) => {
          const isComplete = p.status === 'Completed' || p.progress === 100;
          const isInProgress = p.status === 'In Progress';

          return (
            <Card
              key={p.sequence}
              className={`transition-all ${
                isComplete ? 'border-emerald-500/40 bg-emerald-950/10' :
                isInProgress ? 'border-blue-500/40 bg-blue-950/10' : 'border-slate-800'
              }`}
            >
              <CardContent className="p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        isComplete ? 'bg-emerald-600 text-white' :
                        isInProgress ? 'bg-blue-600 text-white ring-2 ring-blue-400' :
                        'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {isComplete ? '✓' : p.sequence}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Phase {p.sequence}: {p.name}</h4>
                      <span className="text-[11px] text-slate-400 font-mono">{p.startDate} → {p.endDate}</span>
                    </div>
                  </div>

                  <Badge variant={isComplete ? 'success' : isInProgress ? 'primary' : 'default'}>
                    {p.status}
                  </Badge>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {p.deliverables}
                </p>

                <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 text-xs text-slate-300">
                  <strong className="text-slate-200">Targeted Focus & Mitigation:</strong> {p.riskMitigationFocus}
                </div>

                {/* Progress Bar & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-3 flex-1 max-w-md">
                    <span className="text-xs font-semibold text-slate-300 shrink-0">Progress: {p.progress}%</span>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${isComplete ? 'bg-emerald-500' : 'bg-blue-500'}`}
                        style={{ width: `${p.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <label className="text-slate-400">Status:</label>
                    <select
                      value={p.status}
                      onChange={(e) => handlePhaseChange(p.sequence, { status: e.target.value })}
                      className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Blocked">Blocked</option>
                    </select>

                    <label className="text-slate-400 ml-2">Adjust %:</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={p.progress}
                      onChange={(e) => handlePhaseChange(p.sequence, { progress: Number(e.target.value) })}
                      className="w-24 h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
