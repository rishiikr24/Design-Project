# NIRNAY: Enterprise SaaS Transformation Platform
## Selected Core Source Codes for Academic Project Report
**Project Title**: NIRNAY — Enterprise Decision-Support & SaaS Migration Readiness Platform  
**Authors**: Rishi Kumar, Aarushi Joshi, Pradyumn Bisen, Akshayadevi K.  
**Tech Stack**: React 18, Vite, Tailwind CSS, Recharts, PostgreSQL / Supabase, Vitest  

---

### Table of Contents
1. **Module 1: Technology-Organization-Environment (TOE) Readiness Engine** (`frontend/src/lib/readiness.js`)
2. **Module 2: Multi-Criteria SaaS Evaluation & Decision Scoring Engine** (`frontend/src/lib/scoring.js`)
3. **Module 3: AI Transformation Advisor Context-Aware Inference Engine** (`frontend/src/lib/assistant.js`)
4. **Module 4: Enterprise Multi-Tenant Security & Row-Level Security (RLS) Schema** (`supabase/migrations/20261101000002_auth_rls.sql`)

---

## 1. Technology-Organization-Environment (TOE) Readiness Engine

- **Source File**: `frontend/src/lib/readiness.js`
- **Purpose**: Implements the theoretical TOE framework (Tornatzky & Fleischer) to calculate quantitative SaaS adoption readiness scores from enterprise telemetry, legacy infrastructure footprints, and structured diagnostic surveys.
- **Mathematical Weights**:
  $$\text{Overall Readiness Score} = (0.40 \times \text{Tech}) + (0.35 \times \text{Org}) + (0.25 \times \text{Env})$$

```javascript
import { ASSESSMENT_DIMENSIONS } from '../data/assessmentQuestions';

/**
 * Technology - Organisation - Environment (TOE) Enterprise Readiness Assessment
 * Computes multidimensional SaaS adoption readiness metrics.
 * 
 * Preserves exact PRD base formulas while integrating 20-statement diagnostic responses when present.
 */
export function calculateReadiness(assessment = {}) {
  const employees = Number(assessment.employees) || 500;
  const itBudget = Number(assessment.itBudget) || 1000000;
  const growthRate = Number(assessment.growthRate) || 10;
  const dataSensitivity = assessment.dataSensitivity || 'Medium';
  const infrastructure = (assessment.infrastructure || 'On-premise').toLowerCase();
  const legacyCount = Number(assessment.legacyAppsCount) || 
                      (Array.isArray(assessment.legacyApplications) ? assessment.legacyApplications.length : 3);

  // 1. Technology Factor (40% weight in TOE)
  let techScore = 70.0;
  if (infrastructure.includes('hybrid') || infrastructure.includes('private cloud')) {
    techScore += 12.0;
  } else if (infrastructure.includes('colocated')) {
    techScore += 5.0;
  } else {
    techScore -= 5.0;
  }

  if (legacyCount <= 2) techScore += 8.0;
  else if (legacyCount >= 5) techScore -= 10.0;
  techScore = Math.min(100, Math.max(30, techScore));

  // 2. Organisation Factor (35% weight in TOE)
  let orgScore = 65.0;
  const budgetPerEmp = itBudget / Math.max(1, employees);
  if (budgetPerEmp >= 1500) orgScore += 15.0;
  else if (budgetPerEmp >= 1000) orgScore += 10.0;
  else if (budgetPerEmp < 500) orgScore -= 10.0;

  if (employees >= 1000) orgScore += 5.0;
  orgScore = Math.min(100, Math.max(30, orgScore));

  // 3. Environment Factor (25% weight in TOE)
  let envScore = 70.0;
  if (growthRate >= 15) envScore += 12.0;
  else if (growthRate >= 8) envScore += 6.0;

  if (dataSensitivity === 'High') {
    envScore += 5.0;
  }
  envScore = Math.min(100, Math.max(30, envScore));

  // Overall Weighted TOE Score (40% Tech + 35% Org + 25% Env)
  const overallScore = Math.round(((techScore * 0.40) + (orgScore * 0.35) + (envScore * 0.25)) * 10) / 10;

  let readinessLevel = 'Moderate';
  if (overallScore >= 80) readinessLevel = 'High';
  else if (overallScore < 60) readinessLevel = 'Preliminary';

  // Calculate 5-dimension sub-scores from the 20 structured diagnostic answers
  const answers = assessment.answers || {};
  const scoreLookup = { fully: 100, partially: 66.7, not_sure: 33.3, not_in_place: 0 };
  const dimensionScores = {};

  ASSESSMENT_DIMENSIONS.forEach(dim => {
    let total = 0;
    let count = 0;
    dim.questions.forEach(q => {
      const val = answers[q.id];
      if (val !== undefined && scoreLookup[val] !== undefined) {
        total += scoreLookup[val];
        count += 1;
      }
    });
    // Default fallback to corresponding TOE pillar baseline if no answers submitted
    const defaultBaseline = dim.id === 'org' ? orgScore : dim.id === 'tech' ? techScore : dim.id === 'fin' ? orgScore : dim.id === 'sec' ? techScore : envScore;
    dimensionScores[dim.id] = count > 0 ? Math.round((total / count) * 10) / 10 : Math.round(defaultBaseline * 10) / 10;
  });

  // Tailored Improvement Recommendations
  const recommendations = [];
  if (dimensionScores.tech < 75 || techScore < 70) {
    recommendations.push('Establish centralized API and iPaaS integration gateways to decouple legacy batch ETL pipelines.');
  }
  if (dimensionScores.sec < 80 || dataSensitivity === 'High') {
    recommendations.push('Enforce mandatory SOC 2 Type II compliance reviews and centralized SSO/IAM enforcement.');
  }
  if (dimensionScores.org < 75 || orgScore < 75) {
    recommendations.push('Inaugurate a formal Change Enablement Champion Network to train business teams on standard SaaS workflows.');
  }
  if (dimensionScores.fin < 75 || budgetPerEmp < 1000) {
    recommendations.push('Structure multi-year cloud OpEx allocation and allocate migration contingency reserves for dual-running cutovers.');
  }
  if (dimensionScores.sus < 75) {
    recommendations.push('Contractually define data portability and export exit safeguards to avoid multi-year proprietary vendor lock-in.');
  }
  if (recommendations.length === 0) {
    recommendations.push('Maintain quarterly architecture reviews and execute continuous SaaS feature adoption sprints.');
  }

  return {
    readinessScore: overallScore,
    readinessLevel,
    toeTechScore: Math.round(techScore * 10) / 10,
    toeOrgScore: Math.round(orgScore * 10) / 10,
    toeEnvScore: Math.round(envScore * 10) / 10,
    dimensionScores,
    recommendations
  };
}
```

---

## 2. Multi-Criteria SaaS Evaluation & Decision Scoring Engine

- **Source File**: `frontend/src/lib/scoring.js`
- **Purpose**: Provides weighted multi-criteria decision analysis (MCDA / TOPSIS principles) to rank target enterprise SaaS vendors (ERP, CRM, HCM, Cloud Infrastructure) against customizable organizational priorities.
- **Criteria Weight Distribution**:
  - Security & Compliance: 30%
  - Scalability & SLA: 25%
  - Total Cost of Ownership (TCO Fit): 20%
  - Integration & Architecture: 15%
  - Functional Feature Fit: 10%

```javascript
import { generateReason } from './reasons';

export const DEFAULT_WEIGHTS = {
  cost: 20.0,
  security: 30.0,
  scalability: 25.0,
  integration: 15.0,
  features: 10.0
};

export function validateWeights(weights) {
  if (!weights) return false;
  const values = [weights.cost, weights.security, weights.scalability, weights.integration, weights.features].map(v => Number(v) || 0);
  if (values.some(v => v < 0 || v > 100)) return false;
  const sum = values.reduce((a, b) => a + b, 0);
  return Math.abs(sum - 100.0) < 0.01;
}

export function scoreProduct(product, weights = DEFAULT_WEIGHTS) {
  const costSubScore = Number(product.costScore) || 70.0;
  const securitySubScore = Number(product.securityScore) || 75.0;
  const scalabilitySubScore = Number(product.scalabilityScore) || 80.0;
  const integrationSubScore = Number(product.integrationScore) || 75.0;
  const featuresSubScore = Number(product.featuresScore) || 80.0;

  const totalScore = (
    (costSubScore * (weights.cost / 100)) +
    (securitySubScore * (weights.security / 100)) +
    (scalabilitySubScore * (weights.scalability / 100)) +
    (integrationSubScore * (weights.integration / 100)) +
    (featuresSubScore * (weights.features / 100))
  );

  return {
    productId: product.ID || product.id,
    productName: product.name,
    vendor: product.vendor,
    category: product.category,
    costSubScore,
    securitySubScore,
    scalabilitySubScore,
    integrationSubScore,
    featuresSubScore,
    totalScore: Math.round(totalScore * 100) / 100
  };
}

export function evaluateProducts(products = [], weights = DEFAULT_WEIGHTS, assessment = {}) {
  if (!Array.isArray(products) || products.length === 0) {
    return [];
  }

  const effectiveWeights = validateWeights(weights) ? weights : DEFAULT_WEIGHTS;

  let candidates = products;
  if (assessment.targetCategory && assessment.targetCategory !== 'All') {
    const filtered = products.filter(
      p => p.category && p.category.toLowerCase() === assessment.targetCategory.toLowerCase()
    );
    if (filtered.length > 0) {
      candidates = filtered;
    }
  }

  const scored = candidates.map(product => {
    const result = scoreProduct(product, effectiveWeights);
    const reason = generateReason(product, result, effectiveWeights, assessment);
    return {
      ...result,
      reason
    };
  });

  scored.sort((a, b) => b.totalScore - a.totalScore);

  return scored.map((item, index) => ({
    ...item,
    rank: index + 1
  }));
}
```

---

## 3. AI Transformation Advisor Context-Aware Inference Engine

- **Source File**: `frontend/src/lib/assistant.js`
- **Purpose**: Contextual rule-based AI expert system that synthesizes live organizational assessment telemetry, 5x5 risk scores, phased roadmap milestones, and candidate rankings to answer executive strategic questions.

```javascript
export function answerQuestion(question, context = {}) {
  const q = (question || '').toLowerCase().trim();
  const assessment = context.assessment || {};
  const results = context.results || [];
  const risks = context.risks || [];
  const plan = context.plan || {};

  const topProduct = results.length > 0 ? results[0] : null;

  if (!q) {
    return {
      answer: "Welcome to the NIRNAY Enterprise Transformation Advisory Engine. You can ask for decision support regarding your TOE readiness evaluation, SaaS selection trade-offs, risk mitigations, or 8-phase migration timeline.",
      suggestedQuestions: [
        "How can we improve technology readiness?",
        "What are our biggest transformation risks?",
        "Which migration phase should we prioritise?",
        "How can we reduce SaaS adoption costs?"
      ],
      category: 'Transformation Guidance'
    };
  }

  // Question 1: How can we improve technology readiness?
  if (q.includes('improve') && (q.includes('tech') || q.includes('readiness'))) {
    const techScore = assessment.toeTechScore || 65;
    return {
      answer: `To elevate your **Technology Readiness score (currently ${techScore}/100)**, we recommend three strategic initiatives:\n\n` +
        `1. **Legacy Decoupling**: Modernize API interfaces around the ${assessment.legacyApplications?.length || 4} identified monolith systems prior to full cutover.\n` +
        `2. **Automated Data Validation**: Establish automated schema validation and ETL staging pipelines to support seamless data transfer.\n` +
        `3. **Identity & Access Standardization**: Standardize enterprise SAML 2.0 / OIDC single sign-on across all legacy and incoming cloud services.\n\n` +
        `Target outcome: Achieving a Technology readiness benchmark above 80/100 will significantly de-risk subsequent migration phases.`,
      category: 'Technology Strategy'
    };
  }

  // Question 2: What are our biggest transformation risks?
  if (q.includes('risk') || q.includes('threat') || q.includes('vulnerability') || q.includes('biggest')) {
    const criticalRisks = (risks || []).filter(r => r.severity === 'Critical' || r.severity === 'High');
    let riskList = "";
    if (criticalRisks.length > 0) {
      riskList = criticalRisks.map(r => `• **${r.riskTitle}** (${r.severity}, Score: ${r.score}/25)\n  *Mitigation*: ${r.mitigation}`).join('\n\n');
    } else {
      riskList = "• All monitored risks currently reside within moderate or acceptable operational thresholds.";
    }

    return {
      answer: `Based on your enterprise profile (Infrastructure: **${assessment.infrastructure || 'On-premise'}**, Data Sensitivity: **${assessment.dataSensitivity || 'High'}**), here are your primary transformation exposure vectors:\n\n${riskList}\n\n` +
        `**Recommendation**: Ensure dual-run testing and strict data validation checkpoints are enforced in Phase 4 (Data Migration) before commencing legacy decommissioning.`,
      category: 'Risk Analysis'
    };
  }

  // Question 3: Which migration phase should we prioritise?
  if (q.includes('phase') || q.includes('prioritise') || q.includes('prioritize') || q.includes('roadmap') || q.includes('timeline')) {
    const totalDuration = plan.estimatedDurationMonths || 12;
    const progress = plan.overallProgress !== undefined ? plan.overallProgress : 35;
    return {
      answer: `Your transformation is structured into an **8-Phase Roadmap** over **${totalDuration} months** (current progress: **${progress}%**).\n\n` +
        `**Key Priorities Right Now**:\n` +
        `• **Phase 3 — Pilot Testing & Proof-of-Concept**: Validate critical transactional workflows in an isolated sandbox environment.\n` +
        `• **Phase 4 — Data Migration & Cleansing**: Prioritize legacy schema mapping and automated reconciliation dry runs. Historically, data cleansing accounts for 40% of schedule delays if deferred.\n\n` +
        `Maintaining thorough execution across Phases 3 and 4 ensures uninterrupted operational continuity during Phase 7 (Cutover).`,
      category: 'Migration Roadmap'
    };
  }

  // Question 4: How can we reduce SaaS adoption costs?
  if (q.includes('cost') || q.includes('reduce') || q.includes('budget') || q.includes('pricing') || q.includes('spend')) {
    return {
      answer: `To optimize and reduce SaaS transformation expenses (Current Annual IT Budget: **$${((assessment.itBudget || 1500000)).toLocaleString()}**):\n\n` +
        `1. **Right-Size Tiered Licensing**: Benchmark active employee usage (${assessment.employees || 1000} employees) to provision tiered licenses (Core vs. Light Users) instead of enterprise-wide full seats.\n` +
        `2. **Retire Redundant Infrastructure**: Accelerate decommissioning of legacy server hosting upon completion of Phase 7 cutover, realizing up to 30% operational cost savings.\n` +
        `3. **Multi-Year Volume Commitments**: Leverage vendor evaluation rankings to negotiate 15–20% discounts on multi-year SaaS contracts with defined SLA penalties.`,
      category: 'Cost Optimization'
    };
  }

  // Top Recommendation Decision Rationale
  if (q.includes('why') || q.includes('rank') || q.includes('top') || q.includes('score') || q.includes('winner') || q.includes('recommend')) {
    if (topProduct) {
      return {
        answer: `**${topProduct.productName}** holds Rank #1 with an overall weighted score of **${topProduct.totalScore}/100**:\n\n` +
          `• **Security Fit**: ${topProduct.securitySubScore}/100 (30% weight)\n` +
          `• **Scalability Fit**: ${topProduct.scalabilitySubScore}/100 (25% weight)\n` +
          `• **Cost Efficiency**: ${topProduct.costSubScore}/100 (20% weight)\n` +
          `• **Integration Fit**: ${topProduct.integrationSubScore}/100 (15% weight)\n` +
          `• **Feature Completeness**: ${topProduct.featuresSubScore}/100 (10% weight)\n\n` +
          `**Decision Rationale**: ${topProduct.reason}`,
        category: 'Scoring Rationale'
      };
    }
  }

  return {
    answer: `Analysis for "${question}": Enterprise recommendations indicate prioritizing data cleansing, standardizing API connectors across legacy applications, and conducting pilot testing before final cutover.`,
    category: 'Advisory Guidance'
  };
}
```

---

## 4. Enterprise Multi-Tenant Security & Row-Level Security (RLS) Schema

- **Source File**: `supabase/migrations/20261101000002_auth_rls.sql`
- **Purpose**: Implements enterprise multi-tenancy, Role-Based Access Control (RBAC with 4 tiers: Admin, Manager, Analyst, Viewer), and granular PostgreSQL Row-Level Security (RLS) policies with `SECURITY DEFINER` helper functions to prevent tenant cross-talk.

```sql
-- ==============================================================================
-- Migration: 20261101000002_auth_rls.sql
-- Description: Profiles, Role-Based Access Control (RBAC), and Row Level Security (RLS)
-- Based on: Enterprise Scopes (Admin, Manager, Analyst, Viewer)
-- ==============================================================================

-- 1. Profiles Table (Linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    full_name TEXT,
    email TEXT UNIQUE,
    role VARCHAR(20) NOT NULL DEFAULT 'viewer' CHECK (LOWER(role) IN ('admin', 'manager', 'analyst', 'viewer')),
    company_id TEXT REFERENCES public.companies(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    modified_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 2. Auth Helper Functions (SECURITY DEFINER for safe RLS evaluation)
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT LOWER(COALESCE(
        (SELECT role FROM public.profiles WHERE id = auth.uid()),
        (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role',
        'viewer'
    ));
$$;

CREATE OR REPLACE FUNCTION public.get_auth_company_id()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT COALESCE(
        (SELECT company_id FROM public.profiles WHERE id = auth.uid()),
        (auth.jwt() ->> 'user_metadata')::jsonb ->> 'company_id'
    );
$$;

-- Role Check Convenience Functions
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT public.get_auth_role() = 'admin'; $$;

CREATE OR REPLACE FUNCTION public.is_analyst_or_above()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT public.get_auth_role() IN ('admin', 'manager', 'analyst'); $$;

-- 3. Enabling Row Level Security on Core Tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessed_risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.migration_plans ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policy: Tenant Isolation for Assessments
CREATE POLICY "Allow read assessment for company members or admin"
    ON public.assessments FOR SELECT
    TO authenticated
    USING (
        public.is_admin()
        OR company_id = public.get_auth_company_id()
    );

CREATE POLICY "Allow analyst or above write for assessment"
    ON public.assessments FOR ALL
    TO authenticated
    USING (
        public.is_admin()
        OR (company_id = public.get_auth_company_id() AND public.is_analyst_or_above())
    )
    WITH CHECK (
        public.is_admin()
        OR (company_id = public.get_auth_company_id() AND public.is_analyst_or_above())
    );

-- 5. RLS Policy: Multi-Tenant Risk Register
CREATE POLICY "Allow read risk for company members or admin"
    ON public.assessed_risks FOR SELECT
    TO authenticated
    USING (
        public.is_admin()
        OR assessment_id IN (
            SELECT id FROM public.assessments
            WHERE company_id = public.get_auth_company_id()
        )
    );

CREATE POLICY "Allow analyst or above write for assessed_risks"
    ON public.assessed_risks FOR ALL
    TO authenticated
    USING (
        public.is_admin()
        OR (
            assessment_id IN (SELECT id FROM public.assessments WHERE company_id = public.get_auth_company_id())
            AND public.is_analyst_or_above()
        )
    )
    WITH CHECK (
        public.is_admin()
        OR (
            assessment_id IN (SELECT id FROM public.assessments WHERE company_id = public.get_auth_company_id())
            AND public.is_analyst_or_above()
        )
    );
```
