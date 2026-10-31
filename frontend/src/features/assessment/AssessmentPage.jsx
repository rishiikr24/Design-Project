import { useState, useEffect } from 'react';
import {
  Building,
  Server,
  Layers,
  Sliders,
  CheckCircle,
  Plus,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardFooter } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { assessmentService } from '../../services/assessmentService';
import { authService } from '../../services/authService';
import { calculateReadiness } from '../../lib/readiness';
import { validateWeights, DEFAULT_WEIGHTS } from '../../lib/scoring';
import { formatCurrency, formatNumber } from '../../lib/utils';
import { useToast } from '../../components/Toast';

export function AssessmentPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    painPoints: 'Monolithic legacy ERP maintenance costs, customer data siloed in custom CRM, slow reporting.',
    legacyApplications: [],
    weights: { ...DEFAULT_WEIGHTS }
  });

  useEffect(() => {
    async function loadInitial() {
      try {
        const assessment = await assessmentService.getAssessmentById('assessment-ref-case');
        if (assessment) {
          setFormData({
            title: assessment.title,
            company_ID: assessment.company_ID,
            companyName: 'Apex Global Enterprises',
            industry: 'Manufacturing & Logistics',
            employees: 1000,
            itBudget: 1500000,
            region: 'North America',
            infrastructure: assessment.infrastructure || 'On-premise',
            growthRate: Number(assessment.growthRate) || 18,
            dataSensitivity: assessment.dataSensitivity || 'High',
            targetCategory: assessment.targetCategory || 'All',
            painPoints: assessment.painPoints || '',
            legacyApplications: assessment.legacyApplications || [],
            weights: { ...DEFAULT_WEIGHTS }
          });
        }
      } catch (err) {
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
    showToast('Weights reset to PRD defaults (20/30/25/15/10)', 'info');
  };

  const handleAddLegacy = () => {
    const name = window.prompt('Legacy System Name (e.g. Warehouse Monolith):');
    if (!name) return;
    const fn = window.prompt('Business Function:', 'Logistics & Inventory') || 'Core Operations';
    const crit = window.prompt('Criticality (Critical, High, Medium, Low):', 'High') || 'High';
    const users = Number(window.prompt('Active Users Count:', '250') || 250);

    const newApp = {
      ID: `legacy-${Date.now()}`,
      name,
      function: fn,
      hosting: 'On-premise Datacenter',
      criticality: crit,
      userCount: users,
      yearsInUse: 6
    };

    setFormData(prev => ({
      ...prev,
      legacyApplications: [...prev.legacyApplications, newApp]
    }));
    showToast(`Added ${name} to legacy inventory`, 'success');
  };

  const handleRemoveLegacy = (id) => {
    setFormData(prev => ({
      ...prev,
      legacyApplications: prev.legacyApplications.filter(a => a.ID !== id)
    }));
    showToast('Removed legacy application', 'info');
  };

  const weightsSum = Object.values(formData.weights).reduce((a, b) => a + Number(b), 0);
  const isWeightsValid = validateWeights(formData.weights);

  const validateStep = (currentStep) => {
    if (currentStep === 1) {
      if (!formData.companyName.trim()) {
        showToast('Please enter company name', 'warning');
        return false;
      }
      if (formData.employees <= 0) {
        showToast('Please specify valid employee count', 'warning');
        return false;
      }
      if (formData.itBudget <= 0) {
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
      showToast('Viewer Role is read-only. Switch to Manager or Admin to modify.', 'warning');
      return;
    }

    setIsSubmitting(true);
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

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800">
        <h2 className="text-xl font-bold text-white tracking-tight">Enterprise Readiness Assessment</h2>
        <p className="text-xs text-slate-400 mt-1">
          Guided 5-step wizard capturing organizational profile, infrastructure, legacy systems, and criteria weights.
        </p>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800/40 border border-slate-700/60 rounded-xl">
        {[
          { num: 1, label: 'Profile', icon: Building },
          { num: 2, label: 'IT Environment', icon: Server },
          { num: 3, label: 'Legacy Inventory', icon: Layers },
          { num: 4, label: 'Weights', icon: Sliders },
          { num: 5, label: 'TOE Review', icon: CheckCircle }
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
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40 ring-2 ring-blue-400'
                    : isDone
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-700 text-slate-400'
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
      <Card>
        <CardContent className="pt-6">
          {/* Step 1: Enterprise Profile */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">Step 1: Enterprise Profile & Scale</h3>
              <p className="text-xs text-slate-400">Basic enterprise scale parameters used to calibrate organizational adoption capacity.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Company Name *</label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => handleChange('companyName', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Industry Sector *</label>
                  <select
                    value={formData.industry}
                    onChange={(e) => handleChange('industry', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
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
                    value={formData.employees}
                    onChange={(e) => handleChange('employees', Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">Workforce headcount requiring software access</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Annual IT Budget ($ USD) *</label>
                  <input
                    type="number"
                    step="10000"
                    value={formData.itBudget}
                    onChange={(e) => handleChange('itBudget', Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">Current: {formatCurrency(formData.itBudget)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: IT Infrastructure */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">Step 2: IT Infrastructure & Constraints</h3>
              <p className="text-xs text-slate-400">Identify hosting topology, data sensitivity classification, and target domain.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Hosting Topology *</label>
                  <select
                    value={formData.infrastructure}
                    onChange={(e) => handleChange('infrastructure', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="On-premise">On-premise Datacenter / Bare Metal</option>
                    <option value="Hybrid">Hybrid (On-premise + Colocated)</option>
                    <option value="Colocated">Colocated Managed Hosting</option>
                    <option value="Private Cloud">Private Cloud Infrastructure</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Data Sensitivity Classification *</label>
                  <select
                    value={formData.dataSensitivity}
                    onChange={(e) => handleChange('dataSensitivity', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="High">High (PII, Financial, HIPAA, Intellectual Property)</option>
                    <option value="Medium">Medium (Internal Business Records, Commercial Data)</option>
                    <option value="Low">Low (Publicly Accessible Operational Information)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Expected Annual Growth Rate (%) *</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.growthRate}
                    onChange={(e) => handleChange('growthRate', Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Target Transformation Domain *</label>
                  <select
                    value={formData.targetCategory}
                    onChange={(e) => handleChange('targetCategory', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
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
                  <label className="block text-xs font-medium text-slate-300 mb-1">Operational Pain Points</label>
                  <textarea
                    rows={3}
                    value={formData.painPoints}
                    onChange={(e) => handleChange('painPoints', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Legacy Monoliths Inventory */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Step 3: Legacy Monoliths Inventory</h3>
                  <p className="text-xs text-slate-400">Catalog active legacy applications to evaluate migration complexity.</p>
                </div>
                <Button variant="outlineCyan" size="sm" onClick={handleAddLegacy}>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Legacy System</span>
                </Button>
              </div>

              <div className="overflow-x-auto border border-slate-700/80 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/80 text-slate-400 border-b border-slate-700/80">
                    <tr>
                      <th className="p-3">Application Name</th>
                      <th className="p-3">Business Function</th>
                      <th className="p-3">Criticality</th>
                      <th className="p-3">Active Users</th>
                      <th className="p-3">Years in Use</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {formData.legacyApplications.map((app) => (
                      <tr key={app.ID || app.name} className="hover:bg-slate-800/40">
                        <td className="p-3 font-semibold text-white">{app.name}</td>
                        <td className="p-3 text-slate-300">{app.function}</td>
                        <td className="p-3">
                          <Badge variant={app.criticality === 'Critical' ? 'danger' : app.criticality === 'High' ? 'warning' : 'primary'}>
                            {app.criticality}
                          </Badge>
                        </td>
                        <td className="p-3 text-slate-300">{app.userCount} users</td>
                        <td className="p-3 text-slate-300">{app.yearsInUse} yrs</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleRemoveLegacy(app.ID)}
                            className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-red-950/40 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Step 4: Criteria Weights */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Step 4: Multi-Criteria Weightings</h3>
                  <p className="text-xs text-slate-400">Configure preference weights for SaaS recommendation scoring. <strong>Must total 100%</strong>.</p>
                </div>
                <Button variant="outline" size="sm" onClick={resetWeights}>
                  Reset Defaults (20/30/25/15/10)
                </Button>
              </div>

              {/* Total Meter */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">Sum of Criteria Weights:</span>
                <span className={`text-sm font-bold px-3 py-1 rounded-full ${isWeightsValid ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-red-500/20 text-red-400 border border-red-500/40'}`}>
                  {weightsSum}% {isWeightsValid ? '✓ Valid' : '✕ Must equal 100%'}
                </span>
              </div>

              {/* Sliders */}
              <div className="space-y-4 pt-2">
                {[
                  { key: 'cost', label: 'Cost Fit (TCO & Licensing)' },
                  { key: 'security', label: 'Security & Compliance' },
                  { key: 'scalability', label: 'Scalability & Multi-Tenancy' },
                  { key: 'integration', label: 'Integration & APIs' },
                  { key: 'features', label: 'Features & Maturity' }
                ].map((item) => (
                  <div key={item.key} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium">{item.label}</span>
                      <span className="text-blue-400 font-mono font-bold">{formData.weights[item.key]}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="60"
                      step="5"
                      value={formData.weights[item.key]}
                      onChange={(e) => handleWeightChange(item.key, e.target.value)}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: TOE Review */}
          {step === 5 && (
            <div className="space-y-5">
              <h3 className="text-base font-bold text-white">Step 5: TOE Readiness Review & Validation</h3>
              <p className="text-xs text-slate-400">Computed Technology, Organisation, and Environment readiness index.</p>

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
                    Your organisation demonstrates adequate budget per employee (${Math.round(formData.itBudget / formData.employees).toLocaleString()}/emp), robust cloud modernization impetus, and manageable legacy technical debt across {formData.legacyApplications.length} monolithic systems.
                  </p>
                </div>
              </div>

              {/* 3 TOE Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <span className="text-[11px] text-slate-400 font-bold uppercase">Technology (40%)</span>
                  <div className="text-xl font-bold text-white mt-1">{formatNumber(previewReadiness.toeTechScore)}/100</div>
                  <span className="text-[11px] text-slate-500">Legacy debt & topology</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <span className="text-[11px] text-slate-400 font-bold uppercase">Organisation (35%)</span>
                  <div className="text-xl font-bold text-white mt-1">{formatNumber(previewReadiness.toeOrgScore)}/100</div>
                  <span className="text-[11px] text-slate-500">Budget runway & scale</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <span className="text-[11px] text-slate-400 font-bold uppercase">Environment (25%)</span>
                  <div className="text-xl font-bold text-white mt-1">{formatNumber(previewReadiness.toeEnvScore)}/100</div>
                  <span className="text-[11px] text-slate-500">Growth rate & regulations</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button variant="outline" size="sm" onClick={handlePrev} disabled={step === 1}>
            Back
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
    </div>
  );
}
