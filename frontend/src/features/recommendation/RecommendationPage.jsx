import { useState, useEffect } from 'react';
import { Sliders, RefreshCw, RotateCcw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { recommendationService } from '../../services/recommendationService';
import { catalogService } from '../../services/catalogService';
import { DEFAULT_WEIGHTS, validateWeights } from '../../lib/scoring';
import { formatNumber } from '../../lib/utils';
import { useToast } from '../../components/Toast';

export function RecommendationPage() {
  const [results, setResults] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [weights, setWeights] = useState({ ...DEFAULT_WEIGHTS });
  const [comparing, setComparing] = useState(['sap-cloud-erp', 'salesforce-crm', 'ms-dynamics-365']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  const runEvaluation = async (customWeights = weights) => {
    try {
      const data = await recommendationService.evaluate({
        assessmentId: 'assessment-ref-case',
        weights: customWeights
      });
      setResults(data.results || []);
    } catch (err) {
      setError(err.message || 'Evaluation error');
      showToast(`Evaluation error: ${err.message}`, 'danger');
    }
  };

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        await runEvaluation();
        const prods = await catalogService.getProducts();
        setAllProducts(prods);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSimSliderChange = (criterion, value) => {
    const updated = {
      ...weights,
      [criterion]: Number(value)
    };
    setWeights(updated);
    if (validateWeights(updated)) {
      runEvaluation(updated);
    }
  };

  const weightsSum = Object.values(weights).reduce((a, b) => a + Number(b), 0);
  const isWeightsValid = validateWeights(weights);

  const handleResetWeights = () => {
    setWeights({ ...DEFAULT_WEIGHTS });
    runEvaluation(DEFAULT_WEIGHTS);
    showToast('Simulation weights reset to defaults (20/30/25/15/10)', 'info');
  };

  const handleRecalculateSim = () => {
    if (!isWeightsValid) {
      showToast(`Simulation weights must total 100% (Current: ${weightsSum}%)`, 'warning');
      return;
    }
    runEvaluation(weights);
    showToast('Simulation evaluated with custom weights', 'success');
  };

  const compareProducts = comparing.map(id => allProducts.find(p => p.ID === id)).filter(Boolean);

  const compareAttributes = [
    { label: 'Platform Category', key: 'category' },
    { label: 'Vendor / Provider', key: 'vendor' },
    { label: 'Pricing Model', key: 'pricingModel' },
    { label: 'Cost Fit Rating', render: p => <span><strong>{p.costScore}/100</strong> ({p.costLevel})</span> },
    { label: 'Security & Certifications', render: p => <span><strong>{p.securityScore}/100</strong><br/><span className="text-slate-400 text-[10px]">{p.securityRating}</span></span> },
    { label: 'Scalability Tier', render: p => <span><strong>{p.scalabilityScore}/100</strong> ({p.scalabilityRating})</span> },
    { label: 'Integration Capability', render: p => <span><strong>{p.integrationScore}/100</strong><br/><span className="text-slate-400 text-[10px]">{p.integrationCapability}</span></span> },
    { label: 'Features Maturity', render: p => <span><strong>{p.featuresScore}/100</strong></span> },
    { label: 'Migration Complexity', render: p => <Badge variant={p.migrationComplexity === 'High' ? 'danger' : p.migrationComplexity === 'Medium' ? 'warning' : 'primary'}>{p.migrationComplexity} Complexity</Badge> },
    { label: 'Deployment Topology', key: 'deploymentType' }
  ];

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
        <h3 className="text-base font-bold text-white">Evaluation Error</h3>
        <p className="text-xs text-red-300">{error}</p>
        <Button variant="primary" size="sm" onClick={() => runEvaluation()}>
          Retry Evaluation
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-white tracking-tight">SaaS Recommendation Engine & Comparison</h2>
            <Badge variant="cyan">Module 4</Badge>
          </div>
          <p className="text-xs text-slate-400">
            Multi-criteria weighted scoring algorithm with explainable justification and side-by-side product comparison.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => runEvaluation()}>
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Run Weighted Evaluation</span>
        </Button>
      </div>

      {/* Live Weight Sensitivity Simulation */}
      <Card className="border-blue-500/20 bg-slate-900/90 shadow-lg">
        <CardHeader className="pb-3 flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <div>
              <CardTitle className="text-sm">Live Weight Sensitivity Simulation</CardTitle>
              <CardDescription>Tweak criteria weights in real time to test how enterprise priority shifts alter product rankings.</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                isWeightsValid
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-red-500/20 text-red-400 border border-red-500/40'
              }`}
            >
              Sum: {weightsSum}% {isWeightsValid ? '✓ Valid' : '✕'}
            </span>
            <Button variant="outline" size="sm" onClick={handleResetWeights} title="Reset to PRD standard default">
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </Button>
            <Button variant="outlineCyan" size="sm" onClick={handleRecalculateSim}>
              Recalculate
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {[
              { key: 'cost', label: 'Cost Fit', color: 'text-amber-400' },
              { key: 'security', label: 'Security', color: 'text-blue-400' },
              { key: 'scalability', label: 'Scalability', color: 'text-cyan-400' },
              { key: 'integration', label: 'Integration', color: 'text-emerald-400' },
              { key: 'features', label: 'Features', color: 'text-purple-400' }
            ].map(crit => (
              <div key={crit.key} className="space-y-1 p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/50">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">{crit.label}:</span>
                  <span className={`font-mono font-bold ${crit.color}`}>{weights[crit.key]}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  step="5"
                  value={weights[crit.key]}
                  onChange={(e) => handleSimSliderChange(crit.key, e.target.value)}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Side-by-Side Comparison Matrix */}
      <Card>
        <CardHeader className="flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <CardTitle>Side-by-Side Product Comparison Matrix</CardTitle>
            <CardDescription>Select any 3 catalog candidate platforms to benchmark architecture, security, cost, and complexity.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {[0, 1, 2].map(idx => (
              <select
                key={idx}
                value={comparing[idx] || ''}
                onChange={(e) => {
                  const copy = [...comparing];
                  copy[idx] = e.target.value;
                  setComparing(copy);
                }}
                className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500 max-w-[140px] truncate"
              >
                {allProducts.map(p => (
                  <option key={p.ID} value={p.ID} className="bg-slate-900 text-white">
                    {p.name}
                  </option>
                ))}
              </select>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-300 border-b border-slate-700/80">
              <tr>
                <th className="p-3 w-48 font-bold">Dimension</th>
                {compareProducts.map(p => (
                  <th key={p.ID} className="p-3 font-bold text-white text-sm">{p.name}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {compareAttributes.map(attr => (
                <tr key={attr.label} className="hover:bg-slate-800/30">
                  <td className="p-3 font-semibold text-slate-400 bg-slate-900/40">{attr.label}</td>
                  {compareProducts.map(p => (
                    <td key={p.ID} className="p-3 text-slate-200">
                      {attr.render ? attr.render(p) : p[attr.key] || 'N/A'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Ranked Recommendations Leaderboard */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white tracking-tight">Ranked Recommendations Leaderboard</h3>
        {results.map((r) => (
          <Card key={r.productId} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 gap-4 hover:border-slate-600 transition">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0 ${
                r.rank === 1 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                r.rank === 2 ? 'bg-slate-300/20 text-slate-200 border border-slate-400/40' :
                r.rank === 3 ? 'bg-amber-700/20 text-amber-500 border border-amber-700/40' :
                'bg-slate-800 text-slate-400 border border-slate-700'
              }`}>
                #{r.rank}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-white">{r.productName}</h4>
                  <Badge variant="cyan">{r.category}</Badge>
                </div>
                <p className="text-xs text-slate-400">{r.vendor}</p>
                <p className="text-xs text-slate-300 pt-1 leading-relaxed max-w-2xl">
                  <strong>Rationale:</strong> {r.reason}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end shrink-0 w-full md:w-48 space-y-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-blue-400">{formatNumber(r.totalScore)}</span>
                <span className="text-xs text-slate-400 font-mono">/100</span>
              </div>
              <div className="w-full space-y-1 text-[10px]">
                <div className="flex justify-between text-slate-400">
                  <span>Sec: {r.securitySubScore}</span>
                  <span>Scale: {r.scalabilitySubScore}</span>
                  <span>Cost: {r.costSubScore}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: `${r.totalScore}%` }} />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
