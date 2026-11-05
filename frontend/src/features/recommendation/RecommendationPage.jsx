import React, { useState, useEffect } from 'react';
import { Sliders, RefreshCw, RotateCcw, Award, Check, ExternalLink, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { PageHeader } from '../../components/PageHeader';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/Table';
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
        setAllProducts(prods || []);
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

  const compareProducts = comparing.map(id => allProducts.find(p => (p.ID || p.id) === id)).filter(Boolean);

  const compareAttributes = [
    { label: 'Platform Category', key: 'category' },
    { label: 'Vendor / Provider', key: 'vendor' },
    { label: 'Pricing Model', key: 'pricingModel' },
    { label: 'Cost Fit Rating', render: p => <span><strong className="text-[#102B46]">{p.costScore}/100</strong> ({p.costLevel})</span> },
    { label: 'Security & Certifications', render: p => <span><strong className="text-[#102B46]">{p.securityScore}/100</strong><br/><span className="text-[#718096] text-[10px]">{p.securityRating}</span></span> },
    { label: 'Scalability Tier', render: p => <span><strong className="text-[#102B46]">{p.scalabilityScore}/100</strong> ({p.scalabilityRating})</span> },
    { label: 'Integration Capability', render: p => <span><strong className="text-[#102B46]">{p.integrationScore}/100</strong><br/><span className="text-[#718096] text-[10px]">{p.integrationCapability}</span></span> },
    { label: 'Features Maturity', render: p => <span><strong className="text-[#102B46]">{p.featuresScore}/100</strong></span> },
    { label: 'Migration Complexity', render: p => <Badge variant={p.migrationComplexity === 'High' ? 'danger' : p.migrationComplexity === 'Medium' ? 'warning' : 'primary'}>{p.migrationComplexity} Complexity</Badge> },
    { label: 'Deployment Topology', key: 'deploymentType' }
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <div className="animate-spin rounded-xl h-9 w-9 border-2 border-[#247C78] border-t-transparent"></div>
        <p className="text-xs text-[#718096]">Evaluating multi-criteria SaaS candidates...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 rounded-2xl bg-white border border-red-200 shadow-sm text-center space-y-4">
        <h3 className="text-base font-bold text-[#102B46]">Evaluation Error</h3>
        <p className="text-xs text-red-600">{error}</p>
        <Button variant="primary" size="sm" onClick={() => runEvaluation()}>
          Retry Evaluation
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      {/* Header */}
      <PageHeader
        title="SaaS Recommendations & Evaluation Engine"
        subtitle="Multi-criteria weighted scoring algorithm with explainable justification and side-by-side product benchmark."
        badge="Module 4"
        actions={
          <Button variant="primary" size="sm" onClick={() => runEvaluation()}>
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Run Weighted Evaluation</span>
          </Button>
        }
      />

      {/* Live Weight Sensitivity Simulation */}
      <Card className="shadow-xs">
        <CardHeader className="pb-3 flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#247C78]/10 text-[#247C78] flex items-center justify-center shrink-0">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-sm">Live Weight Sensitivity Simulation</CardTitle>
              <CardDescription>Tweak criteria weights in real time to test how enterprise priority shifts alter product rankings.</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                isWeightsValid
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              Sum: {weightsSum}% {isWeightsValid ? '✓ Valid' : '✕ Must equal 100%'}
            </span>
            <Button variant="outline" size="sm" onClick={handleResetWeights} title="Reset to standard defaults">
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </Button>
            <Button variant="primary" size="sm" onClick={handleRecalculateSim}>
              Recalculate
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3.5">
            {[
              { key: 'cost', label: 'Cost Fit', color: 'text-amber-600', accent: 'accent-amber-600' },
              { key: 'security', label: 'Security', color: 'text-[#247C78]', accent: 'accent-[#247C78]' },
              { key: 'scalability', label: 'Scalability', color: 'text-[#102B46]', accent: 'accent-[#102B46]' },
              { key: 'integration', label: 'Integration', color: 'text-emerald-600', accent: 'accent-emerald-600' },
              { key: 'features', label: 'Features', color: 'text-purple-600', accent: 'accent-purple-600' }
            ].map(crit => (
              <div key={crit.key} className="space-y-1.5 p-3 rounded-xl bg-[#F4F7FA] border border-[#DCE5EA]">
                <div className="flex justify-between text-xs">
                  <span className="text-[#263746] font-semibold">{crit.label}:</span>
                  <span className={`font-mono font-bold ${crit.color}`}>{weights[crit.key]}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  step="5"
                  value={weights[crit.key]}
                  onChange={(e) => handleSimSliderChange(crit.key, e.target.value)}
                  className={`w-full h-1.5 bg-[#DCE5EA] rounded-lg appearance-none cursor-pointer ${crit.accent}`}
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
                className="bg-white border border-[#DCE5EA] rounded-lg px-2.5 py-1 text-xs text-[#263746] font-medium focus:outline-none focus:border-[#247C78] max-w-[150px] truncate shadow-2xs cursor-pointer"
              >
                {allProducts.map(p => (
                  <option key={p.ID || p.id} value={p.ID || p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-52">Dimension</TableHead>
                {compareProducts.map(p => (
                  <TableHead key={p.ID || p.id} className="text-[#102B46] text-xs">
                    {p.name}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {compareAttributes.map(attr => (
                <TableRow key={attr.label}>
                  <TableCell className="font-semibold text-[#718096] bg-[#F4F7FA]/40">{attr.label}</TableCell>
                  {compareProducts.map(p => (
                    <TableCell key={p.ID || p.id} className="text-[#263746]">
                      {attr.render ? attr.render(p) : p[attr.key] || 'N/A'}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Ranked Recommendations Leaderboard */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#102B46] tracking-tight">Ranked Recommendations Leaderboard</h3>
          <span className="text-xs text-[#718096]">Sorted by Multi-Criteria Composite Score</span>
        </div>

        {results.map((r) => (
          <div
            key={r.productId}
            className="bg-white rounded-xl border border-[#DCE5EA] p-5 shadow-xs hover:border-[#247C78] hover:shadow-sm transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                  r.rank === 1
                    ? 'bg-amber-50 text-amber-700 border border-amber-300'
                    : r.rank === 2
                    ? 'bg-slate-100 text-slate-700 border border-slate-300'
                    : r.rank === 3
                    ? 'bg-amber-100 text-amber-800 border border-amber-400'
                    : 'bg-[#F4F7FA] text-[#718096] border border-[#DCE5EA]'
                }`}
              >
                #{r.rank}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-[#102B46]">{r.productName}</h4>
                  <Badge variant="primary">{r.category}</Badge>
                  <span className="text-xs text-[#718096]">by {r.vendor}</span>
                </div>
                <div className="p-3 rounded-lg bg-[#F4F7FA] border border-[#DCE5EA] text-xs text-[#263746] leading-relaxed max-w-3xl mt-2">
                  <strong className="text-[#102B46]">Decision Rationale:</strong> {r.reason}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end shrink-0 w-full md:w-52 space-y-2 pt-3 md:pt-0 border-t md:border-t-0 border-[#DCE5EA]">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-[#247C78]">{formatNumber(r.totalScore)}</span>
                <span className="text-xs text-[#718096] font-mono">/100</span>
              </div>
              <div className="w-full space-y-1.5 text-[11px]">
                <div className="flex justify-between text-[#718096]">
                  <span>Sec: <strong className="text-[#263746]">{r.securitySubScore}</strong></span>
                  <span>Scale: <strong className="text-[#263746]">{r.scalabilitySubScore}</strong></span>
                  <span>Cost: <strong className="text-[#263746]">{r.costSubScore}</strong></span>
                </div>
                <div className="w-full bg-[#F4F7FA] rounded-full h-1.5 overflow-hidden border border-[#DCE5EA]">
                  <div className="bg-[#247C78] h-full rounded-full" style={{ width: `${r.totalScore}%` }} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
