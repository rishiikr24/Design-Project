const express = require('express');
const path = require('path');
const cds = require('@sap/cds');

const { evaluateProducts, DEFAULT_WEIGHTS } = require('./srv/lib/scoring');
const { assessRisks } = require('./srv/lib/risk');
const { generateMigrationPlan, calculateOverallProgress } = require('./srv/lib/planner');
const { calculateReadiness } = require('./srv/lib/readiness');
const { answerQuestion } = require('./srv/lib/assistant');

const PORT = process.env.PORT || 4004;

async function bootstrap() {
  const app = express();
  app.use(express.json());

  // Load CDS model and connect to database
  const m = await cds.load(['db/schema.cds']);
  cds.model = m;
  const db = await cds.connect.to('db');

  const Companies = 'saas.transformation.Companies';
  const UserProfiles = 'saas.transformation.UserProfiles';
  const Assessments = 'saas.transformation.Assessments';
  const LegacyApplications = 'saas.transformation.LegacyApplications';
  const Requirements = 'saas.transformation.Requirements';
  const SaaSProducts = 'saas.transformation.SaaSProducts';
  const RiskTemplates = 'saas.transformation.RiskTemplates';
  const AssessedRisks = 'saas.transformation.AssessedRisks';
  const MigrationPlans = 'saas.transformation.MigrationPlans';
  const MigrationPhases = 'saas.transformation.MigrationPhases';
  const Evaluations = 'saas.transformation.Evaluations';
  const EvaluationResults = 'saas.transformation.EvaluationResults';
  const CriteriaWeights = 'saas.transformation.CriteriaWeights';
  const AssistantMessages = 'saas.transformation.AssistantMessages';

  // Serve static UI
  const webappDir = path.join(__dirname, 'app', 'saas-ui', 'webapp');
  app.use(express.static(webappDir));

  // REST API Endpoints for frontend and integration

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'UP', platform: 'SAP CAP / HANA Cloud / SQLite', version: '1.0.0' });
  });

  // Get Companies and current users
  app.get('/api/companies', async (req, res) => {
    try {
      const companies = await SELECT.from(Companies);
      const users = await SELECT.from(UserProfiles);
      res.json({ companies, users });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // SaaS Products Catalog (SC-1, SC-2, SC-3, SC-4)
  app.get('/api/products', async (req, res) => {
    try {
      const products = await SELECT.from(SaaSProducts);
      res.json(products);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/products', async (req, res) => {
    try {
      const product = req.body;
      if (!product.ID && product.name) {
        product.ID = product.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      }
      product.status = product.status || 'Active';
      await INSERT.into(SaaSProducts).entries(product);
      res.status(201).json(product);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/products/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const data = req.body;
      delete data.ID;
      await UPDATE(SaaSProducts).set(data).where({ ID: id });
      const updated = await SELECT.one.from(SaaSProducts).where({ ID: id });
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/products/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await UPDATE(SaaSProducts).set({ status: 'Retired' }).where({ ID: id });
      res.json({ success: true, message: `Product ${id} retired` });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Assessments (EA-1 to EA-7)
  app.get('/api/assessments', async (req, res) => {
    try {
      const companyId = req.query.companyId || 'comp-apex-global';
      const assessments = await SELECT.from(Assessments).where({ company_ID: companyId });
      for (const a of assessments) {
        a.legacyApplications = await SELECT.from(LegacyApplications).where({ assessment_ID: a.ID });
        a.requirements = await SELECT.from(Requirements).where({ assessment_ID: a.ID });
      }
      res.json(assessments);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/assessment/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const assessment = await SELECT.one.from(Assessments).where({ ID: id });
      if (!assessment) return res.status(404).json({ error: 'Assessment not found' });
      assessment.legacyApplications = await SELECT.from(LegacyApplications).where({ assessment_ID: id });
      assessment.requirements = await SELECT.from(Requirements).where({ assessment_ID: id });
      res.json(assessment);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/assessment', async (req, res) => {
    try {
      const data = req.body;
      const isNew = !data.ID;
      const assessmentId = data.ID || cds.utils.uuid();

      // Compute TOE readiness score (EA-5)
      const readiness = calculateReadiness({
        ...data,
        legacyAppsCount: (data.legacyApplications || []).length
      });

      const assessmentRecord = {
        ID: assessmentId,
        title: data.title || 'Enterprise SaaS Transformation Assessment',
        company_ID: data.company_ID || 'comp-apex-global',
        infrastructure: data.infrastructure || 'On-premise',
        growthRate: Number(data.growthRate) || 15.0,
        dataSensitivity: data.dataSensitivity || 'High',
        painPoints: data.painPoints || 'Data silos, high maintenance costs, integration bottlenecks.',
        targetCategory: data.targetCategory || 'All',
        readinessScore: readiness.readinessScore,
        toeTechScore: readiness.toeTechScore,
        toeOrgScore: readiness.toeOrgScore,
        toeEnvScore: readiness.toeEnvScore,
        status: data.status || 'Completed'
      };

      if (isNew) {
        await INSERT.into(Assessments).entries(assessmentRecord);
      } else {
        await UPDATE(Assessments).set(assessmentRecord).where({ ID: assessmentId });
      }

      // Sync legacy applications
      if (Array.isArray(data.legacyApplications)) {
        await DELETE.from(LegacyApplications).where({ assessment_ID: assessmentId });
        const legacyEntries = data.legacyApplications.map(app => ({
          ID: app.ID || cds.utils.uuid(),
          assessment_ID: assessmentId,
          name: app.name,
          function: app.function,
          hosting: app.hosting || 'On-premise Server',
          criticality: app.criticality || 'High',
          userCount: Number(app.userCount) || 100,
          yearsInUse: Number(app.yearsInUse) || 5
        }));
        if (legacyEntries.length > 0) {
          await INSERT.into(LegacyApplications).entries(legacyEntries);
        }
        assessmentRecord.legacyApplications = legacyEntries;
      }

      // Sync requirements
      if (Array.isArray(data.requirements)) {
        await DELETE.from(Requirements).where({ assessment_ID: assessmentId });
        const reqEntries = data.requirements.map(r => ({
          ID: r.ID || cds.utils.uuid(),
          assessment_ID: assessmentId,
          category: r.category || 'General',
          description: r.description,
          priority: r.priority || 'Must Have'
        }));
        if (reqEntries.length > 0) {
          await INSERT.into(Requirements).entries(reqEntries);
        }
        assessmentRecord.requirements = reqEntries;
      }

      assessmentRecord.readinessDetails = readiness;
      res.status(isNew ? 201 : 200).json(assessmentRecord);
    } catch (err) {
      console.error('Error saving assessment:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // Recommendation Engine Evaluate (RE-1 to RE-7)
  app.post('/api/evaluate', async (req, res) => {
    try {
      const { assessmentId, weights } = req.body;
      const effectiveWeights = weights || DEFAULT_WEIGHTS;

      let assessment = {};
      if (assessmentId) {
        assessment = await SELECT.one.from(Assessments).where({ ID: assessmentId }) || {};
        const legacyApps = await SELECT.from(LegacyApplications).where({ assessment_ID: assessmentId });
        assessment.legacyAppsCount = legacyApps ? legacyApps.length : 0;
      }

      const products = await SELECT.from(SaaSProducts).where({ status: 'Active' });
      const scoredResults = evaluateProducts(products, effectiveWeights, assessment);

      // Persist in DB
      if (assessmentId) {
        const evaluationId = cds.utils.uuid();
        await INSERT.into(Evaluations).entries({
          ID: evaluationId,
          assessment_ID: assessmentId,
          evaluationDate: new Date().toISOString(),
          status: 'Completed'
        });

        await INSERT.into(CriteriaWeights).entries({
          ID: cds.utils.uuid(),
          evaluation_ID: evaluationId,
          costWeight: effectiveWeights.cost,
          securityWeight: effectiveWeights.security,
          scalabilityWeight: effectiveWeights.scalability,
          integrationWeight: effectiveWeights.integration,
          featuresWeight: effectiveWeights.features
        });

        const resultsEntries = scoredResults.map(r => ({
          ID: cds.utils.uuid(),
          evaluation_ID: evaluationId,
          product_ID: r.productId,
          totalScore: r.totalScore,
          costSubScore: r.costSubScore,
          securitySubScore: r.securitySubScore,
          scalabilitySubScore: r.scalabilitySubScore,
          integrationSubScore: r.integrationSubScore,
          featuresSubScore: r.featuresSubScore,
          rank: r.rank,
          reason: r.reason
        }));

        await INSERT.into(EvaluationResults).entries(resultsEntries);
      }

      res.json({
        weights: effectiveWeights,
        results: scoredResults
      });
    } catch (err) {
      console.error('Evaluation error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // Risk Assessment (RA-1 to RA-5)
  app.post('/api/risks', async (req, res) => {
    try {
      const { assessmentId } = req.body;
      let assessment = {};
      if (assessmentId) {
        assessment = await SELECT.one.from(Assessments).where({ ID: assessmentId }) || {};
        const legacyApps = await SELECT.from(LegacyApplications).where({ assessment_ID: assessmentId });
        assessment.legacyAppsCount = legacyApps ? legacyApps.length : 0;
      }

      const templates = await SELECT.from(RiskTemplates);
      const evaluated = assessRisks(templates, assessment);

      // Persist
      if (assessmentId) {
        await DELETE.from(AssessedRisks).where({ assessment_ID: assessmentId });
        const entries = evaluated.risks.map(r => ({
          ID: cds.utils.uuid(),
          assessment_ID: assessmentId,
          template_ID: r.templateId,
          riskTitle: r.riskTitle,
          category: r.category,
          probability: r.probability,
          impact: r.impact,
          score: r.score,
          severity: r.severity,
          mitigation: r.mitigation,
          adjustedReason: r.adjustedReason
        }));
        if (entries.length > 0) {
          await INSERT.into(AssessedRisks).entries(entries);
        }
      }

      res.json(evaluated);
    } catch (err) {
      console.error('Risk assessment error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // Migration Planner (MP-1 to MP-5)
  app.post('/api/plan', async (req, res) => {
    try {
      const { assessmentId, productId } = req.body;
      let assessment = {};
      let product = null;
      let risks = [];

      if (assessmentId) {
        assessment = await SELECT.one.from(Assessments).where({ ID: assessmentId }) || {};
        risks = await SELECT.from(AssessedRisks).where({ assessment_ID: assessmentId });
      }

      const selectedId = productId || 'sap-cloud-erp';
      product = await SELECT.one.from(SaaSProducts).where({ ID: selectedId });
      if (!product) {
        product = {
          ID: selectedId,
          name: 'SAP S/4HANA Cloud',
          migrationComplexity: 'High'
        };
      }

      const planData = generateMigrationPlan(assessment, product, risks);

      if (assessmentId) {
        // Clear prior plans for assessment
        const existingPlans = await SELECT.from(MigrationPlans).where({ assessment_ID: assessmentId });
        for (const ep of existingPlans) {
          await DELETE.from(MigrationPhases).where({ plan_ID: ep.ID });
        }
        await DELETE.from(MigrationPlans).where({ assessment_ID: assessmentId });

        const planId = cds.utils.uuid();
        await INSERT.into(MigrationPlans).entries({
          ID: planId,
          assessment_ID: assessmentId,
          selectedProduct_ID: product.ID,
          title: planData.title,
          totalPhases: planData.totalPhases,
          overallProgress: planData.overallProgress,
          startDate: planData.startDate,
          targetEndDate: planData.targetEndDate,
          estimatedDurationMonths: planData.estimatedDurationMonths
        });

        const phaseEntries = planData.phases.map(p => ({
          ID: cds.utils.uuid(),
          plan_ID: planId,
          sequence: p.sequence,
          name: p.name,
          status: p.status,
          progress: p.progress,
          startDate: p.startDate,
          endDate: p.endDate,
          deliverables: p.deliverables,
          notes: p.notes,
          riskMitigationFocus: p.riskMitigationFocus
        }));

        await INSERT.into(MigrationPhases).entries(phaseEntries);
        planData.phases = phaseEntries;
        planData.planId = planId;
      }

      res.json(planData);
    } catch (err) {
      console.error('Plan generation error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.patch('/api/phase/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { status, progress } = req.body;
      await UPDATE(MigrationPhases).set({ status, progress }).where({ ID: id });
      const phase = await SELECT.one.from(MigrationPhases).where({ ID: id });

      let overallProgress = progress;
      if (phase && phase.plan_ID) {
        const phases = await SELECT.from(MigrationPhases).where({ plan_ID: phase.plan_ID });
        overallProgress = calculateOverallProgress(phases);
        await UPDATE(MigrationPlans).set({ overallProgress }).where({ ID: phase.plan_ID });
      }

      res.json({ phase, overallProgress });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Consolidated Dashboard Metrics (TD-1 to TD-5)
  app.get('/api/dashboard/:assessmentId', async (req, res) => {
    try {
      const { assessmentId } = req.params;
      const assessment = await SELECT.one.from(Assessments).where({ ID: assessmentId });
      const legacyApps = await SELECT.from(LegacyApplications).where({ assessment_ID: assessmentId });
      const risks = await SELECT.from(AssessedRisks).where({ assessment_ID: assessmentId });
      const plan = await SELECT.one.from(MigrationPlans).where({ assessment_ID: assessmentId });
      let phases = [];
      if (plan) {
        phases = await SELECT.from(MigrationPhases).where({ plan_ID: plan.ID });
      }

      const products = await SELECT.from(SaaSProducts).where({ status: 'Active' });
      const evaluationResults = evaluateProducts(products, DEFAULT_WEIGHTS, assessment || {});

      let overallRiskLevel = 'Low';
      if (risks && risks.length > 0) {
        if (risks.some(r => r.severity === 'Critical')) overallRiskLevel = 'High';
        else if (risks.some(r => r.severity === 'High')) overallRiskLevel = 'Medium';
      }

      res.json({
        assessment: assessment || {
          title: 'Reference Enterprise Assessment',
          readinessScore: 78.5,
          toeTechScore: 72.0,
          toeOrgScore: 80.0,
          toeEnvScore: 85.0
        },
        legacyCount: legacyApps ? legacyApps.length : 3,
        overallRiskLevel,
        risks: risks || [],
        plan: plan || {
          overallProgress: 32.5,
          totalPhases: 8,
          phases
        },
        phases,
        recommendations: evaluationResults,
        postGoLive: {
          adoptionRate: 88.4,
          costEfficiency: 24.6,
          licenseUtilization: 92.1
        }
      });
    } catch (err) {
      console.error('Dashboard error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // AI Transformation Assistant (AI-1 to AI-3)
  app.post('/api/assistant', async (req, res) => {
    try {
      const { question, assessmentId } = req.body;
      let assessment = {};
      let risks = [];
      let plan = {};
      let results = [];

      if (assessmentId) {
        assessment = await SELECT.one.from(Assessments).where({ ID: assessmentId }) || {};
        risks = await SELECT.from(AssessedRisks).where({ assessment_ID: assessmentId });
        plan = await SELECT.one.from(MigrationPlans).where({ assessment_ID: assessmentId }) || {};
      }

      const products = await SELECT.from(SaaSProducts).where({ status: 'Active' });
      results = evaluateProducts(products, DEFAULT_WEIGHTS, assessment);

      const response = answerQuestion(question, { assessment, risks, plan, results });

      if (assessmentId) {
        await INSERT.into(AssistantMessages).entries([
          {
            ID: cds.utils.uuid(),
            assessment_ID: assessmentId,
            sender: 'user',
            messageText: question,
            timestamp: new Date().toISOString()
          },
          {
            ID: cds.utils.uuid(),
            assessment_ID: assessmentId,
            sender: 'assistant',
            messageText: response.answer,
            timestamp: new Date().toISOString()
          }
        ]);
      }

      res.json(response);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Seed Reference Case (PRD Section 8)
  app.post('/api/demo/seed-reference-case', async (req, res) => {
    try {
      const refId = 'assessment-ref-case';
      await DELETE.from(LegacyApplications).where({ assessment_ID: refId });
      await DELETE.from(Requirements).where({ assessment_ID: refId });
      await DELETE.from(AssessedRisks).where({ assessment_ID: refId });
      await DELETE.from(MigrationPlans).where({ assessment_ID: refId });
      await DELETE.from(Assessments).where({ ID: refId });

      const readiness = calculateReadiness({
        employees: 1000,
        itBudget: 1500000,
        growthRate: 18.0,
        dataSensitivity: 'High',
        infrastructure: 'On-premise',
        legacyAppsCount: 4
      });

      const assessmentRecord = {
        ID: refId,
        title: 'Apex Global - Core Systems Cloud Modernization',
        company_ID: 'comp-apex-global',
        infrastructure: 'On-premise',
        growthRate: 18.0,
        dataSensitivity: 'High',
        painPoints: 'Monolithic legacy ERP maintenance costs, customer data siloed in legacy CRM, slow reporting cycles, integration fragility.',
        targetCategory: 'All',
        readinessScore: readiness.readinessScore,
        toeTechScore: readiness.toeTechScore,
        toeOrgScore: readiness.toeOrgScore,
        toeEnvScore: readiness.toeEnvScore,
        status: 'Completed'
      };

      await INSERT.into(Assessments).entries(assessmentRecord);

      const legacyApps = [
        {
          ID: cds.utils.uuid(),
          assessment_ID: refId,
          name: 'Legacy Custom CRM v4.2',
          function: 'Customer pipeline and service ticketing',
          hosting: 'On-premise Windows Server 2012',
          criticality: 'High',
          userCount: 350,
          yearsInUse: 9
        },
        {
          ID: cds.utils.uuid(),
          assessment_ID: refId,
          name: 'On-Premise ERP (AS/400 Core)',
          function: 'General ledger, supply chain & order management',
          hosting: 'On-premise AS/400 Server Rack',
          criticality: 'Critical',
          userCount: 800,
          yearsInUse: 14
        },
        {
          ID: cds.utils.uuid(),
          assessment_ID: refId,
          name: 'Custom HR Access DB',
          function: 'Employee directory & attendance',
          hosting: 'Local Network File Share',
          criticality: 'Medium',
          userCount: 150,
          yearsInUse: 7
        },
        {
          ID: cds.utils.uuid(),
          assessment_ID: refId,
          name: 'SQL Server Reporting Database',
          function: 'Nightly batch financial reporting',
          hosting: 'On-premise SQL Server 2014',
          criticality: 'High',
          userCount: 120,
          yearsInUse: 8
        }
      ];

      await INSERT.into(LegacyApplications).entries(legacyApps);

      const requirements = [
        { ID: cds.utils.uuid(), assessment_ID: refId, category: 'Security', description: 'Mandatory SOC2 Type II and FedRAMP compliance for customer records', priority: 'Must Have' },
        { ID: cds.utils.uuid(), assessment_ID: refId, category: 'Scalability', description: 'Support 1,000+ concurrent enterprise users with 18% annual growth elasticity', priority: 'Must Have' },
        { ID: cds.utils.uuid(), assessment_ID: refId, category: 'Integration', description: 'Direct REST/OData APIs to link with SAP BTP and corporate data warehouse', priority: 'Must Have' },
        { ID: cds.utils.uuid(), assessment_ID: refId, category: 'Cost', description: 'Predictable user-tier licensing under $1.5M annual IT budget', priority: 'Nice to Have' }
      ];

      await INSERT.into(Requirements).entries(requirements);

      // Run initial evaluation
      const products = await SELECT.from(SaaSProducts).where({ status: 'Active' });
      const scoredResults = evaluateProducts(products, DEFAULT_WEIGHTS, assessmentRecord);

      // Run risk assessment
      const templates = await SELECT.from(RiskTemplates);
      const riskResults = assessRisks(templates, { ...assessmentRecord, legacyAppsCount: 4 });

      const riskEntries = riskResults.risks.map(r => ({
        ID: cds.utils.uuid(),
        assessment_ID: refId,
        template_ID: r.templateId,
        riskTitle: r.riskTitle,
        category: r.category,
        probability: r.probability,
        impact: r.impact,
        score: r.score,
        severity: r.severity,
        mitigation: r.mitigation,
        adjustedReason: r.adjustedReason
      }));
      await INSERT.into(AssessedRisks).entries(riskEntries);

      // Generate migration plan for top product (SAP S/4HANA Cloud or Salesforce)
      let topProduct = null;
      if (scoredResults && scoredResults[0] && scoredResults[0].productId) {
        topProduct = await SELECT.one.from(SaaSProducts).where({ ID: scoredResults[0].productId });
      }
      if (!topProduct) {
        topProduct = { ID: 'sap-cloud-erp', name: 'SAP S/4HANA Cloud', migrationComplexity: 'High' };
      }

      const planData = generateMigrationPlan(assessmentRecord, topProduct, riskResults.risks);
      const planId = cds.utils.uuid();
      await INSERT.into(MigrationPlans).entries({
        ID: planId,
        assessment_ID: refId,
        selectedProduct_ID: topProduct.ID,
        title: planData.title,
        totalPhases: 8,
        overallProgress: planData.overallProgress,
        startDate: planData.startDate,
        targetEndDate: planData.targetEndDate,
        estimatedDurationMonths: 12
      });

      const phaseEntries = planData.phases.map(p => ({
        ID: cds.utils.uuid(),
        plan_ID: planId,
        sequence: p.sequence,
        name: p.name,
        status: p.status,
        progress: p.progress,
        startDate: p.startDate,
        endDate: p.endDate,
        deliverables: p.deliverables,
        notes: p.notes,
        riskMitigationFocus: p.riskMitigationFocus
      }));
      await INSERT.into(MigrationPhases).entries(phaseEntries);

      res.json({
        success: true,
        message: 'Reference case successfully initialized with legacy apps, evaluation, risks, and 8-phase roadmap!',
        assessmentId: refId
      });
    } catch (err) {
      console.error('Seed reference error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  const server = app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`SAP Enterprise SaaS Transformation Platform is running!`);
    console.log(`URL: http://localhost:${PORT}`);
    console.log(`OData V4 and REST services active.`);
    console.log(`=======================================================`);
  });

  return server;
}

if (require.main === module) {
  bootstrap().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

module.exports = { bootstrap };
