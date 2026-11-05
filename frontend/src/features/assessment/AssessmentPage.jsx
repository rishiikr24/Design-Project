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
  X,
  ArrowRight,
  ArrowLeft,
  HelpCircle,
  TrendingUp,
  ShieldAlert,
  Award,
  ListChecks,
  Compass
} from 'lucide-react';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import { assessmentService } from '../../services/assessmentService';
import { calculateReadiness } from '../../lib/readiness';
import { validateWeights, DEFAULT_WEIGHTS } from '../../lib/scoring';
import { formatCurrency, formatNumber } from '../../lib/utils';
import { useToast } from '../../components/Toast';
import {
  ASSESSMENT_DIMENSIONS,
  ANSWER_CHOICES,
  DEFAULT_QUESTION_ANSWERS
} from '../../data/assessmentQuestions';

export function AssessmentPage() {
  // Step 0: Overview / Intro, Step 1: Profile & Scale, Step 2: 5-Dimension Readiness Questionnaire, Step 3: Legacy Systems, Step 4: Criteria Weights, Step 5: TOE Results & Recommendations
  const [step, setStep] = useState(1);
  const [activeDimensionIndex, setActiveDimensionIndex] = useState(0);
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
    weights: { ...DEFAULT_WEIGHTS },
    answers: { ...DEFAULT_QUESTION_ANSWERS }
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
        // First check local draft
        const draft = localStorage.getItem('saas_assessment_draft');
        if (draft) {
          try {
            const parsedDraft = JSON.parse(draft);
            setFormData(prev => ({
              ...prev,
              ...parsedDraft,
              answers: { ...DEFAULT_QUESTION_ANSWERS, ...(parsedDraft.answers || {}) },
              weights: { ...DEFAULT_WEIGHTS, ...(parsedDraft.weights || {}) }
            }));
          } catch {
            // fallback
          }
        } else {
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
              weights: { ...DEFAULT_WEIGHTS },
              answers: { ...DEFAULT_QUESTION_ANSWERS }
            }));
          }
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

  const handleAnswerChange = (questionId, choiceValue) => {
    setFormData(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: choiceValue
      }
    }));
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
    const refData = {
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
      weights: { ...DEFAULT_WEIGHTS },
      answers: { ...DEFAULT_QUESTION_ANSWERS }
    };
    setFormData(refData);
    showToast('Prefilled reference enterprise case (1,000 users, on-premise ERP, 20 answers)', 'success');
  };

  const handleSaveDraft = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('saas_assessment_draft', JSON.stringify(formData));
    }
    showToast('Assessment saved locally as draft.', 'info');
  };

  const weightsSum = Object.values(formData.weights).reduce((a, b) => a + Number(b), 0);
  const isWeightsValid = validateWeights(formData.weights);

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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setStep(prev => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
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
      localStorage.removeItem('saas_assessment_draft');
      window.dispatchEvent(new CustomEvent('saas:data_refreshed'));
      setStep(5);
    } catch (err) {
      showToast(`Error saving assessment: ${err.message}`, 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Real-time TOE & 5-Dimension Calculation
  const readinessResults = calculateReadiness({
    ...formData,
    legacyAppsCount: formData.legacyApplications.length
  });

  const stepsList = [
    { num: 1, label: 'Enterprise Profile', icon: Building },
    { num: 2, label: 'Readiness Questionnaire', icon: ListChecks },
    { num: 3, label: 'Legacy Inventory', icon: Layers },
    { num: 4, label: 'Criteria Weights', icon: Sliders },
    { num: 5, label: 'TOE Review & Results', icon: CheckCircle }
  ];

  const totalAnsweredCount = Object.keys(formData.answers || {}).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#247C78]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 rounded-2xl bg-white border border-red-200 text-center space-y-4 shadow-sm">
        <h3 className="text-base font-bold text-[#102B46]">Error Loading Assessment</h3>
        <p className="text-xs text-red-600">{error}</p>
        <Button variant="primary" size="sm" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  const currentDim = ASSESSMENT_DIMENSIONS[activeDimensionIndex];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DCE5EA]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <h2 className="text-2xl font-bold text-[#102B46] tracking-tight">
              Enterprise Readiness Assessment
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#247C78]/10 text-[#247C78] border border-[#247C78]/20">
              Module 2
            </span>
          </div>
          <p className="text-sm text-[#718096]">
            Guided assessment across 5 enterprise dimensions, infrastructure debt, and multi-criteria weights.
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <Button variant="outline" size="sm" onClick={handleSaveDraft}>
            <FileCheck className="w-3.5 h-3.5 mr-1.5 text-[#247C78]" />
            <span>Save as Draft</span>
          </Button>
          <Button variant="primary" size="sm" onClick={handlePrefillReferenceCase}>
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-300" />
            <span>Prefill Reference Case</span>
          </Button>
        </div>
      </div>

      {/* 2. Horizontal Stepper */}
      <div className="bg-white border border-[#DCE5EA] rounded-2xl p-4 shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-0">
          {stepsList.map((s, idx) => {
            const isActive = step === s.num;
            const isDone = step > s.num;
            return (
              <div key={s.num} className="flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    if (s.num < step || validateStep(step)) setStep(s.num);
                  }}
                  className="flex items-center gap-2.5 w-full text-left group focus:outline-none py-1"
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all shrink-0 ${
                      isActive
                        ? 'bg-[#247C78] text-white shadow-sm ring-2 ring-[#247C78]/30'
                        : isDone
                        ? 'bg-[#102B46] text-white'
                        : 'bg-[#F4F7FA] text-[#718096] border border-[#DCE5EA] group-hover:border-[#247C78]/40'
                    }`}
                  >
                    {isDone ? '✓' : s.num}
                  </div>
                  <div className="min-w-0 pr-1">
                    <span
                      className={`text-xs block font-medium truncate ${
                        isActive
                          ? 'text-[#102B46] font-bold'
                          : isDone
                          ? 'text-[#263746]'
                          : 'text-[#718096]'
                      }`}
                    >
                      {s.label}
                    </span>
                    <span className="text-[10px] text-slate-400 hidden lg:block leading-none mt-0.5">
                      Step {s.num} of 5
                    </span>
                  </div>
                </button>
                {idx < stepsList.length - 1 && (
                  <div className="hidden sm:block w-8 h-[2px] bg-[#DCE5EA] mx-1 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Main Form Card */}
      <div className="bg-white border border-[#DCE5EA] rounded-2xl shadow-xs overflow-hidden">
        <div className="p-6 sm:p-8">
          {/* STEP 1: Enterprise Profile & Scale */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="border-b border-[#DCE5EA] pb-4">
                <h3 className="text-lg font-bold text-[#102B46]">
                  Step 1: Enterprise Profile & Organizational Parameters
                </h3>
                <p className="text-xs text-[#718096] mt-1">
                  Metadata and infrastructure baseline used to calibrate organizational adoption capacity.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-[#263746] mb-1.5">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex Global Enterprises"
                      value={formData.companyName}
                      onChange={(e) => handleChange('companyName', e.target.value)}
                      className="w-full h-10 bg-white border border-[#DCE5EA] rounded-xl px-3.5 text-xs text-[#263746] focus:outline-none focus:ring-2 focus:ring-[#247C78]/20 focus:border-[#247C78] transition"
                    />
                    <span className="text-[11px] text-[#718096] mt-1 block">
                      Legal entity name for the transformation charter
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#263746] mb-1.5">
                      Total Employees *
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="500000"
                      required
                      value={formData.employees}
                      onChange={(e) => handleChange('employees', Number(e.target.value))}
                      className="w-full h-10 bg-white border border-[#DCE5EA] rounded-xl px-3.5 text-xs text-[#263746] focus:outline-none focus:ring-2 focus:ring-[#247C78]/20 focus:border-[#247C78] transition"
                    />
                    <span className="text-[11px] text-[#718096] mt-1 block">
                      Workforce headcount requiring software access
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#263746] mb-1.5">
                      Headquarters Region
                    </label>
                    <select
                      value={formData.region}
                      onChange={(e) => handleChange('region', e.target.value)}
                      className="w-full h-10 bg-white border border-[#DCE5EA] rounded-xl px-3 text-xs text-[#263746] focus:outline-none focus:ring-2 focus:ring-[#247C78]/20 focus:border-[#247C78] transition cursor-pointer"
                    >
                      <option value="North America">North America</option>
                      <option value="EMEA">Europe, Middle East & Africa</option>
                      <option value="Asia Pacific">Asia Pacific</option>
                      <option value="Latin America">Latin America</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#263746] mb-1.5">
                      Current Infrastructure Topology *
                    </label>
                    <select
                      value={formData.infrastructure}
                      onChange={(e) => handleChange('infrastructure', e.target.value)}
                      className="w-full h-10 bg-white border border-[#DCE5EA] rounded-xl px-3 text-xs text-[#263746] focus:outline-none focus:ring-2 focus:ring-[#247C78]/20 focus:border-[#247C78] transition cursor-pointer"
                    >
                      <option value="On-premise">On-premise Datacenter / Bare Metal</option>
                      <option value="Hybrid">Hybrid (On-premise + Colocated)</option>
                      <option value="Colocated">Colocated Managed Hosting</option>
                      <option value="Private Cloud">Private Cloud Infrastructure</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-[#263746] mb-1.5">
                      Industry Sector *
                    </label>
                    <select
                      value={formData.industry}
                      onChange={(e) => handleChange('industry', e.target.value)}
                      className="w-full h-10 bg-white border border-[#DCE5EA] rounded-xl px-3 text-xs text-[#263746] focus:outline-none focus:ring-2 focus:ring-[#247C78]/20 focus:border-[#247C78] transition cursor-pointer"
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
                    <label className="block text-xs font-semibold text-[#263746] mb-1.5">
                      Annual IT Budget ($ USD) *
                    </label>
                    <input
                      type="number"
                      min="10000"
                      step="10000"
                      required
                      value={formData.itBudget}
                      onChange={(e) => handleChange('itBudget', Number(e.target.value))}
                      className="w-full h-10 bg-white border border-[#DCE5EA] rounded-xl px-3.5 text-xs text-[#263746] font-mono focus:outline-none focus:ring-2 focus:ring-[#247C78]/20 focus:border-[#247C78] transition"
                    />
                    <span className="text-[11px] text-[#718096] mt-1 block">
                      Total tech budget: {formatCurrency(formData.itBudget)} (${Math.round(formData.itBudget / Math.max(1, formData.employees))}/emp)
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#263746] mb-1.5">
                      Expected Annual Growth Rate (%) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="200"
                      step="1"
                      value={formData.growthRate}
                      onChange={(e) => handleChange('growthRate', Number(e.target.value))}
                      className="w-full h-10 bg-white border border-[#DCE5EA] rounded-xl px-3.5 text-xs text-[#263746] focus:outline-none focus:ring-2 focus:ring-[#247C78]/20 focus:border-[#247C78] transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#263746] mb-1.5">
                      Data Sensitivity Classification *
                    </label>
                    <select
                      value={formData.dataSensitivity}
                      onChange={(e) => handleChange('dataSensitivity', e.target.value)}
                      className="w-full h-10 bg-white border border-[#DCE5EA] rounded-xl px-3 text-xs text-[#263746] focus:outline-none focus:ring-2 focus:ring-[#247C78]/20 focus:border-[#247C78] transition cursor-pointer"
                    >
                      <option value="High">High (PII, Financial, HIPAA, Intellectual Property)</option>
                      <option value="Medium">Medium (Internal Business Records, Commercial Data)</option>
                      <option value="Low">Low (Publicly Accessible Operational Information)</option>
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#263746] mb-1.5">
                    Current Operational Pain Points & Bottlenecks
                  </label>
                  <textarea
                    rows={2}
                    value={formData.painPoints}
                    onChange={(e) => handleChange('painPoints', e.target.value)}
                    className="w-full bg-white border border-[#DCE5EA] rounded-xl p-3 text-xs text-[#263746] focus:outline-none focus:ring-2 focus:ring-[#247C78]/20 focus:border-[#247C78] transition"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: 5-Dimension Readiness Questionnaire (20 Structured Statements) */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DCE5EA] pb-4">
                <div>
                  <h3 className="text-lg font-bold text-[#102B46]">
                    Step 2: 5-Dimension Readiness Assessment Questionnaire
                  </h3>
                  <p className="text-xs text-[#718096] mt-1">
                    Structured 20-statement diagnostic evaluating readiness across 5 enterprise dimensions ({totalAnsweredCount}/20 answered).
                  </p>
                </div>
                <span className="text-xs font-bold text-[#247C78] px-3 py-1 bg-[#247C78]/10 rounded-full border border-[#247C78]/20 self-start sm:self-auto">
                  {totalAnsweredCount === 20 ? 'All 20 Answered ✓' : `${20 - totalAnsweredCount} Remaining`}
                </span>
              </div>

              {/* 5-Dimension Navigation Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {ASSESSMENT_DIMENSIONS.map((dim, idx) => {
                  const isDimActive = activeDimensionIndex === idx;
                  const answeredInDim = dim.questions.filter(q => formData.answers[q.id] !== undefined).length;
                  return (
                    <button
                      key={dim.id}
                      type="button"
                      onClick={() => setActiveDimensionIndex(idx)}
                      className={`p-3 rounded-xl border text-left transition ${
                        isDimActive
                          ? 'bg-[#247C78] text-white border-[#247C78] shadow-xs'
                          : 'bg-[#F4F7FA] text-[#263746] border-[#DCE5EA] hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                        Dim {dim.num}
                      </div>
                      <div className="text-xs font-bold truncate mt-0.5">{dim.shortTitle}</div>
                      <div className="text-[10px] mt-1 flex items-center justify-between">
                        <span>{answeredInDim}/4 answered</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Active Dimension Card */}
              <div className="p-5 rounded-2xl bg-[#F4F7FA] border border-[#DCE5EA] space-y-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#247C78]">
                    Dimension {currentDim.num} of 5 &middot; {currentDim.estMinutes}
                  </span>
                  <h4 className="text-base font-bold text-[#102B46] mt-0.5">{currentDim.title}</h4>
                  <p className="text-xs text-[#718096] mt-1">{currentDim.description}</p>
                </div>

                {/* 4 Questions for current dimension */}
                <div className="space-y-4 pt-2">
                  {currentDim.questions.map((q, qIdx) => {
                    const currentVal = formData.answers[q.id];
                    return (
                      <div
                        key={q.id}
                        className="p-4 rounded-xl bg-white border border-[#DCE5EA] shadow-2xs space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="text-[10px] font-bold text-[#718096] uppercase">
                              Statement {qIdx + 1} &middot; {q.prompt}
                            </span>
                            <p className="text-xs font-semibold text-[#102B46] mt-1 leading-relaxed">
                              {q.statement}
                            </p>
                            <p className="text-[11px] text-[#718096] mt-1">
                              Guidance: {q.guidance}
                            </p>
                          </div>
                        </div>

                        {/* Choice Pills */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                          {ANSWER_CHOICES.map((choice) => {
                            const isChosen = currentVal === choice.value;
                            return (
                              <button
                                key={choice.value}
                                type="button"
                                onClick={() => handleAnswerChange(q.id, choice.value)}
                                className={`px-3 py-2 rounded-xl text-xs font-medium border text-center transition ${
                                  isChosen
                                    ? 'bg-[#102B46] text-white border-[#102B46] font-bold shadow-xs'
                                    : 'bg-white text-[#263746] border-[#DCE5EA] hover:border-[#247C78]/50'
                                }`}
                              >
                                {choice.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Dimension Quick-Stepper */}
                <div className="flex justify-between items-center pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={activeDimensionIndex === 0}
                    onClick={() => setActiveDimensionIndex(prev => prev - 1)}
                  >
                    ← Previous Dimension
                  </Button>
                  <span className="text-xs text-[#718096]">
                    Dimension {activeDimensionIndex + 1} of 5
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={activeDimensionIndex === 4}
                    onClick={() => setActiveDimensionIndex(prev => prev + 1)}
                  >
                    Next Dimension →
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Legacy Monoliths Inventory */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DCE5EA] pb-4">
                <div>
                  <h3 className="text-lg font-bold text-[#102B46]">
                    Step 3: Legacy Monolithic Systems Inventory
                  </h3>
                  <p className="text-xs text-[#718096] mt-1">
                    Catalog active legacy applications to evaluate migration complexity and data loss risk.
                  </p>
                </div>
                <Button variant="primary" size="sm" onClick={() => setIsAddLegacyModalOpen(true)}>
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  <span>Add Legacy System</span>
                </Button>
              </div>

              <div className="overflow-x-auto border border-[#DCE5EA] rounded-xl bg-white shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F4F7FA] text-[#263746] border-b border-[#DCE5EA] font-semibold">
                    <tr>
                      <th className="p-3.5">Application Name</th>
                      <th className="p-3.5">Business Function</th>
                      <th className="p-3.5">Hosting Topology</th>
                      <th className="p-3.5">Criticality</th>
                      <th className="p-3.5">Active Users</th>
                      <th className="p-3.5">Years in Use</th>
                      <th className="p-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DCE5EA]">
                    {formData.legacyApplications.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-[#718096]">
                          No legacy monoliths registered. Click &quot;Add Legacy System&quot; above.
                        </td>
                      </tr>
                    ) : (
                      formData.legacyApplications.map((app, idx) => (
                        <tr key={app.ID || idx} className="hover:bg-[#F4F7FA]/70 transition">
                          <td className="p-3.5 font-bold text-[#102B46]">{app.name}</td>
                          <td className="p-3.5 text-[#263746]">{app.function}</td>
                          <td className="p-3.5">
                            <span className="px-2.5 py-1 rounded-md bg-[#F4F7FA] border border-[#DCE5EA] text-[11px] font-mono text-[#263746]">
                              {app.hosting}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                app.criticality === 'Critical'
                                  ? 'bg-red-100 text-red-700 border border-red-200'
                                  : app.criticality === 'High'
                                  ? 'bg-amber-100 text-amber-700 border border-amber-200'
                                  : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              {app.criticality}
                            </span>
                          </td>
                          <td className="p-3.5 text-[#263746] font-medium">{app.userCount} users</td>
                          <td className="p-3.5 text-[#718096]">{app.yearsInUse} yrs</td>
                          <td className="p-3.5 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveLegacy(app.ID || app.name, app.name)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
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

          {/* STEP 4: Criteria Weightings */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DCE5EA] pb-4">
                <div>
                  <h3 className="text-lg font-bold text-[#102B46]">
                    Step 4: Multi-Criteria Weighting Configuration
                  </h3>
                  <p className="text-xs text-[#718096] mt-1">
                    Configure preference weights for SaaS recommendation scoring. <strong>Weights must total exactly 100%</strong>.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={resetWeights}>
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  <span>Reset to Defaults (20/30/25/15/10)</span>
                </Button>
              </div>

              {/* Stacked Proportional Bar */}
              <div className="p-5 rounded-xl bg-[#F4F7FA] border border-[#DCE5EA] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#263746] font-semibold">Sum of Criteria Weights:</span>
                  <span
                    className={`font-bold px-3 py-1 rounded-full text-xs transition ${
                      isWeightsValid
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                        : 'bg-red-100 text-red-700 border border-red-300'
                    }`}
                  >
                    {weightsSum}% {isWeightsValid ? '✓ Valid' : '✕ Must equal 100%'}
                  </span>
                </div>

                <div className="h-6 w-full bg-[#DCE5EA] rounded-lg overflow-hidden flex text-[10px] font-semibold text-white">
                  <div
                    style={{ width: `${Math.max(0, formData.weights.cost)}%` }}
                    className="bg-[#E7B65C] flex items-center justify-center transition-all overflow-hidden whitespace-nowrap text-[#102B46] font-bold"
                  >
                    {formData.weights.cost >= 8 && `Cost ${formData.weights.cost}%`}
                  </div>
                  <div
                    style={{ width: `${Math.max(0, formData.weights.security)}%` }}
                    className="bg-[#102B46] flex items-center justify-center transition-all overflow-hidden whitespace-nowrap"
                  >
                    {formData.weights.security >= 8 && `Sec ${formData.weights.security}%`}
                  </div>
                  <div
                    style={{ width: `${Math.max(0, formData.weights.scalability)}%` }}
                    className="bg-[#247C78] flex items-center justify-center transition-all overflow-hidden whitespace-nowrap"
                  >
                    {formData.weights.scalability >= 8 && `Scale ${formData.weights.scalability}%`}
                  </div>
                  <div
                    style={{ width: `${Math.max(0, formData.weights.integration)}%` }}
                    className="bg-emerald-600 flex items-center justify-center transition-all overflow-hidden whitespace-nowrap"
                  >
                    {formData.weights.integration >= 8 && `Int ${formData.weights.integration}%`}
                  </div>
                  <div
                    style={{ width: `${Math.max(0, formData.weights.features)}%` }}
                    className="bg-purple-600 flex items-center justify-center transition-all overflow-hidden whitespace-nowrap"
                  >
                    {formData.weights.features >= 8 && `Feat ${formData.weights.features}%`}
                  </div>
                </div>
              </div>

              {/* Sliders */}
              <div className="space-y-4 pt-1">
                {[
                  { key: 'cost', label: 'Cost Fit (TCO & Licensing)', color: 'text-amber-600' },
                  { key: 'security', label: 'Security & Compliance', color: 'text-[#102B46]' },
                  { key: 'scalability', label: 'Scalability & Multi-Tenancy', color: 'text-[#247C78]' },
                  { key: 'integration', label: 'Integration & APIs', color: 'text-emerald-600' },
                  { key: 'features', label: 'Features & Maturity', color: 'text-purple-600' }
                ].map((item) => (
                  <div key={item.key} className="space-y-2 p-4 rounded-xl bg-white border border-[#DCE5EA] shadow-2xs">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#263746] font-semibold">{item.label}</span>
                      <span className={`font-mono font-bold ${item.color}`}>{formData.weights[item.key]}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="60"
                      step="5"
                      value={formData.weights[item.key]}
                      onChange={(e) => handleWeightChange(item.key, e.target.value)}
                      className="w-full h-2 bg-[#DCE5EA] rounded-lg appearance-none cursor-pointer accent-[#247C78]"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: Results Presentation & Improvement Recommendations */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="border-b border-[#DCE5EA] pb-4">
                <h3 className="text-lg font-bold text-[#102B46]">
                  Step 5: Technology, Organisation & Environment (TOE) Results
                </h3>
                <p className="text-xs text-[#718096] mt-1">
                  Computed multidimensional index derived from 20 diagnostic responses and organizational telemetry.
                </p>
              </div>

              {/* Overall Score Banner */}
              <div className="p-6 rounded-2xl bg-[#F4F7FA] border border-[#DCE5EA] flex flex-col sm:flex-row items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-white border-4 border-[#247C78] flex flex-col items-center justify-center shrink-0 shadow-sm">
                  <span className="text-3xl font-extrabold text-[#102B46]">{formatNumber(readinessResults.readinessScore)}</span>
                  <span className="text-[10px] text-[#718096] uppercase tracking-wider font-bold">TOE Index</span>
                </div>
                <div>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 ${
                      readinessResults.readinessLevel === 'High'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    {readinessResults.readinessLevel} Readiness Profile
                  </span>
                  <p className="text-xs text-[#263746] leading-relaxed">
                    Your organisation demonstrates adequate financial runway (${Math.round(formData.itBudget / formData.employees).toLocaleString()}/employee), strong executive sponsorship, and structured integration capacity across {formData.legacyApplications.length} cataloged monolithic systems.
                  </p>
                </div>
              </div>

              {/* 5-Dimension Sub-scores Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#102B46] uppercase tracking-wider">
                  Dimension-Wise Readiness Scores (0–100%)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  {ASSESSMENT_DIMENSIONS.map((dim) => {
                    const score = readinessResults.dimensionScores?.[dim.id] || 70;
                    return (
                      <div key={dim.id} className="p-4 rounded-xl bg-white border border-[#DCE5EA] shadow-2xs">
                        <span className="text-[10px] text-[#718096] font-bold uppercase">{dim.shortTitle}</span>
                        <div className="text-xl font-extrabold text-[#102B46] mt-1">
                          {score}<span className="text-xs font-normal text-[#718096]">/100</span>
                        </div>
                        <div className="w-full bg-[#DCE5EA] h-1.5 rounded-full mt-2 overflow-hidden">
                          <div
                            className="bg-[#247C78] h-full rounded-full transition-all"
                            style={{ width: `${score}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3 Core TOE Pillars Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-white border border-[#DCE5EA] shadow-2xs">
                  <span className="text-[11px] text-[#718096] font-bold uppercase">Technology (40% wt)</span>
                  <div className="text-2xl font-extrabold text-[#102B46] mt-1.5">
                    {formatNumber(readinessResults.toeTechScore)}<span className="text-xs font-normal text-[#718096]">/100</span>
                  </div>
                  <p className="text-[11px] text-[#718096] mt-1">Evaluates API middleware, architecture modernism and legacy debt.</p>
                </div>
                <div className="p-4 rounded-xl bg-white border border-[#DCE5EA] shadow-2xs">
                  <span className="text-[11px] text-[#718096] font-bold uppercase">Organisation (35% wt)</span>
                  <div className="text-2xl font-extrabold text-[#102B46] mt-1.5">
                    {formatNumber(readinessResults.toeOrgScore)}<span className="text-xs font-normal text-[#718096]">/100</span>
                  </div>
                  <p className="text-[11px] text-[#718096] mt-1">Reflects budget per user (${Math.round(formData.itBudget / formData.employees).toLocaleString()}) and change agility.</p>
                </div>
                <div className="p-4 rounded-xl bg-white border border-[#DCE5EA] shadow-2xs">
                  <span className="text-[11px] text-[#718096] font-bold uppercase">Environment (25% wt)</span>
                  <div className="text-2xl font-extrabold text-[#102B46] mt-1.5">
                    {formatNumber(readinessResults.toeEnvScore)}<span className="text-xs font-normal text-[#718096]">/100</span>
                  </div>
                  <p className="text-[11px] text-[#718096] mt-1">Reflects {formData.growthRate}% annual growth and ESG future readiness.</p>
                </div>
              </div>

              {/* Improvement Recommendations */}
              <div className="p-5 rounded-xl bg-[#F4F7FA] border border-[#DCE5EA] space-y-3">
                <h4 className="text-xs font-bold text-[#102B46] uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#247C78]" />
                  <span>Strategic Improvement Recommendations</span>
                </h4>
                <ul className="space-y-2 text-xs text-[#263746]">
                  {readinessResults.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#247C78] font-bold mt-0.5">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* 4. Footer & Navigation */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-4 bg-white border-t border-[#DCE5EA]">
          <Button
            variant="outline"
            size="md"
            onClick={handlePrev}
            disabled={step === 1}
            className="text-xs font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            <span>Back</span>
          </Button>

          <div>
            {step < 5 ? (
              <Button
                variant="primary"
                size="md"
                onClick={handleNext}
                className="text-xs font-semibold"
              >
                <span>Next Step</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            ) : (
              <Button
                variant="teal"
                size="md"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="text-xs font-semibold"
              >
                <span>{isSubmitting ? 'Evaluating...' : 'Save & Submit Assessment'}</span>
                <CheckCircle className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            )}
          </div>
        </div>
      </div>

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
            <label className="block font-semibold text-[#263746] mb-1">System Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Warehouse Monolith v2"
              value={newLegacyApp.name}
              onChange={(e) => setNewLegacyApp({ ...newLegacyApp, name: e.target.value })}
              className="w-full bg-white border border-[#DCE5EA] rounded-xl p-2.5 text-[#263746] focus:outline-none focus:border-[#247C78]"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#263746] mb-1">Business Function</label>
            <input
              type="text"
              placeholder="e.g. Logistics & Inventory Management"
              value={newLegacyApp.function}
              onChange={(e) => setNewLegacyApp({ ...newLegacyApp, function: e.target.value })}
              className="w-full bg-white border border-[#DCE5EA] rounded-xl p-2.5 text-[#263746] focus:outline-none focus:border-[#247C78]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#263746] mb-1">Hosting Topology</label>
              <select
                value={newLegacyApp.hosting}
                onChange={(e) => setNewLegacyApp({ ...newLegacyApp, hosting: e.target.value })}
                className="w-full bg-white border border-[#DCE5EA] rounded-xl p-2.5 text-[#263746] focus:outline-none focus:border-[#247C78] cursor-pointer"
              >
                <option value="On-premise Datacenter">On-premise Datacenter</option>
                <option value="Hybrid Datacenter">Hybrid Datacenter</option>
                <option value="Local Share Server">Local Share Server</option>
                <option value="Colocated Rack">Colocated Rack</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#263746] mb-1">Criticality</label>
              <select
                value={newLegacyApp.criticality}
                onChange={(e) => setNewLegacyApp({ ...newLegacyApp, criticality: e.target.value })}
                className="w-full bg-white border border-[#DCE5EA] rounded-xl p-2.5 text-[#263746] focus:outline-none focus:border-[#247C78] cursor-pointer"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#263746] mb-1">Active Users</label>
              <input
                type="number"
                min="1"
                value={newLegacyApp.userCount}
                onChange={(e) => setNewLegacyApp({ ...newLegacyApp, userCount: Number(e.target.value) })}
                className="w-full bg-white border border-[#DCE5EA] rounded-xl p-2.5 text-[#263746] focus:outline-none focus:border-[#247C78]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#263746] mb-1">Years in Use</label>
              <input
                type="number"
                min="1"
                value={newLegacyApp.yearsInUse}
                onChange={(e) => setNewLegacyApp({ ...newLegacyApp, yearsInUse: Number(e.target.value) })}
                className="w-full bg-white border border-[#DCE5EA] rounded-xl p-2.5 text-[#263746] focus:outline-none focus:border-[#247C78]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-[#DCE5EA]">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAddLegacyModalOpen(false)}>
              <X className="w-3.5 h-3.5 mr-1" />
              <span>Cancel</span>
            </Button>
            <Button type="submit" variant="primary" size="sm">
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Add to Inventory</span>
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
