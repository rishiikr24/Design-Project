import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  Plus,
  Trash2,
  Edit2,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  X,
  AlertCircle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { PageHeader } from '../../components/PageHeader';
import { Modal } from '../../components/Modal';
import { Input, Select, Textarea } from '../../components/FormElements';
import { riskService } from '../../services/riskService';
import { formatCurrency } from '../../lib/utils';
import { useToast } from '../../components/Toast';

export function RiskPage() {
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states for Create/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRisk, setEditingRisk] = useState(null);
  const [formData, setFormData] = useState({
    riskTitle: '',
    category: 'Security & Compliance',
    probability: 3,
    impact: 3,
    mitigation: '',
    adjustedReason: ''
  });

  // Modal state for Delete confirmation
  const [deletingRisk, setDeletingRisk] = useState(null);

  const { showToast } = useToast();

  const loadRisks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await riskService.assessRisks('assessment-ref-case');
      setRiskData(data);
    } catch (err) {
      setError(err.message || 'Risk assessment calculation error');
      showToast(`Risk assessment error: ${err.message}`, 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRisks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenCreateModal = () => {
    setEditingRisk(null);
    setFormData({
      riskTitle: '',
      category: 'Security & Compliance',
      probability: 3,
      impact: 3,
      mitigation: '',
      adjustedReason: 'Custom identified risk'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (r) => {
    setEditingRisk(r);
    setFormData({
      riskTitle: r.riskTitle || '',
      category: r.category || 'Security & Compliance',
      probability: r.probability || 3,
      impact: r.impact || 3,
      mitigation: r.mitigation || '',
      adjustedReason: r.adjustedReason || ''
    });
    setIsModalOpen(true);
  };

  const handleSaveRisk = (e) => {
    e.preventDefault();
    if (!formData.riskTitle.trim() || !formData.mitigation.trim()) {
      showToast('Please provide a risk title and mitigation protocol', 'warning');
      return;
    }

    const prob = Number(formData.probability);
    const imp = Number(formData.impact);
    const score = prob * imp;
    const severity = score >= 16 ? 'Critical' : score >= 12 ? 'High' : score >= 6 ? 'Medium' : 'Low';

    if (editingRisk) {
      // Update existing
      setRiskData((prev) => {
        const updatedRisks = prev.risks.map((item) => {
          if ((item.templateId && item.templateId === editingRisk.templateId) || (item.id && item.id === editingRisk.id) || item.riskTitle === editingRisk.riskTitle) {
            return {
              ...item,
              riskTitle: formData.riskTitle,
              category: formData.category,
              probability: prob,
              impact: imp,
              score,
              severity,
              mitigation: formData.mitigation,
              adjustedReason: formData.adjustedReason
            };
          }
          return item;
        });
        return {
          ...prev,
          risks: updatedRisks
        };
      });
      showToast(`Risk "${formData.riskTitle}" updated successfully`, 'success');
    } else {
      // Add new
      const newRisk = {
        id: `custom-risk-${Date.now()}`,
        templateId: `custom-${Date.now()}`,
        riskTitle: formData.riskTitle,
        category: formData.category,
        probability: prob,
        impact: imp,
        score,
        severity,
        mitigation: formData.mitigation,
        adjustedReason: formData.adjustedReason || 'Custom identified risk'
      };
      setRiskData((prev) => ({
        ...prev,
        risks: [newRisk, ...(prev.risks || [])]
      }));
      showToast(`Risk "${formData.riskTitle}" added to register`, 'success');
    }

    setIsModalOpen(false);
  };

  const confirmDeleteRisk = () => {
    if (!deletingRisk) return;
    setRiskData((prev) => ({
      ...prev,
      risks: prev.risks.filter(
        (item) =>
          !(
            (item.templateId && item.templateId === deletingRisk.templateId) ||
            (item.id && item.id === deletingRisk.id) ||
            item.riskTitle === deletingRisk.riskTitle
          )
      )
    }));
    showToast(`Risk "${deletingRisk.riskTitle}" deleted`, 'info');
    setDeletingRisk(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <div className="animate-spin rounded-xl h-9 w-9 border-2 border-[#247C78] border-t-transparent"></div>
        <p className="text-xs text-[#718096]">Evaluating enterprise risk exposure vectors...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 rounded-2xl bg-white border border-red-200 shadow-sm text-center space-y-4">
        <h3 className="text-base font-bold text-[#102B46]">Risk Evaluation Failed</h3>
        <p className="text-xs text-red-600">{error}</p>
        <Button variant="primary" size="sm" onClick={loadRisks}>
          Retry Risk Analysis
        </Button>
      </div>
    );
  }

  const { risks = [], summary = {}, budgetAnalysis = {} } = riskData || {};

  const renderHeatmapGrid = () => {
    const rows = [];
    for (let prob = 5; prob >= 1; prob--) {
      const cells = [];
      cells.push(
        <div key={`p-lbl-${prob}`} className="flex items-center justify-center text-[11px] font-bold text-[#718096]">
          P {prob}
        </div>
      );
      for (let imp = 1; imp <= 5; imp++) {
        const score = prob * imp;
        const matching = risks.filter((r) => r.probability === prob && r.impact === imp);
        const hasRisk = matching.length > 0;

        let bg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
        if (score >= 16) bg = 'bg-red-50 text-red-800 border-red-300 font-bold';
        else if (score >= 12) bg = 'bg-amber-50 text-amber-900 border-amber-300 font-bold';
        else if (score >= 6) bg = 'bg-yellow-50 text-yellow-800 border-yellow-200';

        cells.push(
          <div
            key={`cell-${prob}-${imp}`}
            className={`h-11 rounded-lg border flex items-center justify-center text-xs relative transition-all ${bg}`}
            title={`Probability: ${prob}, Impact: ${imp} (Score: ${score})`}
          >
            {hasRisk ? (
              <span className="w-6 h-6 rounded-full bg-[#102B46] text-white text-xs font-black flex items-center justify-center shadow-md">
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
        <div key={`i-lbl-${imp}`} className="text-center text-[11px] font-bold text-[#718096] pt-1">
          I {imp}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-6 gap-2 p-4 bg-[#F4F7FA] rounded-xl border border-[#DCE5EA]">
        {rows.flat()}
        {xLabels}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      {/* Header */}
      <PageHeader
        title="Enterprise Risk Assessment & Mitigations"
        subtitle="Probability vs Impact evaluation calibrated against legacy footprint, data sensitivity, and organizational scale."
        badge="Module 5"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="primary" size="sm" onClick={handleOpenCreateModal}>
              <Plus className="w-3.5 h-3.5" />
              <span>Add Risk</span>
            </Button>
            <Button variant="outline" size="sm" onClick={loadRisks}>
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reassess Risks</span>
            </Button>
          </div>
        }
      />

      {/* Overview Grid: 5x5 Heatmap & Budget Fit */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Heatmap Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>5×5 Risk Exposure Heatmap Matrix</CardTitle>
              <CardDescription>Probability (1-5) vs Impact (1-5) mapped against severity thresholds</CardDescription>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-semibold">
              <span className="flex items-center gap-1 text-emerald-700">● Low (1-5)</span>
              <span className="flex items-center gap-1 text-yellow-700">● Med (6-11)</span>
              <span className="flex items-center gap-1 text-amber-700">● High (12-15)</span>
              <span className="flex items-center gap-1 text-red-700">● Crit (16-25)</span>
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
              {budgetAnalysis?.budgetFit || 'Moderate'} Fit
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-[#F4F7FA] border border-[#DCE5EA]">
              <span className="text-xs text-[#718096] block font-medium">Allocated Annual IT Budget</span>
              <div className="text-2xl font-black text-[#102B46] mt-1">{formatCurrency(budgetAnalysis?.itBudget || 1500000)}</div>
              <p className="text-xs text-[#263746] mt-2 leading-relaxed">{budgetAnalysis?.notes || 'Budget supports phased modernization with contingency buffer.'}</p>
            </div>

            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <span className="text-xl font-black text-red-700 block">
                  {risks.filter((r) => r.severity === 'Critical').length}
                </span>
                <span className="text-[10px] text-red-600 font-semibold uppercase">Critical</span>
              </div>
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                <span className="text-xl font-black text-amber-700 block">
                  {risks.filter((r) => r.severity === 'High').length}
                </span>
                <span className="text-[10px] text-amber-700 font-semibold uppercase">High</span>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                <span className="text-xl font-black text-blue-700 block">
                  {risks.filter((r) => r.severity === 'Medium' || r.severity === 'Low').length}
                </span>
                <span className="text-[10px] text-blue-700 font-semibold uppercase">Med / Low</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assessed Risks List */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#102B46] tracking-tight">Evaluated Risk Catalog & Mitigations</h3>
          <span className="text-xs text-[#718096]">{risks.length} active risks registered</span>
        </div>

        {risks.map((r) => (
          <div
            key={r.templateId || r.id || r.riskTitle}
            className="bg-white rounded-xl border border-[#DCE5EA] p-5 shadow-xs hover:border-[#247C78] transition-all space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#DCE5EA]">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#247C78] block">{r.category}</span>
                <h4 className="text-base font-bold text-[#102B46] mt-0.5">{r.riskTitle}</h4>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#718096] font-mono">P: {r.probability} × I: {r.impact} =</span>
                <Badge variant={r.severity === 'Critical' ? 'danger' : r.severity === 'High' ? 'warning' : 'primary'}>
                  {r.severity} ({r.score}/25)
                </Badge>
                <div className="flex items-center gap-1 border-l border-[#DCE5EA] pl-2 ml-1">
                  <button
                    onClick={() => handleOpenEditModal(r)}
                    className="p-1 text-[#718096] hover:text-[#247C78] hover:bg-[#F4F7FA] rounded transition-colors"
                    title="Edit Risk"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingRisk(r)}
                    className="p-1 text-[#718096] hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete Risk"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-[#F4F7FA] rounded-lg border border-[#DCE5EA] text-[#263746] leading-relaxed">
                <strong className="text-[#102B46]">Contextual Rationale:</strong> {r.adjustedReason}
              </div>
              <div className="p-3 bg-[#247C78]/5 rounded-lg border border-[#247C78]/20 text-[#263746] leading-relaxed">
                <strong className="text-[#247C78]">Actionable Mitigation Protocol:</strong> {r.mitigation}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Risk Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRisk ? 'Edit Identified Risk' : 'Add New Transformation Risk'}
        subtitle="Configure risk exposure attributes, scoring criteria and mitigation plan"
      >
        <form onSubmit={handleSaveRisk} className="space-y-4">
          <Input
            label="Risk Title"
            value={formData.riskTitle}
            onChange={(e) => setFormData({ ...formData, riskTitle: e.target.value })}
            placeholder="e.g. Identity Federation Failure"
            required
          />

          <Select
            label="Category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            <option value="Security & Compliance">Security & Compliance</option>
            <option value="Technical Architecture">Technical Architecture</option>
            <option value="Operational & Change">Operational & Change</option>
            <option value="Financial & Licensing">Financial & Licensing</option>
          </Select>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Probability (1-5)"
              value={formData.probability}
              onChange={(e) => setFormData({ ...formData, probability: Number(e.target.value) })}
            >
              <option value={1}>1 - Rare (&lt;10%)</option>
              <option value={2}>2 - Unlikely (10-30%)</option>
              <option value={3}>3 - Moderate (30-60%)</option>
              <option value={4}>4 - Likely (60-85%)</option>
              <option value={5}>5 - Almost Certain (&gt;85%)</option>
            </Select>

            <Select
              label="Impact (1-5)"
              value={formData.impact}
              onChange={(e) => setFormData({ ...formData, impact: Number(e.target.value) })}
            >
              <option value={1}>1 - Negligible</option>
              <option value={2}>2 - Minor</option>
              <option value={3}>3 - Moderate</option>
              <option value={4}>4 - Major</option>
              <option value={5}>5 - Catastrophic</option>
            </Select>
          </div>

          <Textarea
            label="Actionable Mitigation Protocol"
            value={formData.mitigation}
            onChange={(e) => setFormData({ ...formData, mitigation: e.target.value })}
            placeholder="Document technical safeguards, fallback contingencies, or dual-run protocols..."
            rows={3}
            required
          />

          <Input
            label="Rationale / Context"
            value={formData.adjustedReason}
            onChange={(e) => setFormData({ ...formData, adjustedReason: e.target.value })}
            placeholder="Specific trigger factors in current architecture"
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-[#DCE5EA]">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {editingRisk ? 'Save Changes' : 'Create Risk'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deletingRisk)}
        onClose={() => setDeletingRisk(null)}
        title="Confirm Risk Deletion"
        subtitle="This action will remove the risk entry from active register calculations"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-xs text-red-800 leading-normal">
              Are you sure you want to delete <strong>&quot;{deletingRisk?.riskTitle}&quot;</strong>? This will remove it from the $5 \times 5$ heatmap and risk severity tallies.
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-[#DCE5EA]">
            <Button variant="outline" size="sm" onClick={() => setDeletingRisk(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={confirmDeleteRisk}>
              Delete Risk
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
