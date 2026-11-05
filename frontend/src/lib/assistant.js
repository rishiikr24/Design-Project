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
        `1. **Right-Size Tiered Licensing**: Benchmark active employee usage ($${assessment.employees || 1000} employees) to provision tiered licenses (Core vs. Light Users) instead of enterprise-wide full seats.\n` +
        `2. **Retire Redundant Infrastructure**: Accelerate decommissioning of legacy server hosting upon completion of Phase 7 cutover, realizing up to 30% operational cost savings.\n` +
        `3. **Multi-Year Volume Commitments**: Leverage vendor evaluation rankings to negotiate 15–20% discounts on multi-year SaaS contracts with defined SLA penalties.`,
      category: 'Cost Optimization'
    };
  }

  // Scoring / Top product rationale
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
    return {
      answer: "No active evaluation results found. Please execute the recommendation engine from the SaaS Recommendation module to compute mathematical rankings.",
      category: 'Scoring Rationale'
    };
  }

  // TOE Framework diagnosis
  if (q.includes('toe') || q.includes('readiness')) {
    const readiness = assessment.readinessScore || 78.5;
    return {
      answer: `Your enterprise **TOE Readiness Score is ${readiness}/100**:\n\n` +
        `• **Technology**: ${assessment.toeTechScore || 65.0}/100 — evaluates architectural complexity, technical debt, and cloud compatibility.\n` +
        `• **Organisation**: ${assessment.toeOrgScore || 85.0}/100 — reflects management commitment, IT budget adequacy, and team readiness.\n` +
        `• **Environment**: ${assessment.toeEnvScore || 87.0}/100 — accounts for industry regulatory standards and vendor ecosystem maturity.\n\n` +
        `A score above 75 demonstrates healthy organizational capability for cloud SaaS transition.`,
      category: 'Readiness Diagnosis'
    };
  }

  // Default fallback
  return {
    answer: `Regarding your inquiry on "${question}":\n\n` +
      `For **${assessment.company?.name || 'your enterprise'}** (${assessment.employees || 1000} employees, ${assessment.infrastructure || 'On-premise'} infrastructure), successful transformation relies on aligning technology architecture with organizational change management.\n\n` +
      `We recommend reviewing the 8-phase roadmap and ensuring that data validation protocols are finalized before proceeding with cutover.`,
    category: 'Advisory Guidance'
  };
}
