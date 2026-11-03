// ==============================================================================
// Supabase Edge Function: assistant-advisor
// Description: AI Transformation Advisor with LLM secret support and rule-based fallback
// Ported from: srv/lib/assistant.js
// ==============================================================================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
          `• **Cost Fit**: ${topProduct.costSubScore ?? topProduct.cost_sub_score}/100\n` +
          `• **Security**: ${topProduct.securitySubScore ?? topProduct.security_sub_score}/100\n` +
          `• **Scalability**: ${topProduct.scalabilitySubScore ?? topProduct.scalability_sub_score}/100\n` +
          `• **Integration**: ${topProduct.integrationSubScore ?? topProduct.integration_sub_score}/100\n` +
          `• **Features**: ${topProduct.featuresSubScore ?? topProduct.features_sub_score}/100\n\n` +
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
      riskList = criticalRisks.map((r: any) => `• **${r.riskTitle || r.risk_title}** (Score: ${r.score}/25, ${r.severity})\n  *Mitigation*: ${r.mitigation}`).join('\n\n');
    } else {
      riskList = "All evaluated risks currently reside within Moderate or Low severity bounds.";
    }

    return {
      answer: `Based on your enterprise parameters (Infrastructure: **${assessment.infrastructure || 'On-premise'}**, Data Sensitivity: **${assessment.dataSensitivity || assessment.data_sensitivity || 'High'}**), here is your risk profile:\n\n${riskList}\n\n**Guidance**: Focus pilot testing on data schema reconciliation and implement parallel dual-runs before decommissioning legacy systems.`,
      category: 'Risk Analysis'
    };
  }

  if (q.includes('plan') || q.includes('roadmap') || q.includes('phase') || q.includes('timeline') || q.includes('duration')) {
    const totalDuration = plan.estimatedDurationMonths || plan.estimated_duration_months || 12;
    const progress = plan.overallProgress !== undefined ? plan.overallProgress : (plan.overall_progress !== undefined ? plan.overall_progress : 32.5);
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

  if (q.includes('toe') || q.includes('readiness') || q.includes('framework')) {
    return {
      answer: `The platform evaluates transformation readiness across three **TOE (Technology-Organization-Environment)** pillars:\n\n` +
        `• **Technological Readiness (${assessment.toeTechScore ?? assessment.toe_tech_score ?? 78}/100)**: Cloud maturity, legacy application complexity, and data integration capability.\n` +
        `• **Organizational Readiness (${assessment.toeOrgScore ?? assessment.toe_org_score ?? 68}/100)**: Executive sponsorship, change management capacity, and digital workforce skills.\n` +
        `• **Environmental Readiness (${assessment.toeEnvScore ?? assessment.toe_env_score ?? 74}/100)**: Industry competitive pressure, regulatory compliance compliance rigor, and vendor SLA maturity.\n\n` +
        `Overall Composite Readiness Score: **${assessment.readinessScore ?? assessment.readiness_score ?? 72.5}/100** (Ready for phased migration).`,
      category: 'TOE Framework'
    };
  }

  return {
    answer: `Regarding "${question}":\n\nIn our evaluated portfolio for **${assessment.companyName || 'your enterprise'}**, the primary migration objective is balancing cloud modernization agility against business continuity risk. For critical enterprise functions, we recommend prioritizing modular SaaS adoption with active API mediation and automated fallback controls.`,
    category: 'Advisory Guidance'
  };
}

// @ts-ignore: Deno runtime
if (typeof Deno !== 'undefined' && Deno.serve) {
  // @ts-ignore: Deno runtime
  Deno.serve(async (req: Request) => {
    // 1. Immediate synchronous CORS OPTIONS preflight response
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    try {
      const { question, context = {} } = await req.json();

      // Check for OpenAI, Gemini, or generic LLM API key stored in Supabase secrets
      // @ts-ignore: Deno global
      const llmKey = Deno.env?.get('LLM_API_KEY') || Deno.env?.get('OPENAI_API_KEY') || Deno.env?.get('GEMINI_API_KEY');
      // @ts-ignore: Deno global
      const llmProvider = (Deno.env?.get('LLM_PROVIDER') || 'openai').toLowerCase();
      // @ts-ignore: Deno global
      const llmModel = Deno.env?.get('LLM_MODEL') || (llmProvider.includes('gemini') ? 'gemini-1.5-flash' : 'gpt-4o-mini');

      if (llmKey && llmProvider.includes('gemini')) {
        try {
          const prompt = `You are the Enterprise SaaS Transformation AI Advisor for a cloud migration decision-support platform. 
Question: ${question}
Context: ${JSON.stringify(context)}
Design rule: The deterministic scoring engine has already decided the ranking. You explain the results and offer advice; you never change the scores.`;

          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${llmModel}:generateContent?key=${llmKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
          });

          if (res.ok) {
            const data = await res.json();
            const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (answer) {
              return new Response(JSON.stringify({
                answer,
                category: 'AI Synthesis (Gemini)',
                model: llmModel
              }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              });
            }
          }
        } catch {
          // Fallback to deterministic advisor
        }
      } else if (llmKey) {
        try {
          const sysPrompt = `You are the Enterprise SaaS Transformation AI Advisor for a cloud migration decision-support platform.
Context:
- Company: ${context.assessment?.companyName || 'Enterprise'}
- Infrastructure: ${context.assessment?.infrastructure || 'Hybrid'}
- Data Sensitivity: ${context.assessment?.dataSensitivity || 'High'}
- Top Product: ${context.results?.[0]?.productName || 'None evaluated'}
- Identified Risks: ${(context.risks || []).length} risks found.
Design rule: The deterministic scoring engine decides the ranking; you explain results and provide strategic advice; you must never change scores.`;

          const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${llmKey}`
            },
            body: JSON.stringify({
              model: llmModel,
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
                model: llmModel
              }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
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
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  });
}

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  const { question, context = {} } = await req.json();
  const result = answerQuestionDeterministic(question, context);
  return new Response(JSON.stringify(result), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
