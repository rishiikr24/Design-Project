export function answerQuestion(question, context = {}) {
  const q = (question || '').toLowerCase().trim();
  const assessment = context.assessment || {};
  const results = context.results || [];
  const risks = context.risks || [];
  const plan = context.plan || {};

  const topProduct = results.length > 0 ? results[0] : null;

  if (!q) {
    return {
      answer: "Hello! I am your SAP Enterprise SaaS Transformation Advisor. You can ask me questions regarding your SaaS evaluation rankings, migration risks, phasing roadmap, or executive business case.",
      suggestedQuestions: [
        "Why is the top product ranked #1?",
        "What are our most critical migration risks?",
        "How should we plan data migration for our legacy systems?",
        "What does our TOE readiness score indicate?"
      ]
    };
  }

  if (q.includes('why') || q.includes('rank') || q.includes('top') || q.includes('score') || q.includes('winner')) {
    if (topProduct) {
      return {
        answer: `**${topProduct.productName}** holds Rank #1 with an overall weighted score of **${topProduct.totalScore}/100**.\n\n` +
          `• **Cost Fit**: ${topProduct.costSubScore}/100\n` +
          `• **Security**: ${topProduct.securitySubScore}/100\n` +
          `• **Scalability**: ${topProduct.scalabilitySubScore}/100\n` +
          `• **Integration**: ${topProduct.integrationSubScore}/100\n` +
          `• **Features**: ${topProduct.featuresSubScore}/100\n\n` +
          `**Decision Rationale**: ${topProduct.reason}\n\n` +
          `*Note: As an advisory assistant, I present and explain the engine's objective mathematical rankings based on your configured weights.*`,
        category: 'Scoring Rationale'
      };
    }
    return {
      answer: "No evaluation has been run yet. Please complete the Enterprise Assessment wizard and click 'Run Evaluation' to generate rankings and scores.",
      category: 'Scoring Rationale'
    };
  }

  if (q.includes('risk') || q.includes('threat') || q.includes('vulnerability') || q.includes('security')) {
    const criticalRisks = risks.filter(r => r.severity === 'Critical' || r.severity === 'High');
    let riskList = "";
    if (criticalRisks.length > 0) {
      riskList = criticalRisks.map(r => `• **${r.riskTitle}** (Score: ${r.score}/25, ${r.severity})\n  *Mitigation*: ${r.mitigation}`).join('\n\n');
    } else {
      riskList = "All evaluated risks currently reside within Moderate or Low severity bounds.";
    }

    return {
      answer: `Based on your enterprise parameters (Infrastructure: **${assessment.infrastructure || 'On-premise'}**, Data Sensitivity: **${assessment.dataSensitivity || 'High'}**), here is your risk profile:\n\n${riskList}\n\n**Guidance**: Focus pilot testing on data schema reconciliation and implement parallel dual-runs before decommissioning legacy systems.`,
      category: 'Risk Analysis'
    };
  }

  if (q.includes('plan') || q.includes('roadmap') || q.includes('phase') || q.includes('timeline') || q.includes('duration')) {
    const totalDuration = plan.estimatedDurationMonths || 12;
    const progress = plan.overallProgress !== undefined ? plan.overallProgress : 32.5;
    return {
      answer: `Your transformation is structured into an **8-Phase Roadmap** spanning **${totalDuration} months** with current progress at **${progress}%**:\n\n` +
        `1. **Assessment & Strategy**: TCO baseline & governance\n` +
        `2. **SaaS Selection**: Contract SLAs & tenant setup\n` +
        `3. **Pilot Testing & PoC**: Core journeys validation in sandbox\n` +
        `4. **Data Migration & Cleansing**: Schema ETL & dry runs\n` +
        `5. **Integration**: REST/OData APIs & SSO federation\n` +
        `6. **Employee Training**: Department champions & role labs\n` +
        `7. **Cutover & Go-Live**: Production cutover window & hypercare\n` +
        `8. **Post-Go-Live Monitoring**: Telemetry & license optimization\n\n` +
        `Current focus is on Phases 3 & 4 (Pilot Testing & Data Migration).`,
      category: 'Migration Roadmap'
    };
  }

  if (q.includes('readiness') || q.includes('toe')) {
    const readiness = assessment.readinessScore || 78.5;
    return {
      answer: `Your **TOE Readiness Score is ${readiness}/100**.\n\n` +
        `• **Technology**: ${assessment.toeTechScore || 72.0}/100 — reflects legacy infrastructure footprint and technical debt.\n` +
        `• **Organisation**: ${assessment.toeOrgScore || 80.0}/100 — evaluated from IT budget adequacy ($${(assessment.itBudget || 1500000).toLocaleString()}) and workforce scale.\n` +
        `• **Environment**: ${assessment.toeEnvScore || 85.0}/100 — driven by expected market expansion rate (${assessment.growthRate || 18}%) and compliance standards.\n\n` +
        `An overall score above 75 indicates a ready enterprise profile prepared for cloud SaaS adoption.`,
      category: 'Readiness Diagnosis'
    };
  }

  return {
    answer: `**Executive Summary for CFO & Leadership**:\n\n` +
      `• **Capital Allocation**: Current annual IT budget is $${(assessment.itBudget || 1500000).toLocaleString()} across ${assessment.employees || 1000} users.\n` +
      `• **Target TCO Benefits**: Shifting from monolithic on-premise infrastructure reduces server maintenance by up to 35% and improves deployment agility by 4x.\n` +
      `• **Recommendation**: Proceed with ${topProduct ? topProduct.productName : 'recommended SaaS solution'} on a phased 12-month timeline to maintain cost predictability and preserve business continuity.`,
    category: 'Business Case'
  };
}

