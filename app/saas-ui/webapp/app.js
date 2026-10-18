/**
 * SAP Enterprise SaaS Transformation Platform
 * Frontend Application Controller & State Engine
 */

class SaaSPlatformApp {
  constructor() {
    this.state = {
      role: 'Admin',
      companyId: 'comp-apex-global',
      assessmentId: 'assessment-ref-case',
      activeTab: 'dashboard',
      wizardStep: 1,
      products: [],
      evaluations: [],
      risks: [],
      plan: null,
      assessment: null,
      legacyApps: [],
      weights: { cost: 20, security: 30, scalability: 25, integration: 15, features: 10 },
      simWeights: { cost: 20, security: 30, scalability: 25, integration: 15, features: 10 },
      aiEnabled: true,
      compareSelection: ['sap-cloud-erp', 'salesforce-crm', 'ms-dynamics-365']
    };

    this.init();
  }

  async init() {
    this.bindEvents();
    this.applyTheme();
    // Load initial reference case or active assessment data
    await this.loadInitialData();
  }

  // ==========================================
  // Event Binding
  // ==========================================
  bindEvents() {
    // Tab Navigation
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.getAttribute('data-tab');
        this.navigateToTab(targetTab);
      });
    });

    // Theme Toggle
    document.getElementById('btn-theme-toggle').addEventListener('click', () => this.toggleTheme());

    // Role Switcher
    document.getElementById('role-select').addEventListener('change', (e) => this.setRole(e.target.value));

    // Tenant Switcher
    document.getElementById('tenant-select').addEventListener('change', (e) => {
      this.state.companyId = e.target.value;
      this.showToast(`Switched active organization to ${e.target.selectedOptions[0].text}`, 'info');
      this.loadDashboardData();
    });

    // 1-Click Reference Case
    document.getElementById('btn-load-ref-case').addEventListener('click', () => this.loadReferenceCase());
    document.getElementById('btn-prefill-ref').addEventListener('click', () => this.loadReferenceCase());

    // Dashboard Actions
    document.getElementById('btn-refresh-dashboard').addEventListener('click', () => this.loadDashboardData());
    document.getElementById('btn-export-report').addEventListener('click', () => this.openReportModal());

    // Wizard Navigation
    document.getElementById('btn-wizard-next').addEventListener('click', () => this.navigateWizard(1));
    document.getElementById('btn-wizard-prev').addEventListener('click', () => this.navigateWizard(-1));
    document.getElementById('btn-wizard-submit').addEventListener('click', () => this.submitAssessment());
    document.getElementById('btn-save-draft').addEventListener('click', () => this.saveAssessmentDraft());
    document.querySelectorAll('.wizard-step').forEach(stepEl => {
      stepEl.addEventListener('click', () => {
        const step = parseInt(stepEl.getAttribute('data-step'), 10);
        this.setWizardStep(step);
      });
    });

    // Legacy Apps Inventory
    document.getElementById('btn-add-legacy-app').addEventListener('click', () => this.promptAddLegacyApp());

    // Weight Sliders in Wizard
    ['cost', 'security', 'scalability', 'integration', 'features'].forEach(c => {
      const slider = document.getElementById(`weight-${c}`);
      if (slider) {
        slider.addEventListener('input', (e) => {
          this.state.weights[c] = parseInt(e.target.value, 10);
          document.getElementById(`val-weight-${c}`).textContent = `${e.target.value}%`;
          this.updateWeightsMeter();
        });
      }
    });
    document.getElementById('btn-reset-weights').addEventListener('click', () => this.resetWeights());

    // Catalog Search and Filter
    document.getElementById('catalog-search').addEventListener('input', (e) => this.filterCatalog(e.target.value));
    document.querySelectorAll('#catalog-category-filters .filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('#catalog-category-filters .filter-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.filterCatalogByCategory(pill.getAttribute('data-category'));
      });
    });
    document.getElementById('btn-admin-add-product').addEventListener('click', () => this.openAdminAddProductModal());

    // Simulation Sliders
    ['cost', 'sec', 'scale', 'int', 'feat'].forEach(key => {
      const slider = document.getElementById(`sim-${key}`);
      if (slider) {
        slider.addEventListener('input', (e) => {
          const map = { cost: 'cost', sec: 'security', scale: 'scalability', int: 'integration', feat: 'features' };
          const crit = map[key];
          this.state.simWeights[crit] = parseInt(e.target.value, 10);
          document.getElementById(`sim-val-${crit}`).textContent = `${e.target.value}%`;
        });
      }
    });
    document.getElementById('btn-recalc-sim').addEventListener('click', () => this.runSimulationEvaluation());
    document.getElementById('btn-run-evaluation').addEventListener('click', () => this.runStandardEvaluation());

    // Comparison Selectors
    ['1', '2', '3'].forEach(num => {
      const sel = document.getElementById(`compare-sel-${num}`);
      if (sel) {
        sel.addEventListener('change', () => this.handleComparisonSelectionChange());
      }
    });

    // Risk Actions
    document.getElementById('btn-reassess-risks').addEventListener('click', () => this.reassessRisks());

    // Planner Actions
    document.getElementById('btn-regenerate-plan').addEventListener('click', () => this.regeneratePlan());

    // AI Assistant
    document.getElementById('btn-chat-send').addEventListener('click', () => this.sendChatMessage());
    document.getElementById('chat-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.sendChatMessage();
    });
    document.querySelectorAll('.prompt-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const prompt = chip.getAttribute('data-prompt');
        document.getElementById('chat-input').value = prompt;
        this.sendChatMessage();
      });
    });
    document.getElementById('ai-active-toggle').addEventListener('change', (e) => {
      this.state.aiEnabled = e.target.checked;
      this.showToast(this.state.aiEnabled ? 'AI Advisor activated' : 'AI Advisor paused', 'info');
    });

    // Modals
    document.getElementById('btn-close-prod-modal').addEventListener('click', () => this.closeModals());
    document.getElementById('btn-modal-close-action').addEventListener('click', () => this.closeModals());
    document.getElementById('btn-close-admin-modal').addEventListener('click', () => this.closeModals());
    document.getElementById('btn-admin-cancel').addEventListener('click', () => this.closeModals());
    document.getElementById('btn-close-report-modal').addEventListener('click', () => this.closeModals());
    document.getElementById('btn-report-close').addEventListener('click', () => this.closeModals());
    document.getElementById('btn-report-print').addEventListener('click', () => window.print());

    document.getElementById('admin-product-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveAdminProduct();
    });
  }

  // ==========================================
  // Initial Data & Loading
  // ==========================================
  async loadInitialData() {
    try {
      await this.loadCatalogProducts();
      await this.loadDashboardData();
    } catch (err) {
      console.warn('Initial data load warning:', err);
    }
  }

  async loadReferenceCase() {
    this.showToast('Initializing Representative Reference Case...', 'info');
    try {
      const res = await fetch('/api/demo/seed-reference-case', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        this.state.assessmentId = data.assessmentId;
        this.showToast('Reference Case Loaded (1,000 users, on-prem ERP, High Security)', 'success');
        await this.loadCatalogProducts();
        await this.loadDashboardData();
        this.populateWizardWithAssessment();
      } else {
        this.showToast('Failed to load reference case', 'danger');
      }
    } catch (err) {
      this.showToast('Error seeding reference case: ' + err.message, 'danger');
    }
  }

  async loadDashboardData() {
    try {
      const res = await fetch(`/api/dashboard/${this.state.assessmentId}`);
      const data = await res.json();
      
      this.state.assessment = data.assessment;
      this.state.evaluations = data.recommendations || [];
      this.state.risks = data.risks || [];
      this.state.plan = data.plan;

      this.renderDashboard(data);
      this.renderRecommendations(this.state.evaluations);
      this.renderRisks(this.state.risks);
      this.renderPlan(this.state.plan, data.phases || []);
      this.populateComparisonSelectors();
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    }
  }

  async loadCatalogProducts() {
    try {
      const res = await fetch('/api/products');
      const products = await res.json();
      this.state.products = products;
      this.renderCatalog(products);
      this.populateComparisonSelectors();
    } catch (err) {
      console.error('Failed to load catalog products:', err);
    }
  }

  // ==========================================
  // Render Dashboard (Module 7: TD-1 to TD-5)
  // ==========================================
  renderDashboard(data) {
    const a = data.assessment || {};
    const readiness = Number(a.readinessScore) || 77.5;
    const progress = data.plan ? Number(data.plan.overallProgress) || 32.5 : 32.5;

    // KPI Tiles
    document.getElementById('dash-readiness-score').textContent = readiness.toFixed(1);
    document.getElementById('dash-readiness-bar').style.width = `${readiness}%`;
    document.getElementById('dash-toe-tech').textContent = Number(a.toeTechScore || 67.0).toFixed(1);
    document.getElementById('dash-toe-org').textContent = Number(a.toeOrgScore || 85.0).toFixed(1);
    document.getElementById('dash-toe-env').textContent = Number(a.toeEnvScore || 87.0).toFixed(1);

    const levelBadge = document.getElementById('dash-readiness-level');
    if (readiness >= 75) {
      levelBadge.textContent = 'High Readiness';
      levelBadge.className = 'kpi-pill success';
    } else if (readiness >= 60) {
      levelBadge.textContent = 'Moderate Readiness';
      levelBadge.className = 'kpi-pill warning';
    } else {
      levelBadge.textContent = 'Preliminary Readiness';
      levelBadge.className = 'kpi-pill danger';
    }

    // Risk Tile
    const riskLevel = data.overallRiskLevel || 'High';
    const riskBadge = document.getElementById('dash-risk-level');
    riskBadge.textContent = `${riskLevel} Risk`;
    riskBadge.className = `kpi-pill ${riskLevel === 'High' ? 'warning' : 'success'}`;
    document.getElementById('nav-risk-badge').textContent = `${riskLevel} Risk`;

    const critCount = (data.risks || []).filter(r => r.severity === 'Critical').length;
    const highCount = (data.risks || []).filter(r => r.severity === 'High').length;
    const medCount = (data.risks || []).filter(r => r.severity === 'Medium').length;
    document.getElementById('dash-risk-count').textContent = (data.risks || []).length || 5;
    document.getElementById('dash-risk-crit').textContent = critCount;
    document.getElementById('dash-risk-high').textContent = highCount;
    document.getElementById('dash-risk-med').textContent = medCount;

    // Legacy Count
    document.getElementById('dash-legacy-count').textContent = data.legacyCount || 4;

    // Roadmap Tile
    document.getElementById('dash-progress-val').textContent = progress.toFixed(1);
    document.getElementById('dash-progress-bar').style.width = `${progress}%`;

    // Spotlight Top Recommendation
    const recs = data.recommendations || [];
    if (recs.length > 0) {
      const top = recs[0];
      document.getElementById('dash-top-score').innerHTML = `${top.totalScore.toFixed(1)}<small>/100</small>`;
      document.getElementById('dash-top-name').textContent = top.productName;
      document.getElementById('dash-top-vendor').textContent = `${top.vendor} • ${top.category}`;
      document.getElementById('dash-top-reason').textContent = top.reason;

      document.getElementById('dash-score-sec').textContent = top.securitySubScore.toFixed(1);
      document.getElementById('dash-score-scale').textContent = top.scalabilitySubScore.toFixed(1);
      document.getElementById('dash-score-int').textContent = top.integrationSubScore.toFixed(1);
      document.getElementById('dash-score-cost').textContent = top.costSubScore.toFixed(1);
      document.getElementById('dash-score-feat').textContent = top.featuresSubScore.toFixed(1);
    }

    // Risk Distribution List
    const distContainer = document.getElementById('dash-risk-distribution-list');
    if (distContainer) {
      distContainer.innerHTML = (data.risks || []).slice(0, 4).map(r => `
        <div class="subscore-item">
          <div class="subscore-label-row">
            <span><strong>${r.riskTitle}</strong> (${r.category})</span>
            <span class="risk-score-badge ${r.severity}">${r.severity} (${r.score}/25)</span>
          </div>
          <div class="progress-bar-bg small">
            <div class="progress-bar-fill ${r.severity === 'Critical' ? 'fill-amber' : 'fill-blue'}" style="width: ${(r.score / 25) * 100}%;"></div>
          </div>
        </div>
      `).join('');
    }
  }

  // ==========================================
  // Wizard (Module 2: EA-1 to EA-7)
  // ==========================================
  setWizardStep(step) {
    if (step < 1 || step > 5) return;
    this.state.wizardStep = step;

    document.querySelectorAll('.wizard-step').forEach(el => {
      const s = parseInt(el.getAttribute('data-step'), 10);
      el.classList.toggle('active', s <= step);
    });

    document.querySelectorAll('.wizard-pane').forEach((pane, idx) => {
      pane.classList.toggle('active', idx + 1 === step);
    });

    document.getElementById('btn-wizard-prev').disabled = (step === 1);
    if (step === 5) {
      document.getElementById('btn-wizard-next').style.display = 'none';
      document.getElementById('btn-wizard-submit').style.display = 'inline-flex';
      this.updateStep5Review();
    } else {
      document.getElementById('btn-wizard-next').style.display = 'inline-flex';
      document.getElementById('btn-wizard-submit').style.display = 'none';
    }
  }

  navigateWizard(delta) {
    const nextStep = this.state.wizardStep + delta;
    if (delta > 0 && !this.validateWizardStep(this.state.wizardStep)) return;
    this.setWizardStep(nextStep);
  }

  validateWizardStep(step) {
    if (step === 1) {
      const name = document.getElementById('inp-company-name').value.trim();
      const emp = parseInt(document.getElementById('inp-employees').value, 10);
      const budget = parseFloat(document.getElementById('inp-it-budget').value);
      if (!name) {
        this.showToast('Please enter company name', 'warning');
        return false;
      }
      if (!emp || emp <= 0) {
        this.showToast('Please specify valid employee count', 'warning');
        return false;
      }
      if (!budget || budget <= 0) {
        this.showToast('Please specify valid annual IT budget', 'warning');
        return false;
      }
    } else if (step === 4) {
      const sum = Object.values(this.state.weights).reduce((a, b) => a + b, 0);
      if (sum !== 100) {
        this.showToast(`Criteria weights must sum to 100% (Current: ${sum}%)`, 'warning');
        return false;
      }
    }
    return true;
  }

  updateWeightsMeter() {
    const w = this.state.weights;
    const sum = w.cost + w.security + w.scalability + w.integration + w.features;
    const badge = document.getElementById('weights-sum-badge');
    badge.textContent = `${sum}%`;
    badge.className = `weights-sum-badge ${sum === 100 ? 'valid' : 'invalid'}`;

    const bar = document.getElementById('weights-stacked-bar');
    bar.innerHTML = `
      <div class="weight-segment fill-amber" style="width: ${w.cost}%;">Cost ${w.cost}%</div>
      <div class="weight-segment fill-blue" style="width: ${w.security}%;">Sec ${w.security}%</div>
      <div class="weight-segment fill-cyan" style="width: ${w.scalability}%;">Scale ${w.scalability}%</div>
      <div class="weight-segment fill-green" style="width: ${w.integration}%;">Int ${w.integration}%</div>
      <div class="weight-segment fill-purple" style="width: ${w.features}%;">Feat ${w.features}%</div>
    `;
  }

  resetWeights() {
    this.state.weights = { cost: 20, security: 30, scalability: 25, integration: 15, features: 10 };
    ['cost', 'security', 'scalability', 'integration', 'features'].forEach(c => {
      document.getElementById(`weight-${c}`).value = this.state.weights[c];
      document.getElementById(`val-weight-${c}`).textContent = `${this.state.weights[c]}%`;
    });
    this.updateWeightsMeter();
    this.showToast('Weights reset to PRD standard default (20/30/25/15/10)', 'info');
  }

  populateWizardWithAssessment() {
    const a = this.state.assessment;
    if (!a) return;

    if (a.company) document.getElementById('inp-company-name').value = a.company.name || 'Apex Global Enterprises';
    document.getElementById('inp-infrastructure').value = a.infrastructure || 'On-premise';
    document.getElementById('inp-growth-rate').value = a.growthRate || 18;
    document.getElementById('inp-data-sensitivity').value = a.dataSensitivity || 'High';
    document.getElementById('inp-target-category').value = a.targetCategory || 'All';
    document.getElementById('inp-pain-points').value = a.painPoints || '';

    this.state.legacyApps = a.legacyApplications || [
      { name: 'Legacy Custom CRM v4.2', function: 'Sales pipeline & service tickets', hosting: 'On-premise WinServer 2012', criticality: 'High', userCount: 350, yearsInUse: 9 },
      { name: 'On-Premise ERP (AS/400)', function: 'General ledger & supply chain', hosting: 'On-premise AS/400 Rack', criticality: 'Critical', userCount: 800, yearsInUse: 14 },
      { name: 'Custom HR Access DB', function: 'Directory & attendance', hosting: 'Local Share', criticality: 'Medium', userCount: 150, yearsInUse: 7 },
      { name: 'SQL Server Reporting DB', function: 'Nightly batch financial reports', hosting: 'On-premise SQL 2014', criticality: 'High', userCount: 120, yearsInUse: 8 }
    ];
    this.renderLegacyAppsTable();
  }

  renderLegacyAppsTable() {
    const tbody = document.getElementById('legacy-apps-tbody');
    if (!tbody) return;

    tbody.innerHTML = this.state.legacyApps.map((app, idx) => `
      <tr>
        <td><strong>${app.name}</strong></td>
        <td>${app.function}</td>
        <td><span class="tag">${app.hosting}</span></td>
        <td><span class="kpi-pill ${app.criticality === 'Critical' ? 'danger' : (app.criticality === 'High' ? 'warning' : 'info')}">${app.criticality}</span></td>
        <td>${app.userCount} users</td>
        <td>${app.yearsInUse} yrs</td>
        <td>
          <button class="btn btn-sm btn-outline" onclick="app.removeLegacyApp(${idx})">Remove</button>
        </td>
      </tr>
    `).join('');
  }

  promptAddLegacyApp() {
    const name = prompt('Legacy System Name (e.g., Inventory Monolith v2):');
    if (!name) return;
    const fn = prompt('Business Function:', 'Inventory & Warehousing') || 'Core Business Operation';
    const crit = prompt('Criticality (Critical, High, Medium, Low):', 'High') || 'High';
    const users = parseInt(prompt('Active Users Count:', '200') || '200', 10);

    this.state.legacyApps.push({
      name,
      function: fn,
      hosting: 'On-premise Datacenter',
      criticality: crit,
      userCount: users,
      yearsInUse: 6
    });

    this.renderLegacyAppsTable();
    this.showToast(`Added ${name} to legacy inventory`, 'success');
  }

  removeLegacyApp(idx) {
    const removed = this.state.legacyApps.splice(idx, 1);
    this.renderLegacyAppsTable();
    this.showToast(`Removed legacy system ${removed[0] ? removed[0].name : ''}`, 'info');
  }

  updateStep5Review() {
    const emp = parseInt(document.getElementById('inp-employees').value, 10) || 1000;
    const budget = parseFloat(document.getElementById('inp-it-budget').value) || 1500000;
    const growth = parseFloat(document.getElementById('inp-growth-rate').value) || 18;
    const infra = document.getElementById('inp-infrastructure').value;
    const sensitivity = document.getElementById('inp-data-sensitivity').value;

    // Client-side TOE calculation preview
    let tech = 70.0;
    if (infra.includes('Hybrid') || infra.includes('Cloud')) tech += 12; else tech -= 5;
    if (this.state.legacyApps.length <= 2) tech += 8; else if (this.state.legacyApps.length >= 4) tech -= 10;

    let org = 65.0;
    const perEmp = budget / emp;
    if (perEmp >= 1500) org += 15; else if (perEmp >= 1000) org += 10;
    if (emp >= 1000) org += 5;

    let env = 70.0;
    if (growth >= 15) env += 12;
    if (sensitivity === 'High') env += 5;

    const overall = ((tech * 0.40) + (org * 0.35) + (env * 0.25)).toFixed(1);

    document.getElementById('review-overall-toe').textContent = overall;
    document.getElementById('review-toe-tech').innerHTML = `${tech.toFixed(1)}<small>/100</small>`;
    document.getElementById('review-toe-org').innerHTML = `${org.toFixed(1)}<small>/100</small>`;
    document.getElementById('review-toe-env').innerHTML = `${env.toFixed(1)}<small>/100</small>`;

    document.getElementById('review-comp-name').textContent = document.getElementById('inp-company-name').value;
    document.getElementById('review-apps-count').textContent = `${this.state.legacyApps.length} Systems`;
    document.getElementById('review-sensitivity').textContent = sensitivity;
  }

  async submitAssessment() {
    if (this.state.role === 'Viewer') {
      this.showToast('Viewer Role is read-only. Switch role to Manager or Admin to modify.', 'warning');
      return;
    }

    const payload = {
      ID: this.state.assessmentId,
      company_ID: this.state.companyId,
      title: document.getElementById('inp-assessment-title').value,
      infrastructure: document.getElementById('inp-infrastructure').value,
      growthRate: parseFloat(document.getElementById('inp-growth-rate').value),
      dataSensitivity: document.getElementById('inp-data-sensitivity').value,
      targetCategory: document.getElementById('inp-target-category').value,
      painPoints: document.getElementById('inp-pain-points').value,
      employees: parseInt(document.getElementById('inp-employees').value, 10),
      itBudget: parseFloat(document.getElementById('inp-it-budget').value),
      legacyApplications: this.state.legacyApps,
      status: 'Completed'
    };

    this.showToast('Saving assessment and executing TOE calculation...', 'info');

    try {
      const res = await fetch('/api/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const saved = await res.json();
      this.state.assessment = saved;
      this.showToast(`Assessment submitted! TOE Score: ${saved.readinessScore}/100`, 'success');

      // Trigger recommendation evaluation and risk assessment automatically
      await this.runStandardEvaluation();
      await this.reassessRisks();
      this.navigateToTab('dashboard');
    } catch (err) {
      this.showToast('Error saving assessment: ' + err.message, 'danger');
    }
  }

  saveAssessmentDraft() {
    this.showToast('Assessment saved locally as draft.', 'info');
  }

  // ==========================================
  // Catalog View (Module 3: SC-1 to SC-4)
  // ==========================================
  renderCatalog(products) {
    const container = document.getElementById('catalog-products-container');
    if (!container) return;

    container.innerHTML = products.map(p => `
      <div class="product-card" data-id="${p.ID}">
        <div>
          <div class="prod-card-top">
            <span class="prod-category-badge">${p.category}</span>
            <span class="kpi-pill ${p.status === 'Active' ? 'success' : 'danger'}">${p.status}</span>
          </div>
          <h3 class="prod-title">${p.name}</h3>
          <span class="prod-vendor">${p.vendor}</span>
          <p class="prod-desc">${p.description || p.businessFunction}</p>

          <div class="prod-metrics-mini">
            <div class="mini-metric-item">
              <span>Security</span>
              <strong>${p.securityScore}/100</strong>
            </div>
            <div class="mini-metric-item">
              <span>Scalability</span>
              <strong>${p.scalabilityScore}/100</strong>
            </div>
            <div class="mini-metric-item">
              <span>Cost Fit</span>
              <strong>${p.costScore}/100</strong>
            </div>
          </div>
        </div>

        <div class="prod-card-footer">
          <span class="tag">${p.pricingModel}</span>
          <button class="btn btn-sm btn-outline-primary" onclick="app.inspectProduct('${p.ID}')">Details →</button>
        </div>
      </div>
    `).join('');
  }

  filterCatalog(query) {
    const q = query.toLowerCase().trim();
    const filtered = this.state.products.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.vendor.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.businessFunction && p.businessFunction.toLowerCase().includes(q))
    );
    this.renderCatalog(filtered);
  }

  filterCatalogByCategory(category) {
    if (category === 'All') {
      this.renderCatalog(this.state.products);
    } else {
      const filtered = this.state.products.filter(p => p.category.toLowerCase() === category.toLowerCase());
      this.renderCatalog(filtered);
    }
  }

  inspectProduct(id) {
    const product = this.state.products.find(p => p.ID === id);
    if (!product) return;

    document.getElementById('modal-prod-name').textContent = product.name;
    document.getElementById('modal-prod-vendor').textContent = `${product.vendor} • ${product.category} (${product.businessFunction})`;

    const body = document.getElementById('modal-prod-body');
    body.innerHTML = `
      <div class="form-grid">
        <div class="meta-item">
          <span>Pricing Model</span>
          <strong>${product.pricingModel} (Cost Rating: ${product.costScore}/100)</strong>
        </div>
        <div class="meta-item">
          <span>Deployment Type</span>
          <strong>${product.deploymentType}</strong>
        </div>
        <div class="meta-item">
          <span>Security & Compliance</span>
          <strong>${product.securityRating} (${product.securityScore}/100)</strong>
        </div>
        <div class="meta-item">
          <span>Scalability Tier</span>
          <strong>${product.scalabilityRating} (${product.scalabilityScore}/100)</strong>
        </div>
        <div class="meta-item">
          <span>API & Integration Capability</span>
          <strong>${product.integrationCapability} (${product.integrationScore}/100)</strong>
        </div>
        <div class="meta-item">
          <span>Migration Complexity</span>
          <strong><span class="kpi-pill ${product.migrationComplexity === 'High' ? 'danger' : 'info'}">${product.migrationComplexity} Complexity</span></strong>
        </div>
        <div class="form-group full-width">
          <label>Platform Overview</label>
          <p style="font-size: 13.5px; color: var(--text-muted); line-height: 1.6;">${product.description}</p>
        </div>
      </div>
    `;

    document.getElementById('modal-product-details').classList.add('active');
  }

  openAdminAddProductModal() {
    if (this.state.role !== 'Admin') {
      this.showToast('Admin role required to add products to the catalog.', 'warning');
      return;
    }
    document.getElementById('modal-admin-product').classList.add('active');
  }

  async saveAdminProduct() {
    const payload = {
      name: document.getElementById('admin-inp-name').value,
      vendor: document.getElementById('admin-inp-vendor').value,
      category: document.getElementById('admin-inp-category').value,
      pricingModel: document.getElementById('admin-inp-pricing').value,
      costScore: parseFloat(document.getElementById('admin-inp-cost').value),
      securityScore: parseFloat(document.getElementById('admin-inp-security').value),
      scalabilityScore: parseFloat(document.getElementById('admin-inp-scalability').value),
      integrationScore: parseFloat(document.getElementById('admin-inp-integration').value),
      featuresScore: parseFloat(document.getElementById('admin-inp-features').value),
      migrationComplexity: document.getElementById('admin-inp-complexity').value,
      description: document.getElementById('admin-inp-desc').value,
      deploymentType: 'Multi-tenant Public Cloud',
      targetOrganisation: 'Enterprise',
      apiAvailable: true
    };

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const created = await res.json();
      this.showToast(`Product ${created.name} added to catalog`, 'success');
      this.closeModals();
      await this.loadCatalogProducts();
    } catch (err) {
      this.showToast('Error saving product: ' + err.message, 'danger');
    }
  }

  // ==========================================
  // Recommendations & Comparisons (Module 4)
  // ==========================================
  async runStandardEvaluation() {
    this.showToast('Running multi-criteria weighted evaluation...', 'info');
    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentId: this.state.assessmentId,
          weights: this.state.weights
        })
      });
      const data = await res.json();
      this.state.evaluations = data.results || [];
      this.renderRecommendations(this.state.evaluations);
      this.showToast(`Evaluation completed: ${this.state.evaluations.length} products ranked`, 'success');
    } catch (err) {
      this.showToast('Evaluation error: ' + err.message, 'danger');
    }
  }

  async runSimulationEvaluation() {
    const sum = Object.values(this.state.simWeights).reduce((a, b) => a + b, 0);
    if (sum !== 100) {
      this.showToast(`Simulation weights must total 100% (Current: ${sum}%)`, 'warning');
      return;
    }

    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentId: this.state.assessmentId,
          weights: this.state.simWeights
        })
      });
      const data = await res.json();
      this.state.evaluations = data.results || [];
      this.renderRecommendations(this.state.evaluations);
      this.showToast(`Simulated rankings updated! Top: ${this.state.evaluations[0] ? this.state.evaluations[0].productName : ''}`, 'info');
    } catch (err) {
      this.showToast('Simulation error: ' + err.message, 'danger');
    }
  }

  renderRecommendations(results) {
    const container = document.getElementById('recommendations-list');
    if (!container) return;

    if (!results || results.length === 0) {
      container.innerHTML = '<p style="text-align:center; padding: 40px; color: var(--text-muted);">No evaluation results available. Click "Run Weighted Evaluation" above.</p>';
      return;
    }

    container.innerHTML = results.map(r => `
      <div class="rec-rank-card">
        <div class="rec-rank-badge">
          <span class="rank-number">${r.rank === 1 ? '🥇 #1' : (r.rank === 2 ? '🥈 #2' : (r.rank === 3 ? '🥉 #3' : `#${r.rank}`))}</span>
          <span class="rank-label">Rank</span>
        </div>

        <div class="rec-main-details">
          <h4 class="rec-prod-title">${r.productName}</h4>
          <span class="rec-prod-vendor">${r.vendor} • ${r.category}</span>
          <p class="rec-explain-text"><strong>Decision Rationale:</strong> ${r.reason}</p>
        </div>

        <div class="rec-score-column">
          <div class="rec-total-score-badge">${r.totalScore.toFixed(1)}<small style="font-size: 11px;">/100</small></div>
          <div class="subscores-list" style="margin: 0;">
            <div class="subscore-item">
              <div class="subscore-label-row" style="font-size: 11px;">
                <span>Security</span>
                <strong>${r.securitySubScore}</strong>
              </div>
              <div class="progress-bar-bg small"><div class="progress-bar-fill fill-blue" style="width: ${r.securitySubScore}%;"></div></div>
            </div>
            <div class="subscore-item">
              <div class="subscore-label-row" style="font-size: 11px;">
                <span>Scalability</span>
                <strong>${r.scalabilitySubScore}</strong>
              </div>
              <div class="progress-bar-bg small"><div class="progress-bar-fill fill-cyan" style="width: ${r.scalabilitySubScore}%;"></div></div>
            </div>
            <div class="subscore-item">
              <div class="subscore-label-row" style="font-size: 11px;">
                <span>Cost</span>
                <strong>${r.costSubScore}</strong>
              </div>
              <div class="progress-bar-bg small"><div class="progress-bar-fill fill-amber" style="width: ${r.costSubScore}%;"></div></div>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }

  // Side-by-Side Comparison (RE-5)
  populateComparisonSelectors() {
    if (!this.state.products || this.state.products.length === 0) return;

    ['1', '2', '3'].forEach((num, idx) => {
      const sel = document.getElementById(`compare-sel-${num}`);
      if (!sel) return;

      sel.innerHTML = this.state.products.map(p => `
        <option value="${p.ID}" ${this.state.compareSelection[idx] === p.ID ? 'selected' : ''}>${p.name}</option>
      `).join('');
    });

    this.renderComparisonMatrix();
  }

  handleComparisonSelectionChange() {
    this.state.compareSelection = [
      document.getElementById('compare-sel-1').value,
      document.getElementById('compare-sel-2').value,
      document.getElementById('compare-sel-3').value
    ];
    this.renderComparisonMatrix();
  }

  renderComparisonMatrix() {
    const container = document.getElementById('compare-matrix-container');
    if (!container) return;

    const prods = this.state.compareSelection.map(id => this.state.products.find(p => p.ID === id)).filter(Boolean);
    if (prods.length === 0) return;

    const attrs = [
      { label: 'Platform Category', key: 'category' },
      { label: 'Vendor / Provider', key: 'vendor' },
      { label: 'Pricing Model', key: 'pricingModel' },
      { label: 'Cost Fit Rating', render: p => `<strong>${p.costScore}/100</strong> (${p.costLevel})` },
      { label: 'Security & Certifications', render: p => `<strong>${p.securityScore}/100</strong><br><small style="color:var(--text-muted);">${p.securityRating}</small>` },
      { label: 'Scalability Tier', render: p => `<strong>${p.scalabilityScore}/100</strong> (${p.scalabilityRating})` },
      { label: 'Integration Protocols', render: p => `<strong>${p.integrationScore}/100</strong><br><small style="color:var(--text-muted);">${p.integrationCapability}</small>` },
      { label: 'Features Maturity', render: p => `<strong>${p.featuresScore}/100</strong>` },
      { label: 'Migration Complexity', render: p => `<span class="kpi-pill ${p.migrationComplexity === 'High' ? 'danger' : 'info'}">${p.migrationComplexity} Complexity</span>` },
      { label: 'Deployment Topology', key: 'deploymentType' }
    ];

    container.innerHTML = `
      <table class="compare-table">
        <thead>
          <tr>
            <th class="compare-attr-name">Evaluation Dimension</th>
            ${prods.map(p => `<th><strong style="font-size:14px; color:var(--text-main);">${p.name}</strong></th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${attrs.map(attr => `
            <tr>
              <td class="compare-attr-name">${attr.label}</td>
              ${prods.map(p => `<td>${attr.render ? attr.render(p) : (p[attr.key] || 'N/A')}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  // ==========================================
  // Risk Assessment (Module 5: RA-1 to RA-5)
  // ==========================================
  async reassessRisks() {
    this.showToast('Evaluating enterprise risk profiles...', 'info');
    try {
      const res = await fetch('/api/risks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessmentId: this.state.assessmentId })
      });
      const data = await res.json();
      this.state.risks = data.risks || [];
      this.renderRisks(this.state.risks, data);
      this.showToast('Risk assessment updated', 'success');
    } catch (err) {
      this.showToast('Risk evaluation error: ' + err.message, 'danger');
    }
  }

  renderRisks(risks, fullData = {}) {
    this.renderRiskHeatmap(risks);

    const container = document.getElementById('assessed-risks-container');
    if (!container) return;

    if (!risks || risks.length === 0) {
      container.innerHTML = '<p style="text-align:center; padding: 40px; color: var(--text-muted);">No risks evaluated yet.</p>';
      return;
    }

    container.innerHTML = risks.map((r, idx) => `
      <div class="risk-card-item">
        <div class="risk-card-header">
          <div>
            <span class="risk-card-category">${r.category}</span>
            <h4 class="risk-card-title">${r.riskTitle}</h4>
          </div>
          <div style="display: flex; gap: 8px; align-items: center;">
            <span class="tag">Prob: ${r.probability}/5 × Imp: ${r.impact}/5</span>
            <span class="risk-score-badge ${r.severity}">${r.severity} (Score: ${r.score}/25)</span>
          </div>
        </div>

        <p class="risk-adjust-reason">
          <strong>Contextual Adjustment:</strong> ${r.adjustedReason}
        </p>

        <div class="mitigation-box">
          <strong>Actionable Mitigation Protocol:</strong> ${r.mitigation}
        </div>
      </div>
    `).join('');
  }

  renderRiskHeatmap(risks) {
    const grid = document.getElementById('risk-heatmap-grid');
    if (!grid) return;

    let html = '';
    // Y-axis: Probability (5 down to 1)
    // X-axis: Impact (1 to 5)
    for (let prob = 5; prob >= 1; prob--) {
      html += `<div style="display:flex; align-items:center; font-size:11px; font-weight:700; color:var(--text-muted);">P ${prob}</div>`;
      for (let imp = 1; imp <= 5; imp++) {
        const score = prob * imp;
        let colorClass = 'cell-green';
        if (score >= 16) colorClass = 'cell-red';
        else if (score >= 12) colorClass = 'cell-orange';
        else if (score >= 6) colorClass = 'cell-yellow';

        const matchingRisks = (risks || []).filter(r => r.probability === prob && r.impact === imp);
        const hasRisk = matchingRisks.length > 0;

        html += `
          <div class="heatmap-cell ${colorClass}" title="Probability: ${prob}, Impact: ${imp} (Score: ${score})">
            ${hasRisk ? `<div class="heatmap-risk-dot">${matchingRisks.length}</div>` : score}
          </div>
        `;
      }
    }

    // X-axis label row
    html += `<div></div>`;
    for (let imp = 1; imp <= 5; imp++) {
      html += `<div style="text-align:center; font-size:11px; font-weight:700; color:var(--text-muted);">I ${imp}</div>`;
    }

    grid.innerHTML = html;
  }

  // ==========================================
  // Migration Planner (Module 6: MP-1 to MP-5)
  // ==========================================
  async regeneratePlan() {
    this.showToast('Sequencing 8-Phase Transformation Roadmap...', 'info');
    try {
      const topProd = this.state.evaluations[0] ? this.state.evaluations[0].productId : 'sap-cloud-erp';
      const res = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentId: this.state.assessmentId,
          productId: topProd
        })
      });
      const plan = await res.json();
      this.state.plan = plan;
      this.renderPlan(plan, plan.phases || []);
      this.showToast('8-Phase Roadmap regenerated with risk adaptations', 'success');
    } catch (err) {
      this.showToast('Plan generation error: ' + err.message, 'danger');
    }
  }

  renderPlan(plan, phases) {
    if (!plan) return;

    document.getElementById('plan-hero-title').textContent = plan.title || 'SaaS Transformation Roadmap';
    document.getElementById('plan-hero-duration').textContent = `${plan.estimatedDurationMonths || 12} Months`;
    document.getElementById('plan-hero-start').textContent = plan.startDate || '2026-10-15';
    document.getElementById('plan-hero-end').textContent = plan.targetEndDate || '2027-10-15';

    const overallPct = plan.overallProgress !== undefined ? plan.overallProgress : 32.5;
    document.getElementById('plan-overall-pct').textContent = `${overallPct.toFixed(1)}%`;
    document.getElementById('plan-overall-bar').style.width = `${overallPct}%`;

    const timelineContainer = document.getElementById('phases-timeline-container');
    if (!timelineContainer) return;

    timelineContainer.innerHTML = (phases || []).map(p => {
      const isCompleted = p.status === 'Completed' || p.progress === 100;
      const isInProgress = p.status === 'In Progress';
      const cssClass = isCompleted ? 'completed' : (isInProgress ? 'in-progress' : '');

      return `
        <div class="phase-item-card ${cssClass}" data-phase-id="${p.ID}">
          <div class="phase-seq-dot">${isCompleted ? '✓' : p.sequence}</div>

          <div class="phase-header-row">
            <div>
              <h4 class="phase-name">Phase ${p.sequence}: ${p.name}</h4>
              <span class="phase-dates">${p.startDate} → ${p.endDate}</span>
            </div>
            <span class="kpi-pill ${isCompleted ? 'success' : (isInProgress ? 'info' : 'purple')}">${p.status}</span>
          </div>

          <p class="phase-deliverables">${p.deliverables}</p>

          <div class="phase-risk-notes">
            <strong>Targeted Focus & Mitigation:</strong> ${p.riskMitigationFocus}
          </div>

          <div class="phase-progress-row">
            <span style="font-size:12px; font-weight:600; min-width:80px;">Progress: ${p.progress}%</span>
            <div class="progress-bar-bg">
              <div class="progress-bar-fill ${isCompleted ? 'fill-green' : 'fill-blue'}" style="width: ${p.progress}%;"></div>
            </div>
          </div>

          <div class="phase-actions-row">
            <label style="font-size:12px; font-weight:600;">Update Status:</label>
            <select class="phase-status-select" onchange="app.updatePhaseProgress('${p.ID}', this.value, ${p.progress})">
              <option value="Not Started" ${p.status === 'Not Started' ? 'selected' : ''}>Not Started</option>
              <option value="In Progress" ${p.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
              <option value="Completed" ${p.status === 'Completed' ? 'selected' : ''}>Completed</option>
              <option value="Blocked" ${p.status === 'Blocked' ? 'selected' : ''}>Blocked</option>
            </select>

            <label style="font-size:12px; font-weight:600; margin-left: 12px;">Adjust %:</label>
            <input type="range" min="0" max="100" step="5" value="${p.progress}" style="width: 120px;"
              onchange="app.updatePhaseProgress('${p.ID}', '${p.status}', parseInt(this.value, 10))">
          </div>
        </div>
      `;
    }).join('');
  }

  async updatePhaseProgress(phaseId, status, progress) {
    if (this.state.role === 'Viewer') {
      this.showToast('Viewer Role cannot modify roadmap phases.', 'warning');
      return;
    }

    try {
      const res = await fetch(`/api/phase/${phaseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, progress })
      });
      const data = await res.json();
      this.showToast(`Updated phase progress (${data.overallProgress}% overall)`, 'success');
      await this.loadDashboardData();
    } catch (err) {
      this.showToast('Error updating phase: ' + err.message, 'danger');
    }
  }

  // ==========================================
  // AI Transformation Advisor (Module 8: AI-1 to AI-3)
  // ==========================================
  async sendChatMessage() {
    if (!this.state.aiEnabled) {
      this.showToast('AI Transformation Advisor is currently disabled.', 'warning');
      return;
    }

    const input = document.getElementById('chat-input');
    const question = input.value.trim();
    if (!question) return;

    input.value = '';
    const container = document.getElementById('chat-messages-container');

    // Add user message
    container.innerHTML += `
      <div class="chat-msg user">
        <div class="msg-avatar">👤</div>
        <div class="msg-content"><p>${question}</p></div>
      </div>
    `;
    container.scrollTop = container.scrollHeight;

    // Loading indicator
    const loadingId = 'loading-' + Date.now();
    container.innerHTML += `
      <div class="chat-msg assistant" id="${loadingId}">
        <div class="msg-avatar">🤖</div>
        <div class="msg-content"><p><em>Analyzing transformation parameters and generating recommendations...</em></p></div>
      </div>
    `;
    container.scrollTop = container.scrollHeight;

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          assessmentId: this.state.assessmentId
        })
      });
      const data = await res.json();
      
      const loader = document.getElementById(loadingId);
      if (loader) loader.remove();

      const formattedAnswer = data.answer.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>');

      container.innerHTML += `
        <div class="chat-msg assistant">
          <div class="msg-avatar">🤖</div>
          <div class="msg-content">
            <span class="tag" style="margin-bottom: 6px; display:inline-block;">${data.category || 'Transformation Guidance'}</span>
            <p>${formattedAnswer}</p>
          </div>
        </div>
      `;
      container.scrollTop = container.scrollHeight;
    } catch (err) {
      this.showToast('AI Assistant error: ' + err.message, 'danger');
    }
  }

  // ==========================================
  // Export Report Modal (TD-5)
  // ==========================================
  openReportModal() {
    const a = this.state.assessment || {};
    const topProd = this.state.evaluations[0] || { productName: 'SAP S/4HANA Cloud', totalScore: 91.8 };
    const risks = this.state.risks || [];

    const body = document.getElementById('report-content-body');
    body.innerHTML = `
      <div style="padding: 10px;">
        <div style="border-bottom: 2px solid var(--sap-blue); padding-bottom: 12px; margin-bottom: 20px;">
          <h2 style="font-size: 22px; font-weight: 800; color: var(--text-main);">Enterprise SaaS Transformation Executive Report</h2>
          <span style="font-size: 13px; color: var(--text-muted);">Generated on ${new Date().toLocaleDateString()} | Organization: ${a.company ? a.company.name : 'Apex Global Enterprises'}</span>
        </div>

        <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 8px;">1. Executive Summary & TOE Readiness</h3>
        <p style="font-size: 13.5px; color: var(--text-muted); line-height: 1.6; margin-bottom: 16px;">
          The enterprise has completed a multi-criteria SaaS readiness assessment. With <strong>1,000 employees</strong> and an annual IT budget of <strong>$1.5M</strong>, the overall <strong>TOE Readiness Score is ${a.readinessScore || 77.5}/100</strong> (Technology: ${a.toeTechScore || 67.0}, Organization: ${a.toeOrgScore || 85.0}, Environment: ${a.toeEnvScore || 87.0}).
        </p>

        <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 8px;">2. Top Recommendation Rationale</h3>
        <div style="background: var(--bg-tertiary); padding: 14px; border-radius: 6px; margin-bottom: 16px;">
          <strong style="font-size: 15px; color: var(--sap-blue);">${topProd.productName} (Rank #1, Score: ${topProd.totalScore}/100)</strong>
          <p style="font-size: 13px; color: var(--text-muted); margin-top: 6px;">${topProd.reason || 'Outstanding alignment on top security and scalability criteria.'}</p>
        </div>

        <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 8px;">3. Assessed Critical Migration Risks</h3>
        <ul style="font-size: 13px; color: var(--text-muted); padding-left: 20px; margin-bottom: 16px; line-height: 1.6;">
          ${risks.slice(0, 3).map(r => `<li><strong>${r.riskTitle}</strong> (${r.severity}, Score ${r.score}/25): ${r.mitigation}</li>`).join('')}
        </ul>

        <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 8px;">4. 8-Phase Roadmap Phasing</h3>
        <p style="font-size: 13px; color: var(--text-muted); line-height: 1.6;">
          Target transformation spans 12 months with active progress currently at <strong>32.5%</strong>. Pilot testing and data migration dry runs are prioritized before full production cutover.
        </p>
      </div>
    `;

    document.getElementById('modal-report-export').classList.add('active');
  }

  // ==========================================
  // Role & UI Navigation
  // ==========================================
  setRole(newRole) {
    this.state.role = newRole;
    document.getElementById('current-role-badge').textContent = newRole;
    this.showToast(`Switched active user role to: ${newRole}`, 'info');

    // Demonstrating RBAC permissions (UC-2, SC-3)
    const addProdBtn = document.getElementById('btn-admin-add-product');
    if (addProdBtn) addProdBtn.style.display = (newRole === 'Admin') ? 'inline-flex' : 'none';

    if (newRole === 'Viewer') {
      this.showToast('Viewer Mode: Read-only access enabled across all modules.', 'warning');
    }
  }

  navigateToTab(tabName) {
    this.state.activeTab = tabName;
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.classList.toggle('active', tab.getAttribute('data-tab') === tabName);
    });
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.toggle('active', content.id === `view-${tabName}`);
    });
  }

  toggleTheme() {
    const isDark = document.body.classList.contains('theme-dark');
    if (isDark) {
      document.body.classList.remove('theme-dark');
      document.getElementById('theme-icon').textContent = '☀️';
      localStorage.setItem('theme', 'light');
    } else {
      document.body.classList.add('theme-dark');
      document.getElementById('theme-icon').textContent = '🌙';
      localStorage.setItem('theme', 'dark');
    }
  }

  applyTheme() {
    const saved = localStorage.getItem('theme');
    if (saved === 'light') {
      document.body.classList.remove('theme-dark');
      document.getElementById('theme-icon').textContent = '☀️';
    }
  }

  closeModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${type === 'success' ? '✓' : (type === 'danger' ? '✕' : 'ℹ')}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
}

// Instantiate global app
window.app = new SaaSPlatformApp();
