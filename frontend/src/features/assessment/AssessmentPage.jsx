import { useState, useEffect } from 'react';
import {
  Building,
  Server,
  Layers,
  Sliders,
  CheckCircle,
  Plus,
  Trash2,
  FileCheck,
  RotateCcw,
  Sparkles,
  X
} from 'lucide-react';
import { Card, CardContent, CardFooter } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import { assessmentService } from '../../services/assessmentService';
import { authService } from '../../services/authService';
import { calculateReadiness } from '../../lib/readiness';
import { validateWeights, DEFAULT_WEIGHTS } from '../../lib/scoring';
import { formatCurrency, formatNumber } from '../../lib/utils';
import { useToast } from '../../components/Toast';

export function AssessmentPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddLegacyModalOpen, setIsAddLegacyModalOpen] = useState(false);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    title: 'Core Systems Cloud Modernization',
    company_ID: 'comp-apex-global',
    companyName: 'Apex Global Enterprises',
    industry: 'Manufacturing & Logistics',
    employees: 1000,
    itBudget: 1500000,
    region: 'North America',
    infrastructure: 'On-premise',
    growthRate: 18,
    dataSensitivity: 'High',
    targetCategory: 'All',
    painPoints: 'Monolithic legacy ERP maintenance costs, customer data siloed in legacy custom CRM, fragile nightly batch ETL jobs, slow executive reporting cycles.',
    legacyApplications: [
      { ID: 'legacy-1', name: 'Legacy Custom CRM v4.2', function: 'Sales pipeline & service tickets', hosting: 'On-premise WinServer 2012', criticality: 'High', userCount: 350, yearsInUse: 9 },
      { ID: 'legacy-2', name: 'On-Premise ERP (AS/400)', function: 'General ledger & supply chain', hosting: 'On-premise AS/400 Rack', criticality: 'Critical', userCount: 800, yearsInUse: 14 },
      { ID: 'legacy-3', name: 'Custom HR Access DB', function: 'Directory & attendance', hosting: 'Local Share', criticality: 'Medium', userCount: 150, yearsInUse: 7 },
      { ID: 'legacy-4', name: 'SQL Server Reporting DB', function: 'Nightly batch financial reports', hosting: 'On-premise SQL 2014', criticality: 'High', userCount: 120, yearsInUse: 8 }
    ],
    weights: { ...DEFAULT_WEIGHTS }
  });

  const [newLegacyApp, setNewLegacyApp] = useState({
    name: '',
    function: 'Core Business Operation',
    hosting: 'On-premise Datacenter',
    criticality: 'High',
    userCount: 200,
    yearsInUse: 6
  });

  useEffect(() => {
    async function loadInitial() {
      try {
        const assessment = await assessmentService.getAssessmentById('assessment-ref-case');
        if (assessment) {
          setFormData(prev => ({
            ...prev,
            title: assessment.title || prev.title,
            company_ID: assessment.company_ID || prev.company_ID,
            infrastructure: assessment.infrastructure || 'On-premise',
            growthRate: Number(assessment.growthRate) || 18,
            dataSensitivity: assessment.dataSensitivity || 'High',
            targetCategory: assessment.targetCategory || 'All',
            painPoints: assessment.painPoints || prev.painPoints,
            legacyApplications: assessment.legacyApplications && assessment.legacyApplications.length > 0
              ? assessment.legacyApplications
              : prev.legacyApplications,
            weights: { ...DEFAULT_WEIGHTS }
          }));
        }
      } catch (err) {
        setError(err.message || 'Error loading assessment');
        showToast(`Error loading assessment: ${err.message}`, 'danger');
      } finally {
        setLoading(false);
      }
    }
    loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleWeightChange = (criterion, value) => {
    setFormData(prev => ({
      ...prev,
      weights: {
        ...prev.weights,
        [criterion]: Number(value)
      }
    }));
  };

  const resetWeights = () => {
    setFormData(prev => ({ ...prev, weights: { ...DEFAULT_WEIGHTS } }));
    showToast('Weights reset to PRD standard default (20/30/25/15/10)', 'info');
  };

  const handleAddLegacySubmit = (e) => {
    e.preventDefault();
    if (!newLegacyApp.name.trim()) {
      showToast('Please enter legacy application name', 'warning');
      return;
    }
    const appRecord = {
      ID: `legacy-${Date.now()}`,
      ...newLegacyApp
    };
    setFormData(prev => ({
      ...prev,
      legacyApplications: [...prev.legacyApplications, appRecord]
    }));
    showToast(`Added ${newLegacyApp.name} to legacy inventory`, 'success');
    setIsAddLegacyModalOpen(false);
    setNewLegacyApp({
      name: '',
      function: 'Core Business Operation',
      hosting: 'On-premise Datacenter',
      criticality: 'High',
      userCount: 200,
      yearsInUse: 6
    });
  };

  const handleRemoveLegacy = (id, name) => {
    setFormData(prev => ({
      ...prev,
      legacyApplications: prev.legacyApplications.filter(a => (a.ID || a.name) !== id)
    }));
    showToast(`Removed legacy system ${name || ''}`, 'info');
  };

  const handlePrefillReferenceCase = () => {
    setFormData({
      title: 'Core Systems Cloud Modernization',
      company_ID: 'comp-apex-global',
      companyName: 'Apex Global Enterprises',
      industry: 'Manufacturing & Logistics',
      employees: 1000,
      itBudget: 1500000,
      region: 'North America',
      infrastructure: 'On-premise',
      growthRate: 18,
      dataSensitivity: 'High',
      targetCategory: 'All',
      painPoints: 'Monolithic legacy ERP maintenance costs, customer data siloed in legacy custom CRM, fragile nightly batch ETL jobs, slow executive reporting cycles.',
      legacyApplications: [
        { ID: 'legacy-1', name: 'Legacy Custom CRM v4.2', function: 'Sales pipeline & service tickets', hosting: 'On-premise WinServer 2012', criticality: 'High', userCount: 350, yearsInUse: 9 },
        { ID: 'legacy-2', name: 'On-Premise ERP (AS/400)', function: 'General ledger & supply chain', hosting: 'On-premise AS/400 Rack', criticality: 'Critical', userCount: 800, yearsInUse: 14 },
        { ID: 'legacy-3', name: 'Custom HR Access DB', function: 'Directory & attendance', hosting: 'Local Share', criticality: 'Medium', userCount: 150, yearsInUse: 7 },
        { ID: 'legacy-4', name: 'SQL Server Reporting DB', function: 'Nightly batch financial reports', hosting: 'On-premise SQL 2014', criticality: 'High', userCount: 120, yearsInUse: 8 }
      ],
      weights: { ...DEFAULT_WEIGHTS }
    });
    showToast('Prefilled reference enterprise case (1,000 users, on-premise ERP)', 'success');
  };

  const handleSaveDraft = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('saas_assessment_draft', JSON.stringify(formData));
    }
    showToast('Assessment saved locally as draft.', 'info');
  };

  const weightsSum = Object.values(formData.weights).reduce((a, b) => a + Number(b), 0);
  const isWeightsValid = validateWeights(formData.weights);

  // Exact validation rules from FRONTEND_AUDIT.md & app.js:
  const validateStep = (currentStep) => {
    if (currentStep === 1) {
      if (!formData.companyName.trim()) {
        showToast('Please enter company name', 'warning');
        return false;
      }
      if (!formData.employees || formData.employees <= 0) {
        showToast('Please specify valid employee count', 'warning');
        return false;
      }
      if (!formData.itBudget || formData.itBudget <= 0) {
        showToast('Please specify valid annual IT budget', 'warning');
        return false;
      }
    } else if (currentStep === 4) {
      if (!isWeightsValid) {
        showToast(`Criteria weights must sum to 100% (Current: ${weightsSum}%)`, 'warning');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(5, prev + 1));
    }
  };

  const handlePrev = () => {
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    const user = await authService.getCurrentUser();
    if (user?.role === 'Viewer') {
      showToast('Viewer Role is read-only. Switch role to Manager or Admin to modify.', 'warning');
      return;
    }

    if (!validateStep(4)) {
      setStep(4);
      return;
    }

    setIsSubmitting(true);
    showToast('Saving assessment and executing TOE calculation...', 'info');

    try {
      const saved = await assessmentService.saveAssessment({
        ID: 'assessment-ref-case',
        ...formData
      });
      showToast(`Assessment submitted! TOE Score: ${saved.readinessScore}/100`, 'success');
      window.dispatchEvent(new CustomEvent('saas:data_refreshed'));
    } catch (err) {
      showToast(`Error saving assessment: ${err.message}`, 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Real-time TOE Calculation
  const previewReadiness = calculateReadiness({
    ...formData,
    legacyAppsCount: formData.legacyApplications.length
  });

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
        <h3 className="text-base font-bold text-white">Error Loading Assessment</h3>
        <p className="text-xs text-red-300">{error}</p>
        <Button variant="primary" size="sm" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-white tracking-tight">Enterprise Readiness Assessment</h2>
            <Badge variant="cyan">Module 2</Badge>
          </div>
          <p className="text-xs text-slate-400">
            Guided 5-step wizard capturing organizational profile, infrastructure, legacy systems, and criteria weights.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleSaveDraft}>
            <FileCheck className="w-3.5 h-3.5" />
            <span>Save as Draft</span>
          </Button>
          <Button variant="outlineCyan" size="sm" onClick={handlePrefillReferenceCase}>
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Prefill Reference Case</span>
          </Button>
        </div>
      </div>

      {/* Step Indicator Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl">
        {[
          { num: 1, label: 'Company Profile', icon: Building },
          { num: 2, label: 'IT Environment', icon: Server },
          { num: 3, label: 'Legacy Monoliths', icon: Layers },
          { num: 4, label: 'Criteria Weights', icon: Sliders },
          { num: 5, label: 'TOE Review & Submit', icon: CheckCircle }
        ].map((s) => {
          const isActive = step === s.num;
          const isDone = step > s.num;
          return (
            <button
              key={s.num}
              onClick={() => {
                if (s.num < step || validateStep(step)) setStep(s.num);
              }}
              className="flex items-center gap-2 group focus:outline-none"
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40 ring-2 ring-blue-400'
                  : isDone
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                  }`}
              >
                {isDone ? '✓' : s.num}
              </div>
              <span className={`text-xs font-medium hidden sm:inline ${isActive ? 'text-white' : 'text-slate-400'}`}>
                {s.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Wizard Form Card */}
      <Card className="border-slate-800 bg-slate-900/90 shadow-xl">
        <CardContent className="pt-6">
          {/* Step 1: Enterprise Profile & Scale */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">Step 1: Enterprise Profile & Scale</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Basic enterprise metadata used to calibrate organizational adoption capacity.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => handleChange('companyName', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Industry Sector *</label>
                  <select
                    value={formData.industry}
                    onChange={(e) => handleChange('industry', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Manufacturing & Logistics">Manufacturing & Logistics</option>
                    <option value="Financial Technology">Financial Technology</option>
                    <option value="Healthcare & Life Sciences">Healthcare & Life Sciences</option>
                    <option value="Retail & Consumer Goods">Retail & Consumer Goods</option>
                    <option value="Energy & Utilities">Energy & Utilities</option>
                    <option value="Public Sector">Public Sector</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Total Employees *</label>
                  <input
                    type="number"
                    min="10"
                    max="500000"
                    required
                    value={formData.employees}
                    onChange={(e) => handleChange('employees', Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">Workforce headcount requiring software access</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Annual IT Budget ($ USD) *</label>
                  <input
                    type="number"
                    min="10000"
                    step="10000"
                    required
                    value={formData.itBudget}
                    onChange={(e) => handleChange('itBudget', Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">Total annual tech expenditure: {formatCurrency(formData.itBudget)}</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Headquarters Region</label>
                  <select
                    value={formData.region}
                    onChange={(e) => handleChange('region', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="North America">North America</option>
                    <option value="EMEA">Europe, Middle East & Africa</option>
                    <option value="Asia Pacific">Asia Pacific</option>
                    <option value="Latin America">Latin America</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Assessment Initiative Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: IT Environment & Constraints */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">Step 2: IT Infrastructure & Constraints</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Identify current hosting topology, security standards, and transformation focus.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Current Infrastructure Topology *</label>
                  <select
                    value={formData.infrastructure}
                    onChange={(e) => handleChange('infrastructure', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="On-premise">On-premise Datacenter / Bare Metal</option>
                    <option value="Hybrid">Hybrid (On-premise + Colocated)</option>
                    <option value="Colocated">Colocated Managed Hosting</option>
                    <option value="Private Cloud">Private Cloud Infrastructure</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Expected Annual Growth Rate (%) *</label>
                  <input
                    type="number"
                    min="0"
                    max="200"
                    step="1"
                    value={formData.growthRate}
                    onChange={(e) => handleChange('growthRate', Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">Business growth rate driving scalability</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Data Sensitivity Classification *</label>
                  <select
                    value={formData.dataSensitivity}
                    onChange={(e) => handleChange('dataSensitivity', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="High">High (PII, Financial, HIPAA, Intellectual Property)</option>
                    <option value="Medium">Medium (Internal Business Records, Commercial Data)</option>
                    <option value="Low">Low (Publicly Accessible Operational Information)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Target Transformation Area *</label>
                  <select
                    value={formData.targetCategory}
                    onChange={(e) => handleChange('targetCategory', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="All">All Categories (Enterprise-wide Modernization)</option>
                    <option value="ERP">Enterprise Resource Planning (ERP)</option>
                    <option value="CRM">Customer Relationship Management (CRM)</option>
                    <option value="HCM">Human Capital Management (HCM)</option>
                    <option value="ITSM">IT Service Management (ITSM)</option>
                    <option value="Productivity">Productivity & Collaboration</option>
                    <option value="Identity">Identity & Access Governance (IAM)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">Current Operational Pain Points & Bottlenecks</label>
                  <textarea
                    rows={3}
                    value={formData.painPoints}
                    onChange={(e) => handleChange('painPoints', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Legacy Monolithic Systems Inventory */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white">Step 3: Legacy Monolithic Systems Inventory</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Catalog active legacy applications to evaluate migration complexity and data loss risk.
                  </p>
                </div>
                <Button variant="outlineCyan" size="sm" onClick={() => setIsAddLegacyModalOpen(true)}>
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Legacy System</span>
                </Button>
              </div>

              <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-900/60">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/80 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3">Application Name</th>
                      <th className="p-3">Business Function</th>
                      <th className="p-3">Hosting Topology</th>
                      <th className="p-3">Criticality</th>
                      <th className="p-3">Active Users</th>
                      <th className="p-3">Years in Use</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {formData.legacyApplications.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-slate-500">
                          No legacy monoliths registered. Click &quot;+ Add Legacy System&quot; above.
                        </td>
                      </tr>
                    ) : (
                      formData.legacyApplications.map((app, idx) => (
                        <tr key={app.ID || idx} className="hover:bg-slate-800/40">
                          <td className="p-3 font-semibold text-white">{app.name}</td>
                          <td className="p-3 text-slate-300">{app.function}</td>
                          <td className="p-3 text-slate-400">
                            <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[11px] font-mono">
                              {app.hosting}
                            </span>
                          </td>
                          <td className="p-3">
                            <Badge
                              variant={
                                app.criticality === 'Critical'
                                  ? 'danger'
                                  : app.criticality === 'High'
                                    ? 'warning'
                                    : 'primary'
                              }
                            >
                              {app.criticality}
                            </Badge>
                          </td>
                          <td className="p-3 text-slate-300">{app.userCount} users</td>
                          <td className="p-3 text-slate-300">{app.yearsInUse} yrs</td>
                          <td className="p-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveLegacy(app.ID || app.name, app.name)}
                              className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-red-950/40 transition"
                              title="Remove legacy system"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Step 4: Criteria Weightings */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white">Step 4: Multi-Criteria Weighting Configuration</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Configure preference weights for SaaS recommendation scoring. <strong>Weights must total exactly 100%</strong>.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={resetWeights}>
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to Defaults (20/30/25/15/10)</span>
                </Button>
              </div>

              {/* Total Meter & Stacked Proportional Bar */}
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">Sum of Criteria Weights:</span>
                  <span
                    className={`font-bold px-3 py-1 rounded-full text-xs transition ${isWeightsValid
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-red-500/20 text-red-400 border border-red-500/40'
                      }`}
                  >
                    {weightsSum}% {isWeightsValid ? '✓ Valid' : '✕ Must equal 100%'}
                  </span>
                </div>

                {/* Stacked Bar */}
                <div className="h-6 w-full bg-slate-900 rounded-lg overflow-hidden flex text-[10px] font-semibold text-white">
                  <div
                    style={{ width: `${Math.max(0, formData.weights.cost)}%` }}
                    className="bg-amber-600 flex items-center justify-center transition-all overflow-hidden whitespace-nowrap"
                    title={`Cost: ${formData.weights.cost}%`}
                  >
                    {formData.weights.cost >= 8 && `Cost ${formData.weights.cost}%`}
                  </div>
                  <div
                    style={{ width: `${Math.max(0, formData.weights.security)}%` }}
                    className="bg-blue-600 flex items-center justify-center transition-all overflow-hidden whitespace-nowrap"
                    title={`Security: ${formData.weights.security}%`}
                  >
                    {formData.weights.security >= 8 && `Sec ${formData.weights.security}%`}
                  </div>
                  <div
                    style={{ width: `${Math.max(0, formData.weights.scalability)}%` }}
                    className="bg-cyan-600 flex items-center justify-center transition-all overflow-hidden whitespace-nowrap"
                    title={`Scalability: ${formData.weights.scalability}%`}
                  >
                    {formData.weights.scalability >= 8 && `Scale ${formData.weights.scalability}%`}
                  </div>
                  <div
                    style={{ width: `${Math.max(0, formData.weights.integration)}%` }}
                    className="bg-emerald-600 flex items-center justify-center transition-all overflow-hidden whitespace-nowrap"
                    title={`Integration: ${formData.weights.integration}%`}
                  >
                    {formData.weights.integration >= 8 && `Int ${formData.weights.integration}%`}
                  </div>
                  <div
                    style={{ width: `${Math.max(0, formData.weights.features)}%` }}
                    className="bg-purple-600 flex items-center justify-center transition-all overflow-hidden whitespace-nowrap"
                    title={`Features: ${formData.weights.features}%`}
                  >
                    {formData.weights.features >= 8 && `Feat ${formData.weights.features}%`}
                  </div>
                </div>
              </div>

              {/* Sliders */}
              <div className="space-y-4 pt-2">
                {[
                  { key: 'cost', label: 'Cost Fit (TCO & Licensing)', color: 'text-amber-400' },
                  { key: 'security', label: 'Security & Compliance', color: 'text-blue-400' },
                  { key: 'scalability', label: 'Scalability & Multi-Tenancy', color: 'text-cyan-400' },
                  { key: 'integration', label: 'Integration & APIs', color: 'text-emerald-400' },
                  { key: 'features', label: 'Features & Maturity', color: 'text-purple-400' }
                ].map((item) => (
                  <div key={item.key} className="space-y-1.5 p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-200 font-medium">{item.label}</span>
                      <span className={`font-mono font-bold ${item.color}`}>{formData.weights[item.key]}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="60"
                      step="5"
                      value={formData.weights[item.key]}
                      onChange={(e) => handleWeightChange(item.key, e.target.value)}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: TOE Review & Submit */}
          {step === 5 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-bold text-white">Step 5: TOE Readiness Review & Validation</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Computed Technology, Organisation, and Environment readiness index calibrated for enterprise scale.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/60 to-slate-900 border border-blue-500/30 flex flex-col sm:flex-row items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-blue-600/20 border-2 border-blue-500 flex flex-col items-center justify-center shrink-0">
                  <span className="text-3xl font-extrabold text-blue-400">{formatNumber(previewReadiness.readinessScore)}</span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">TOE Score</span>
                </div>
                <div>
                  <Badge variant={previewReadiness.readinessLevel === 'High' ? 'success' : 'warning'}>
                    {previewReadiness.readinessLevel} Readiness Profile
                  </Badge>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    Your organisation demonstrates adequate financial budget per employee (${Math.round(formData.itBudget / formData.employees).toLocaleString()}/emp), robust executive impetus for cloud modernization, and manageable legacy technical debt across {formData.legacyApplications.length} cataloged monolithic systems.
                  </p>
                </div>
              </div>

              {/* 3 TOE Pillars Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <span className="text-[11px] text-slate-400 font-bold uppercase">Technology (40% wt)</span>
                  <div className="text-xl font-bold text-white mt-1">
                    {formatNumber(previewReadiness.toeTechScore)}<span className="text-xs text-slate-400">/100</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Evaluates legacy technical debt and hosting transition feasibility.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <span className="text-[11px] text-slate-400 font-bold uppercase">Organisation (35% wt)</span>
                  <div className="text-xl font-bold text-white mt-1">
                    {formatNumber(previewReadiness.toeOrgScore)}<span className="text-xs text-slate-400">/100</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Reflects IT budget capacity (${Math.round(formData.itBudget / formData.employees).toLocaleString()}/emp) and governance.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <span className="text-[11px] text-slate-400 font-bold uppercase">Environment (25% wt)</span>
                  <div className="text-xl font-bold text-white mt-1">
                    {formatNumber(previewReadiness.toeEnvScore)}<span className="text-xs text-slate-400">/100</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Reflects {formData.growthRate}% annual growth momentum and strict regulatory drivers.</p>
                </div>
              </div>

              {/* Review Meta Box */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300">
                <div>
                  <span className="text-[11px] text-slate-500 block">Enterprise:</span>
                  <strong className="text-white truncate block">{formData.companyName}</strong>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Legacy Systems:</span>
                  <strong className="text-cyan-400">{formData.legacyApplications.length} Applications</strong>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Data Sensitivity:</span>
                  <strong className="text-amber-400">{formData.dataSensitivity}</strong>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Criteria Setup:</span>
                  <strong className="text-white">20/30/25/15/10</strong>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between border-t border-slate-800 pt-4">
          <Button variant="outline" size="sm" onClick={handlePrev} disabled={step === 1}>
            ← Back
          </Button>
          <div className="flex gap-2">
            {step < 5 ? (
              <Button variant="primary" size="sm" onClick={handleNext}>
                Next Step →
              </Button>
            ) : (
              <Button variant="success" size="sm" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Evaluating...' : 'Submit & Run Evaluation'}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Modal: Add Legacy Monolith */}
      <Modal
        isOpen={isAddLegacyModalOpen}
        onClose={() => setIsAddLegacyModalOpen(false)}
        title="Add Legacy Monolithic Application"
        subtitle="Catalog active monolithic system for migration complexity evaluation"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddLegacySubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-300 mb-1">System Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Warehouse Monolith v2"
              value={newLegacyApp.name}
              onChange={(e) => setNewLegacyApp({ ...newLegacyApp, name: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Business Function</label>
            <input
              type="text"
              placeholder="e.g. Logistics & Inventory Management"
              value={newLegacyApp.function}
              onChange={(e) => setNewLegacyApp({ ...newLegacyApp, function: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Hosting Topology</label>
              <select
                value={newLegacyApp.hosting}
                onChange={(e) => setNewLegacyApp({ ...newLegacyApp, hosting: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="On-premise Datacenter">On-premise Datacenter</option>
                <option value="Hybrid Datacenter">Hybrid Datacenter</option>
                <option value="Local Share Server">Local Share Server</option>
                <option value="Colocated Rack">Colocated Rack</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Criticality</label>
              <select
                value={newLegacyApp.criticality}
                onChange={(e) => setNewLegacyApp({ ...newLegacyApp, criticality: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Active Users</label>
              <input
                type="number"
                min="1"
                value={newLegacyApp.userCount}
                onChange={(e) => setNewLegacyApp({ ...newLegacyApp, userCount: Number(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Years in Use</label>
              <input
                type="number"
                min="1"
                value={newLegacyApp.yearsInUse}
                onChange={(e) => setNewLegacyApp({ ...newLegacyApp, yearsInUse: Number(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAddLegacyModalOpen(false)}>
              <X className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </Button>
            <Button type="submit" variant="primary" size="sm">
              <Plus className="w-3.5 h-3.5" />
              <span>Add to Inventory</span>
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
