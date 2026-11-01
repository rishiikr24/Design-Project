// ==============================================================================
// Supabase Edge Function: assistant-advisor
// Description: AI Transformation Advisor with LLM secret support and rule-based fallback
// Ported from: srv/lib/assistant.js
// ==============================================================================

export function answerQuestionDeterministic(question: string, context: any = {}) {
  const q = (question || '').toLowerCase().trim();
  const assessment = context.assessment || {};
  const results = context.results || [];
  const risks = context.risks || [];
  const plan = context.plan || {};

  const topProduct = results.length > 0 ? results[0] : null;

  if (!q) {
    return {
      answer: "Hello! I am your Enterprise SaaS Transformation Advisor. You can ask me questions regarding your SaaS evaluation rankings, migration risks, phasing roadmap, or executive business case.",
      suggestedQuestions: [
        "Why is the top product ranked #1?",
        "What are our most critical migration risks?",
        "How should we plan data migration for our legacy systems?",
        "What does our TOE readiness score indicate?"
      ],
      category: 'General'
    };
  }

  // Question routing based on semantic intent
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
    const criticalRisks = (risks || []).filter((r: any) => r.severity === 'Critical' || r.severity === 'High');
    let riskList = "";
    if (criticalRisks.length > 0) {
      riskList = criticalRisks.map((r: any) => `• **${r.riskTitle}** (Score: ${r.score}/25, ${r.severity})\n  *Mitigation*: ${r.mitigation}`).join('\n\n');
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

  if (q.includes('cost') || q.includes('budget') || q.includes('cfo') || q.includes('pitch')) {
    return {
      answer: `**Executive Summary for CFO & Leadership**:\n\n` +
        `• **Capital Allocation**: Current annual IT budget is $${(assessment.itBudget || 1500000).toLocaleString()} across ${assessment.employees || 1000} users.\n` +
        `• **Target TCO Benefits**: Shifting from monolithic on-premise infrastructure reduces server maintenance by up to 35% and improves deployment agility by 4x.\n` +
        `• **Recommendation**: Proceed with ${topProduct ? topProduct.productName : 'recommended SaaS solution'} on a phased 12-month timeline to maintain cost predictability and preserve business continuity.`,
      category: 'Business Case'
    };
  }

  return {
    answer: `Regarding "${question}": In the context of your transformation assessment for ${assessment.companyName || 'your organization'}, we recommend balancing speed of migration with zero-downtime cutover procedures. You can review specific evaluation breakdowns in the Recommendation tab or inspect migration phases in the Roadmap Planner.`,
    category: 'General Advisory'
  };
}

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    });
  }

  try {
    const { question, context = {} } = await req.json();

    // Check for OpenAI or Gemini API key stored in Supabase secrets
    // @ts-ignore: Deno global
    const openAiKey = Deno.env?.get('OPENAI_API_KEY');
    // @ts-ignore: Deno global
    const geminiKey = Deno.env?.get('GEMINI_API_KEY');

    if (openAiKey) {
      try {
        const sysPrompt = `You are the Enterprise SaaS Transformation AI Advisor for a cloud migration decision-support platform.
Context:
- Company: ${context.assessment?.companyName || 'Enterprise'}
- Infrastructure: ${context.assessment?.infrastructure || 'Hybrid'}
- Data Sensitivity: ${context.assessment?.dataSensitivity || 'High'}
- Top Product: ${context.results?.[0]?.productName || 'None evaluated'}
- Identified Risks: ${(context.risks || []).length} risks found.
Answer professionally, concisely, and cite mathematical fit scores and risk mitigations when relevant.`;

        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openAiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: sysPrompt },
              { role: 'user', content: question }
            ],
            temperature: 0.3
          })
        });

        if (res.ok) {
          const completion = await res.json();
          const answer = completion.choices?.[0]?.message?.content;
          if (answer) {
            return new Response(JSON.stringify({
              answer,
              category: 'AI Synthesis (LLM)',
              model: 'gpt-4o-mini'
            }), {
              headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
          }
        }
      } catch {
        // Fallback to deterministic advisor
      }
    } else if (geminiKey) {
      try {
        const prompt = `You are the Enterprise SaaS Transformation AI Advisor. Question: ${question}. Context: ${JSON.stringify(context)}`;
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        });

        if (res.ok) {
          const data = await res.json();
          const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (answer) {
            return new Response(JSON.stringify({
              answer,
              category: 'AI Synthesis (Gemini)',
              model: 'gemini-1.5-flash'
            }), {
              headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
          }
        }
      } catch {
        // Fallback to deterministic advisor
      }
    }

    // Deterministic intelligence fallback
    const result = answerQuestionDeterministic(question, context);
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}

