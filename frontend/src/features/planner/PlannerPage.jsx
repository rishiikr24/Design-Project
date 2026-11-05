import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  Calendar,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  Plus,
  Trash2,
  Edit2,
  User,
  AlertCircle
} from 'lucide-react';
import { Card, CardTitle, CardContent } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { PageHeader } from '../../components/PageHeader';
import { Modal } from '../../components/Modal';
import { Input, Select, Textarea } from '../../components/FormElements';
import { plannerService } from '../../services/plannerService';
import { formatNumber } from '../../lib/utils';
import { useToast } from '../../components/Toast';

export function PlannerPage() {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal for Edit Phase / Task
  const [editingPhase, setEditingPhase] = useState(null);
  const [phaseForm, setPhaseForm] = useState({
    name: '',
    status: 'In Progress',
    progress: 50,
    startDate: '',
    endDate: '',
    deliverables: '',
    riskMitigationFocus: '',
    owner: 'IT Lead'
  });

  // Modal for Add Task / Deliverable
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [targetPhaseSeq, setTargetPhaseSeq] = useState(1);
  const [taskName, setTaskName] = useState('');
  const [taskOwner, setTaskOwner] = useState('IT Lead');

  // Modal for Delete Confirmation
  const [deletingPhase, setDeletingPhase] = useState(null);

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
    try {
      const result = await plannerService.updatePhase(seq, updates);
      setPlan((prev) => ({
        ...prev,
        overallProgress: result.overallProgress,
        phases: prev.phases.map((p) => (p.sequence === seq ? { ...p, ...updates } : p))
      }));
      showToast(`Updated Phase ${seq} (${result.overallProgress}% overall)`, 'success');
      window.dispatchEvent(new CustomEvent('saas:data_refreshed'));
    } catch (err) {
      showToast(`Error updating phase: ${err.message}`, 'danger');
    }
  };

  const handleOpenEditPhase = (p) => {
    setEditingPhase(p);
    setPhaseForm({
      name: p.name || '',
      status: p.status || 'In Progress',
      progress: p.progress || 0,
      startDate: p.startDate || '',
      endDate: p.endDate || '',
      deliverables: p.deliverables || '',
      riskMitigationFocus: p.riskMitigationFocus || '',
      owner: p.owner || 'IT Lead'
    });
  };

  const handleSavePhaseForm = async (e) => {
    e.preventDefault();
    if (!editingPhase) return;
    try {
      await handlePhaseChange(editingPhase.sequence, {
        name: phaseForm.name,
        status: phaseForm.status,
        progress: Number(phaseForm.progress),
        startDate: phaseForm.startDate,
        endDate: phaseForm.endDate,
        deliverables: phaseForm.deliverables,
        riskMitigationFocus: phaseForm.riskMitigationFocus,
        owner: phaseForm.owner
      });
      setEditingPhase(null);
    } catch (err) {
      showToast(`Failed to save: ${err.message}`, 'danger');
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!taskName.trim()) {
      showToast('Please specify a task deliverable', 'warning');
      return;
    }
    const currentPhase = (plan?.phases || []).find((p) => p.sequence === Number(targetPhaseSeq));
    if (!currentPhase) return;

    const updatedDeliverables = currentPhase.deliverables
      ? `${currentPhase.deliverables}; ${taskName} [${taskOwner}]`
      : `${taskName} [${taskOwner}]`;

    await handlePhaseChange(targetPhaseSeq, { deliverables: updatedDeliverables });
    setTaskName('');
    setIsAddTaskModalOpen(false);
    showToast(`Task assigned to Phase ${targetPhaseSeq}`, 'success');
  };

  const confirmDeletePhase = (seq) => {
    setPlan((prev) => {
      const remainingPhases = prev.phases.filter((p) => p.sequence !== seq);
      return {
        ...prev,
        phases: remainingPhases
      };
    });
    setDeletingPhase(null);
    showToast(`Phase deleted from active roadmap`, 'info');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <div className="animate-spin rounded-xl h-9 w-9 border-2 border-[#247C78] border-t-transparent"></div>
        <p className="text-xs text-[#718096]">Loading 8-phase transformation timeline...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 rounded-2xl bg-white border border-red-200 shadow-sm text-center space-y-4">
        <h3 className="text-base font-bold text-[#102B46]">Roadmap Generation Failed</h3>
        <p className="text-xs text-red-600">{error}</p>
        <Button variant="primary" size="sm" onClick={loadPlan}>
          Retry Generation
        </Button>
      </div>
    );
  }

  if (!plan || !plan.phases || plan.phases.length === 0) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 rounded-2xl bg-white border border-[#DCE5EA] shadow-sm text-center space-y-4">
        <h3 className="text-base font-bold text-[#102B46]">No Roadmap Plan Available</h3>
        <p className="text-xs text-[#718096]">Run an evaluation to calibrate roadmap phases.</p>
        <Button variant="primary" size="sm" onClick={loadPlan}>
          Generate Roadmap
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      {/* Header */}
      <PageHeader
        title="Migration Roadmap"
        subtitle="Turn the selected solution into a phased, trackable adoption plan."
        badge="Module 6"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="primary" size="sm" onClick={() => setIsAddTaskModalOpen(true)}>
              <Plus className="w-3.5 h-3.5" />
              <span>Add Task</span>
            </Button>
            <Button variant="outline" size="sm" onClick={loadPlan}>
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Regenerate Roadmap</span>
            </Button>
          </div>
        }
      />

      {/* Hero Progress Banner matching Screenshot (388) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-[#DCE5EA] p-4 shadow-2xs">
          <span className="text-[10px] font-bold text-[#718096] uppercase tracking-wider block">PHASES</span>
          <div className="text-2xl font-black text-[#102B46] mt-1">{plan.phases?.length || 8}</div>
          <span className="text-[11px] text-[#718096]">End-to-end migration</span>
        </div>

        <div className="bg-white rounded-xl border border-[#DCE5EA] p-4 shadow-2xs">
          <span className="text-[10px] font-bold text-[#718096] uppercase tracking-wider block">TASKS</span>
          <div className="text-2xl font-black text-[#102B46] mt-1">12</div>
          <span className="text-[11px] text-[#718096]">Work packages</span>
        </div>

        <div className="bg-white rounded-xl border border-[#DCE5EA] p-4 shadow-2xs">
          <span className="text-[10px] font-bold text-[#718096] uppercase tracking-wider block">COMPLETION</span>
          <div className="text-2xl font-black text-[#247C78] mt-1">{formatNumber(plan.overallProgress)}%</div>
          <span className="text-[11px] text-[#718096]">Live progress</span>
        </div>

        <div className="bg-white rounded-xl border border-[#DCE5EA] p-4 shadow-2xs">
          <span className="text-[10px] font-bold text-[#718096] uppercase tracking-wider block">TARGET DURATION</span>
          <div className="text-2xl font-black text-[#102B46] mt-1">{plan.estimatedDurationMonths || 12} weeks</div>
          <span className="text-[11px] text-[#718096]">Planning estimate</span>
        </div>
      </div>

      {/* Phased Roadmap Timeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#102B46] tracking-tight">Implementation phases</h3>
          <span className="text-xs text-[#718096]">Phases 1 through {plan.phases.length}</span>
        </div>

        {plan.phases.map((p) => {
          const isComplete = p.status === 'Completed' || p.progress === 100;
          const isInProgress = p.status === 'In progress' || p.status === 'In Progress' || p.status === 'Active';

          return (
            <div
              key={p.sequence}
              className={`bg-white rounded-xl border p-5 shadow-xs transition-all space-y-3.5 ${
                isComplete
                  ? 'border-emerald-200'
                  : isInProgress
                  ? 'border-[#247C78] ring-1 ring-[#247C78]/20'
                  : 'border-[#DCE5EA]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      isComplete
                        ? 'bg-emerald-600 text-white'
                        : isInProgress
                        ? 'bg-[#247C78] text-white shadow-xs'
                        : 'bg-[#F4F7FA] text-[#718096] border border-[#DCE5EA]'
                    }`}
                  >
                    {isComplete ? '✓' : p.sequence}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#102B46]">Phase {p.sequence}: {p.name}</h4>
                    <span className="text-[11px] text-[#718096] font-mono">{p.startDate} → {p.endDate} • Owner: <strong>{p.owner || 'IT Lead'}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={isComplete ? 'success' : isInProgress ? 'primary' : 'neutral'}>
                    {p.status}
                  </Badge>
                  <button
                    onClick={() => handleOpenEditPhase(p)}
                    className="p-1 text-[#718096] hover:text-[#247C78] hover:bg-[#F4F7FA] rounded transition-colors"
                    title="Edit Phase"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingPhase(p)}
                    className="p-1 text-[#718096] hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete Phase"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-[#263746] leading-relaxed">
                {p.deliverables}
              </p>

              <div className="p-3 bg-[#F4F7FA] rounded-lg border border-[#DCE5EA] text-xs text-[#263746]">
                <strong className="text-[#102B46]">Targeted Focus & Mitigation:</strong> {p.riskMitigationFocus}
              </div>

              {/* Progress Bar & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-[#DCE5EA]">
                <div className="flex items-center gap-3 flex-1 max-w-md">
                  <span className="text-xs font-semibold text-[#102B46] shrink-0">Progress: {p.progress}%</span>
                  <div className="w-full bg-[#F4F7FA] rounded-full h-1.5 overflow-hidden border border-[#DCE5EA]">
                    <div
                      className={`h-full rounded-full transition-all ${isComplete ? 'bg-emerald-600' : 'bg-[#247C78]'}`}
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <label className="text-[#718096] font-medium">Status:</label>
                  <select
                    value={p.status}
                    onChange={(e) => handlePhaseChange(p.sequence, { status: e.target.value })}
                    className="bg-white border border-[#DCE5EA] rounded-lg px-2.5 py-1 text-xs text-[#263746] font-medium focus:outline-none focus:border-[#247C78] shadow-2xs cursor-pointer"
                  >
                    <option value="Not started">Not started</option>
                    <option value="In progress">In progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Blocked">Blocked</option>
                  </select>

                  <label className="text-[#718096] font-medium ml-2">Adjust %:</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={p.progress}
                    onChange={(e) => handlePhaseChange(p.sequence, { progress: Number(e.target.value) })}
                    className="w-24 h-1.5 bg-[#DCE5EA] rounded appearance-none cursor-pointer accent-[#247C78]"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Phase Modal */}
      <Modal
        isOpen={Boolean(editingPhase)}
        onClose={() => setEditingPhase(null)}
        title={`Edit Phase ${editingPhase?.sequence}: ${editingPhase?.name}`}
        subtitle="Configure timeline dates, deliverables, owner, and milestone execution"
      >
        <form onSubmit={handleSavePhaseForm} className="space-y-4">
          <Input
            label="Phase Title"
            value={phaseForm.name}
            onChange={(e) => setPhaseForm({ ...phaseForm, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Date"
              type="date"
              value={phaseForm.startDate}
              onChange={(e) => setPhaseForm({ ...phaseForm, startDate: e.target.value })}
            />
            <Input
              label="End Date"
              type="date"
              value={phaseForm.endDate}
              onChange={(e) => setPhaseForm({ ...phaseForm, endDate: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Assigned Owner"
              value={phaseForm.owner}
              onChange={(e) => setPhaseForm({ ...phaseForm, owner: e.target.value })}
            >
              <option value="IT Lead">IT Lead</option>
              <option value="Security Lead">Security Lead</option>
              <option value="Enterprise Architect">Enterprise Architect</option>
              <option value="Change Lead">Change Lead</option>
              <option value="Data Lead">Data Lead</option>
            </Select>

            <Select
              label="Status"
              value={phaseForm.status}
              onChange={(e) => setPhaseForm({ ...phaseForm, status: e.target.value })}
            >
              <option value="Not started">Not started</option>
              <option value="In progress">In progress</option>
              <option value="Completed">Completed</option>
              <option value="Blocked">Blocked</option>
            </Select>
          </div>

          <Textarea
            label="Deliverables & Key Tasks"
            value={phaseForm.deliverables}
            onChange={(e) => setPhaseForm({ ...phaseForm, deliverables: e.target.value })}
            rows={3}
          />

          <Textarea
            label="Risk Mitigation Focus"
            value={phaseForm.riskMitigationFocus}
            onChange={(e) => setPhaseForm({ ...phaseForm, riskMitigationFocus: e.target.value })}
            rows={2}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-[#DCE5EA]">
            <Button variant="outline" size="sm" onClick={() => setEditingPhase(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Phase
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Task Modal */}
      <Modal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        title="Add Task to Roadmap"
        subtitle="Associate new deliverables with a target implementation phase"
      >
        <form onSubmit={handleAddTask} className="space-y-4">
          <Select
            label="Target Migration Phase"
            value={targetPhaseSeq}
            onChange={(e) => setTargetPhaseSeq(Number(e.target.value))}
          >
            {plan.phases.map((p) => (
              <option key={p.sequence} value={p.sequence}>
                Phase {p.sequence}: {p.name}
              </option>
            ))}
          </Select>

          <Input
            label="Task Deliverable"
            placeholder="e.g. Conduct automated schema reconciliation dry run"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            required
          />

          <Select
            label="Assignee"
            value={taskOwner}
            onChange={(e) => setTaskOwner(e.target.value)}
          >
            <option value="IT Lead">IT Lead</option>
            <option value="Security Lead">Security Lead</option>
            <option value="Enterprise Architect">Enterprise Architect</option>
            <option value="Change Lead">Change Lead</option>
            <option value="Data Lead">Data Lead</option>
          </Select>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#DCE5EA]">
            <Button variant="outline" size="sm" onClick={() => setIsAddTaskModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Add Task
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deletingPhase)}
        onClose={() => setDeletingPhase(null)}
        title="Confirm Phase Deletion"
        subtitle="Remove this milestone from active roadmap scheduling"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-xs text-red-800 leading-normal">
              Are you sure you want to delete <strong>Phase {deletingPhase?.sequence}: {deletingPhase?.name}</strong>? This will remove all associated deliverables and recalculate overall progress.
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-[#DCE5EA]">
            <Button variant="outline" size="sm" onClick={() => setDeletingPhase(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={() => confirmDeletePhase(deletingPhase.sequence)}>
              Delete Phase
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
