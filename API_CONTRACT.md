# API Contract: Enterprise SaaS Transformation Platform

> **Project:** Enterprise SaaS Transformation Platform (Design Project-I, E1ITA306)  
> **Repository:** `https://github.com/rishiikr24/Design-Project`  
> **Branch:** `migrate/react-supabase`  
> **Date:** November 1, 2026  
> **Status:** Step F2 Complete (API Contract Formalization - Zero Code Modified)

---

## 1. Architectural Overview & Endpoint Mapping

The application exhibits a dual-interface architecture:
1. **Express REST Services (`server.js`):** The primary contract currently invoked by the frontend UI (`app/saas-ui/webapp/app.js`).
2. **SAP CAP OData V4 Services (`srv/*.cds` & `srv/*.js`):** Enterprise OData V4 services providing entity sets, custom actions, and analytics functions.

Below is the comprehensive contract mapping between the UI views, Express REST endpoints, and corresponding SAP CAP OData services.

---

## 2. API Endpoints & Entity Services Exposed to UI

### 2.1 Health & Platform Diagnostics

| Attribute | Specification |
| :--- | :--- |
| **Endpoint Name** | Platform Health Check |
| **REST Route** | `GET /api/health` |
| **CAP Service** | *N/A (Bootstrap diagnostic)* |
| **Consuming UI Component** | System monitoring / Telemetry status (`#view-dashboard`) |
| **Input Parameters** | *None* |
| **Response Type** | `JSON Object` |
| **Response Schema** | ```typescript
{
  status: "UP" | "DOWN";
  platform: string; // e.g. "SAP CAP / HANA Cloud / SQLite"
  version: string;  // e.g. "1.0.0"
}
``` |

---

### 2.2 Organizations & Profiles (Module 1: User & Admin Management)

#### `GET /api/companies`
| Attribute | Specification |
| :--- | :--- |
| **Endpoint Name** | Get Companies and Users List |
| **REST Route** | `GET /api/companies` |
| **CAP OData Entity** | `GET /odata/v4/assessment/Companies`, `GET /odata/v4/assessment/UserProfiles` |
| **Consuming UI Component** | ShellBar Tenant Selector (`#tenant-select`), Role Selector (`#role-select`) |
| **Input Parameters** | *None* |
| **Response Schema** | ```typescript
{
  companies: Array<{
    ID: string;        // UUID
    name: string;      // e.g. "Apex Global Enterprises"
    industry: string;  // e.g. "Manufacturing & Logistics"
    employees: number; // e.g. 1000
    itBudget: number;  // e.g. 1500000.00
    region: string;    // e.g. "North America"
  }>;
  users: Array<{
    ID: string;        // UUID
    username: string;  // e.g. "rishi.kumar"
    fullName: string;  // e.g. "Rishi Kumar"
    email: string;     // e.g. "rishi@apexglobal.com"
    role: "Admin" | "Manager" | "Analyst" | "Viewer";
    company_ID: string;
  }>;
}
``` |

---

### 2.3 Enterprise Assessment (Module 2: Enterprise Assessment)

#### `GET /api/assessments`
| Attribute | Specification |
| :--- | :--- |
| **Endpoint Name** | List Organization Assessments |
| **REST Route** | `GET /api/assessments?companyId=:companyId` |
| **CAP OData Entity** | `GET /odata/v4/assessment/Assessments?$expand=legacyApplications,requirements` |
| **Consuming UI Component** | Assessment Wizard initialization & Dashboard loader |
| **Query Parameters** | `companyId?: string` (Default: `'comp-apex-global'`) |
| **Response Schema** | `Array<AssessmentWithRelations>` (See schema below) |

#### `GET /api/assessment/:id`
| Attribute | Specification |
| :--- | :--- |
| **Endpoint Name** | Get Assessment Details |
| **REST Route** | `GET /api/assessment/:id` |
| **CAP OData Entity** | `GET /odata/v4/assessment/Assessments(:id)?$expand=legacyApplications,requirements` |
| **Consuming UI Component** | Wizard Prefill (`populateWizardWithAssessment()`) |
| **Path Parameters** | `id: string` (UUID or `'assessment-ref-case'`) |
| **Response Schema** | Single `AssessmentWithRelations` object |

#### `POST /api/assessment`
| Attribute | Specification |
| :--- | :--- |
| **Endpoint Name** | Save Assessment & Calculate TOE Readiness |
| **REST Route** | `POST /api/assessment` |
| **CAP Action** | `POST /odata/v4/assessment/calculateReadiness` |
| **Consuming UI Component** | Wizard Step 5 Submit (`#btn-wizard-submit`) |
| **Request Payload** | ```typescript
{
  ID?: string;               // Optional existing UUID
  company_ID?: string;       // Default: 'comp-apex-global'
  title: string;             // e.g. "Core Systems Cloud Modernization"
  infrastructure: "On-premise" | "Hybrid" | "Colocated" | "Private Cloud";
  growthRate: number;        // e.g. 18.0
  dataSensitivity: "High" | "Medium" | "Low";
  targetCategory: "All" | "ERP" | "CRM" | "HCM" | "ITSM" | "Productivity" | "Identity";
  painPoints: string;
  employees: number;         // e.g. 1000
  itBudget: number;          // e.g. 1500000.00
  status?: string;           // "Draft" | "In Progress" | "Completed"
  legacyApplications?: Array<{
    ID?: string;
    name: string;
    function: string;
    hosting: string;
    criticality: "Critical" | "High" | "Medium" | "Low";
    userCount: number;
    yearsInUse: number;
  }>;
  requirements?: Array<{
    ID?: string;
    category: string;
    description: string;
    priority: "Must Have" | "Nice to Have" | "Optional";
  }>;
}
``` |
| **Response Payload** | ```typescript
{
  ID: string;
  title: string;
  company_ID: string;
  infrastructure: string;
  growthRate: number;
  dataSensitivity: string;
  painPoints: string;
  targetCategory: string;
  readinessScore: number;     // 0-100
  toeTechScore: number;       // 0-100
  toeOrgScore: number;        // 0-100
  toeEnvScore: number;        // 0-100
  status: string;
  legacyApplications: Array<LegacyAppRecord>;
  requirements: Array<RequirementRecord>;
  readinessDetails: {
    readinessScore: number;
    readinessLevel: "High" | "Moderate" | "Preliminary";
    toeTechScore: number;
    toeOrgScore: number;
    toeEnvScore: number;
  };
}
``` |

---

### 2.4 SaaS Product Catalog (Module 3: SaaS Product Catalog)

#### `GET /api/products`
| Attribute | Specification |
| :--- | :--- |
| **Endpoint Name** | List SaaS Products |
| **REST Route** | `GET /api/products` |
| **CAP OData Entity** | `GET /odata/v4/catalog/SaaSProducts` |
| **Consuming UI Component** | Catalog Grid (`#view-catalog`), Comparison Selectors (`#compare-sel-1/2/3`) |
| **Input Parameters** | *None* |
| **Response Schema** | ```typescript
Array<{
  ID: string;                    // e.g. "sap-cloud-erp", "salesforce-crm"
  name: string;                  // e.g. "SAP S/4HANA Cloud"
  vendor: string;                // e.g. "SAP"
  category: "CRM" | "ERP" | "HCM" | "ITSM" | "Productivity" | "Analytics" | "Identity";
  businessFunction: string;
  pricingModel: string;          // e.g. "Per User/Month"
  costLevel: "Low" | "Medium" | "High";
  costScore: number;             // 0-100
  scalabilityRating: string;     // e.g. "Enterprise"
  scalabilityScore: number;      // 0-100
  securityRating: string;        // e.g. "ISO 27001 / SOC 2 Type II / FedRAMP"
  securityScore: number;         // 0-100
  integrationCapability: string; // e.g. "SAP BTP / OData V4 / REST APIs"
  integrationScore: number;      // 0-100
  featuresScore: number;         // 0-100
  deploymentType: string;        // e.g. "Multi-tenant Public Cloud"
  targetOrganisation: string;    // e.g. "Enterprise"
  migrationComplexity: "Low" | "Medium" | "High";
  apiAvailable: boolean;
  status: "Active" | "Retired";
  description: string;
}>
``` |

#### `POST /api/products`
| Attribute | Specification |
| :--- | :--- |
| **Endpoint Name** | Admin Add Product |
| **REST Route** | `POST /api/products` |
| **CAP Action** | `POST /odata/v4/catalog/addProduct` |
| **Consuming UI Component** | Admin Add Product Modal (`#modal-admin-product`) |
| **Request Payload** | All fields of `SaaSProduct` (excluding ID, which auto-generates if omitted) |
| **Response Payload** | Created `SaaSProduct` record with `status: "Active"` |

#### `PUT /api/products/:id` & `DELETE /api/products/:id`
| Attribute | Specification |
| :--- | :--- |
| **REST Routes** | `PUT /api/products/:id`, `DELETE /api/products/:id` |
| **CAP Actions** | `updateProduct(id, product)`, `retireProduct(id)` |
| **Consuming UI Component** | Catalog Admin maintenance |
| **Delete Behavior** | Soft-delete: sets `status = 'Retired'` |

---

### 2.5 Evaluation & Recommendations (Module 4: SaaS Evaluation Engine)

#### `POST /api/evaluate`
| Attribute | Specification |
| :--- | :--- |
| **Endpoint Name** | Evaluate & Rank SaaS Products |
| **REST Route** | `POST /api/evaluate` |
| **CAP Action** | `POST /odata/v4/evaluation/evaluate` |
| **Consuming UI Component** | Recommendation Leaderboard (`#view-recommendation`), Weight Sensitivity Simulation (`#btn-recalc-sim`) |
| **Request Payload** | ```typescript
{
  assessmentId?: string; // Assessment ID for contextual constraints
  weights?: {
    cost: number;        // Default: 20.0
    security: number;    // Default: 30.0
    scalability: number; // Default: 25.0
    integration: number; // Default: 15.0
    features: number;    // Default: 10.0
  };
}
``` |
| **Response Payload** | ```typescript
{
  weights: {
    cost: number;
    security: number;
    scalability: number;
    integration: number;
    features: number;
  };
  results: Array<{
    productId: string;
    productName: string;
    vendor: string;
    category: string;
    totalScore: number;           // Weighted composite (0-100)
    costSubScore: number;
    securitySubScore: number;
    scalabilitySubScore: number;
    integrationSubScore: number;
    featuresSubScore: number;
    rank: number;                 // 1, 2, 3, ...
    reason: string;               // Explainability justification
  }>;
}
``` |

---

### 2.6 Risk Assessment (Module 5: Cost & Risk Assessment)

#### `POST /api/risks`
| Attribute | Specification |
| :--- | :--- |
| **Endpoint Name** | Assess Enterprise Migration Risks |
| **REST Route** | `POST /api/risks` |
| **CAP Action** | `POST /odata/v4/risk/assessRisks` |
| **Consuming UI Component** | 5×5 Risk Heatmap (`#risk-heatmap-grid`), Risk Cards (`#view-risks`) |
| **Request Payload** | ```typescript
{
  assessmentId: string;
}
``` |
| **Response Payload** | ```typescript
{
  overallRiskLevel: "Low" | "Medium" | "High";
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  risks: Array<{
    templateId: string;
    riskTitle: string;
    category: "Data Governance" | "Integration" | "Vendor Lock-in" | "Organization" | "Compliance";
    probability: number;       // 1-5 (adjusted by rule engine)
    impact: number;            // 1-5 (adjusted by rule engine)
    score: number;             // probability * impact (1-25)
    severity: "Low" | "Medium" | "High" | "Critical";
    mitigation: string;
    adjustedReason: string;
  }>;
  budgetAnalysis: {
    budgetFit: "Optimal" | "Adequate" | "Constrained";
    itBudget: number;
    notes: string;
  };
}
``` |

---

### 2.7 Transformation Roadmap Planner (Module 6: Transformation Planner)

#### `POST /api/plan`
| Attribute | Specification |
| :--- | :--- |
| **Endpoint Name** | Generate 8-Phase Phased Migration Plan |
| **REST Route** | `POST /api/plan` |
| **CAP Action** | `POST /odata/v4/planner/generatePlan` |
| **Consuming UI Component** | Roadmap Hero Card & Timeline (`#view-planner`) |
| **Request Payload** | ```typescript
{
  assessmentId?: string;
  productId?: string; // Default: 'sap-cloud-erp'
}
``` |
| **Response Payload** | ```typescript
{
  planId: string;
  title: string;                         // e.g. "SaaS Transformation Roadmap: SAP S/4HANA Cloud"
  selectedProductId: string;
  totalPhases: 8;
  overallProgress: number;               // 0-100%
  startDate: string;                     // "YYYY-MM-DD"
  targetEndDate: string;                 // "YYYY-MM-DD"
  estimatedDurationMonths: number;       // 12-18
  phases: Array<{
    ID?: string;
    sequence: number;                    // 1 through 8
    name: string;
    status: "Not Started" | "In Progress" | "Completed" | "Blocked";
    progress: number;                    // 0-100
    startDate: string;
    endDate: string;
    deliverables: string;
    notes: string;
    riskMitigationFocus: string;
  }>;
}
``` |

#### `PATCH /api/phase/:id`
| Attribute | Specification |
| :--- | :--- |
| **Endpoint Name** | Update Roadmap Phase Progress |
| **REST Route** | `PATCH /api/phase/:id` |
| **CAP Action** | `POST /odata/v4/planner/updatePhase` |
| **Consuming UI Component** | Phase status dropdown & progress range slider (`.phase-item-card`) |
| **Request Payload** | ```typescript
{
  status: "Not Started" | "In Progress" | "Completed" | "Blocked";
  progress: number; // 0-100
}
``` |
| **Response Payload** | ```typescript
{
  phase: MigrationPhaseRecord;
  overallProgress: number; // Recalculated arithmetic mean of all 8 phases
}
``` |

---

### 2.8 Executive Dashboard (Module 7: Interactive Dashboard)

#### `GET /api/dashboard/:assessmentId`
| Attribute | Specification |
| :--- | :--- |
| **Endpoint Name** | Get Consolidated Dashboard Telemetry |
| **REST Route** | `GET /api/dashboard/:assessmentId` |
| **CAP Function** | `GET /odata/v4/dashboard/getMetrics(assessmentId=:assessmentId)` |
| **Consuming UI Component** | Executive Transformation Dashboard (`#view-dashboard`) |
| **Response Payload** | ```typescript
{
  assessment: AssessmentRecord;
  legacyCount: number;
  overallRiskLevel: "Low" | "Medium" | "High";
  risks: Array<AssessedRiskRecord>;
  plan: MigrationPlanRecord;
  phases: Array<MigrationPhaseRecord>;
  recommendations: Array<EvaluationResultRecord>;
  postGoLive: {
    adoptionRate: number;        // e.g. 88.4 (%)
    costEfficiency: number;      // e.g. 24.6 (%)
    licenseUtilization: number;  // e.g. 92.1 (%)
  };
}
``` |

#### `POST /api/demo/seed-reference-case`
| Attribute | Specification |
| :--- | :--- |
| **Endpoint Name** | 1-Click Load Reference Case |
| **REST Route** | `POST /api/demo/seed-reference-case` |
| **CAP Action** | *Seed demonstration utility* |
| **Consuming UI Component** | ShellBar Reference Button (`#btn-load-ref-case`), Wizard Prefill (`#btn-prefill-ref`) |
| **Response Payload** | ```typescript
{
  success: true;
  message: string;
  assessmentId: "assessment-ref-case";
}
``` |

---

### 2.9 AI Transformation Advisor (Module 8: AI Advisor)

#### `POST /api/assistant`
| Attribute | Specification |
| :--- | :--- |
| **Endpoint Name** | Contextual Transformation Advisor Query |
| **REST Route** | `POST /api/assistant` |
| **CAP Action** | `POST /odata/v4/assistant/askAssistant` |
| **Consuming UI Component** | AI Transformation Advisor Chat (`#view-assistant`) |
| **Request Payload** | ```typescript
{
  question: string;
  assessmentId?: string;
}
``` |
| **Response Payload** | ```typescript
{
  answer: string;
  category: "Scoring Rationale" | "Risk Analysis" | "Migration Roadmap" | "Readiness Diagnosis" | "Business Case";
  suggestedQuestions?: string[];
}
``` |

---

## 3. `srv/lib` Pure Function Signatures & Worked Verification Examples

All functions below are decoupled, pure JavaScript modules located in `srv/lib/`. They have been executed in Node.js and verified against the unit test fixtures.

---

### 3.1 Scoring & Recommendation Engine (`srv/lib/scoring.js`)

#### A. `validateWeights(weights: Object): boolean`
- **Purpose:** Verifies that multi-criteria weights sum to exactly 100.0 (tolerance $\pm 0.01$).
- **Worked Verification:**
  - **Input 1 (Default Weights):**
    ```javascript
    validateWeights({ cost: 20, security: 30, scalability: 25, integration: 15, features: 10 });
    // => Output: true
    ```
  - **Input 2 (Invalid Weights):**
    ```javascript
    validateWeights({ cost: 10, security: 20, scalability: 30, integration: 10, features: 10 });
    // => Output: false
    ```

#### B. `scoreProduct(product: Object, weights?: Object): Object`
- **Formula:**
  $$\text{Total Score} = \left(\text{Cost} \times \frac{w_c}{100}\right) + \left(\text{Security} \times \frac{w_s}{100}\right) + \left(\text{Scalability} \times \frac{w_{sc}}{100}\right) + \left(\text{Integration} \times \frac{w_i}{100}\right) + \left(\text{Features} \times \frac{w_f}{100}\right)$$
- **Worked Verification:**
  - **Real Input:**
    ```javascript
    const product = {
      id: "prod-a",
      name: "Product Alpha",
      vendor: "Vendor A",
      category: "CRM",
      costScore: 80,
      securityScore: 90,
      scalabilityScore: 85,
      integrationScore: 70,
      featuresScore: 95
    };
    const weights = { cost: 20, security: 30, scalability: 25, integration: 15, features: 10 };
    scoreProduct(product, weights);
    ```
  - **Calculation:**
    $$(80 \times 0.20) + (90 \times 0.30) + (85 \times 0.25) + (70 \times 0.15) + (95 \times 0.10) = 16.0 + 27.0 + 21.25 + 10.5 + 9.5 = 84.25$$
  - **Real Output:**
    ```json
    {
      "productId": "prod-a",
      "productName": "Product Alpha",
      "vendor": "Vendor A",
      "category": "CRM",
      "costSubScore": 80,
      "securitySubScore": 90,
      "scalabilitySubScore": 85,
      "integrationSubScore": 70,
      "featuresSubScore": 95,
      "totalScore": 84.25
    }
    ```

#### C. `evaluateProducts(products: Array, weights?: Object, assessment?: Object): Array`
- **Purpose:** Scores candidate products, generates explainability justifications, filters by target category (if defined), and returns descending sorted rankings.
- **Worked Verification:**
  - **Real Input:** `mockProducts` from `test/unit/scoring.test.js` evaluated with `assessment = { targetCategory: 'CRM', dataSensitivity: 'High' }`.
  - **Real Output (Top Rank):**
    ```json
    [
      {
        "productId": "prod-a",
        "productName": "Product Alpha",
        "vendor": "Vendor A",
        "category": "CRM",
        "costSubScore": 80,
        "securitySubScore": 90,
        "scalabilitySubScore": 85,
        "integrationSubScore": 70,
        "featuresSubScore": 95,
        "totalScore": 84.25,
        "reason": "Strong alignment on top-priority criterion Security (30% weight) with an outstanding rating of 90/100. Requires additional security controls to meet High Data Sensitivity standard.",
        "rank": 1
      }
    ]
    ```

---

### 3.2 Explainability Reason Generator (`srv/lib/reasons.js`)

#### `generateReason(product: Object, scores: Object, weights: Object, assessment?: Object): string`
- **Purpose:** Synthesizes explainable natural-language decision justification by analyzing the highest weighted criteria and cross-referencing assessment constraints (data sensitivity, user scale, legacy count).
- **Worked Verification:**
  - **Real Input:**
    ```javascript
    const product = {
      name: "SAP S/4HANA Cloud",
      migrationComplexity: "High"
    };
    const scores = {
      costSubScore: 65,
      securitySubScore: 96,
      scalabilitySubScore: 98,
      integrationSubScore: 95,
      featuresSubScore: 98
    };
    const weights = { cost: 20, security: 30, scalability: 25, integration: 15, features: 10 };
    const assessment = { dataSensitivity: "High", employees: 1000, legacyAppsCount: 4 };
    ```
  - **Real Output:**
    ```text
    "Strong alignment on top-priority criterion Security (30% weight) with an outstanding rating of 96/100. Robust compliance alignment to mitigate High Data Sensitivity risk. Scalability profile accommodates 1000+ users. Integration maturity supports migration from 4 legacy systems. High migration complexity warrants phased deployment."
    ```

---

### 3.3 Rule-Based Risk Engine (`srv/lib/risk.js`)

#### A. `getSeverity(score: number): string`
- **Thresholds:**
  - $\text{Score} \ge 16 \implies \text{"Critical"}$
  - $\text{Score} \ge 12 \implies \text{"High"}$
  - $\text{Score} \ge 6 \implies \text{"Medium"}$
  - $\text{Score} < 6 \implies \text{"Low"}$

#### B. `assessRisks(templates: Array, assessment?: Object): Object`
- **Rules:**
  - Elevates Data Loss probability $+1$ if `dataSensitivity === 'High'`.
  - Elevates Integration Failure probability $+1$ if `infrastructure === 'On-premise'`.
  - Elevates Integration Failure probability $+1$ if `legacyAppsCount >= 4`.
  - Caps probability at 5. Derives score $= \text{probability} \times \text{impact}$.
- **Worked Verification:**
  - **Real Input:**
    ```javascript
    const templates = [{
      id: "risk-data-loss",
      category: "Data Governance",
      riskTitle: "Data Loss During Migration",
      baseProbability: 3,
      baseImpact: 5,
      defaultMitigation: "Checksum validation and parallel testing."
    }];
    const assessment = {
      infrastructure: "On-premise",
      legacyAppsCount: 4,
      dataSensitivity: "High",
      itBudget: 1500000
    };
    ```
  - **Real Output:**
    ```json
    {
      "risks": [
        {
          "templateId": "risk-data-loss",
          "riskTitle": "Data Loss During Migration",
          "category": "Data Governance",
          "probability": 4,
          "impact": 5,
          "score": 20,
          "severity": "Critical",
          "mitigation": "Checksum validation and parallel testing.",
          "adjustedReason": "Elevated probability due to High Data Sensitivity classification. High volume of legacy databases (4) heightens business disruption impact."
        }
      ],
      "overallRiskLevel": "High",
      "summary": { "critical": 1, "high": 0, "medium": 0, "low": 0 },
      "budgetAnalysis": {
        "budgetFit": "Optimal",
        "itBudget": 1500000,
        "notes": "Strong capital capacity enables accelerated parallel testing and premier implementation support."
      }
    }
    ```

---

### 3.4 Migration Roadmap Planner (`srv/lib/planner.js`)

#### A. `generateMigrationPlan(assessment?: Object, product?: Object, risks?: Array, startDateStr?: string): Object`
- **Output:** 8 standard transformation phases adapted to product complexity and identified risks.
- **Worked Verification:**
  - **Real Input:** `product = { id: 'sap-cloud-erp', name: 'SAP S/4HANA Cloud', migrationComplexity: 'High' }`, `startDate = '2026-11-01'`.
  - **Real Output (Header & Sample Phase):**
    ```json
    {
      "title": "SaaS Transformation Roadmap: SAP S/4HANA Cloud",
      "totalPhases": 8,
      "overallProgress": 36.9,
      "duration": 12,
      "samplePhase": {
        "sequence": 1,
        "name": "Assessment & Strategy",
        "status": "Completed",
        "progress": 100,
        "startDate": "2026-11-01",
        "endDate": "2026-12-01",
        "deliverables": "Architecture gap analysis, stakeholder alignment, governance charter, and TCO baseline.",
        "notes": "Focus for SAP S/4HANA Cloud: Architecture gap analysis, stakeholder alignment, governance charter, and TCO baseline.",
        "riskMitigationFocus": "Standard execution guidelines."
      }
    }
    ```

#### B. `calculateOverallProgress(phases: Array): number`
- **Formula:** Arithmetic mean of all phase progress percentages rounded to 1 decimal place:
  $$\text{Overall Progress} = \frac{\sum_{i=1}^{N} \text{progress}_i}{N}$$
- **Worked Verification:**
  ```javascript
  calculateOverallProgress([{ progress: 100 }, { progress: 100 }, { progress: 50 }, { progress: 0 }]);
  // Calculation: (100 + 100 + 50 + 0) / 4 = 250 / 4 = 62.5%
  // => Output: 62.5
  ```

---

### 3.5 TOE Enterprise Readiness Diagnostic (`srv/lib/readiness.js`)

#### `calculateReadiness(assessment?: Object): Object`
- **Formula:**
  $$\text{TOE} = (0.40 \times \text{Tech}) + (0.35 \times \text{Org}) + (0.25 \times \text{Env})$$
- **Worked Verification:**
  - **Real Input (Reference Case):**
    ```javascript
    calculateReadiness({
      employees: 1000,
      itBudget: 1500000,
      growthRate: 18,
      dataSensitivity: "High",
      infrastructure: "On-premise",
      legacyAppsCount: 4
    });
    ```
  - **Factor Calculations:**
    - $\text{Tech} = 70.0 - 5.0 (\text{on-prem}) = 65.0$
    - $\text{Org} = 65.0 + 15.0 (\text{budget/emp } \$1,500) + 5.0 (\ge 1,000\text{ emp}) = 85.0$
    - $\text{Env} = 70.0 + 12.0 (\text{growth } \ge 15\%) + 5.0 (\text{high sensitivity}) = 87.0$
    - $\text{Overall} = (65.0 \times 0.40) + (85.0 \times 0.35) + (87.0 \times 0.25) = 26.0 + 29.75 + 21.75 = 77.5$
  - **Real Output:**
    ```json
    {
      "readinessScore": 77.5,
      "readinessLevel": "Moderate",
      "toeTechScore": 65,
      "toeOrgScore": 85,
      "toeEnvScore": 87
    }
    ```

---

### 3.6 AI Transformation Advisor Engine (`srv/lib/assistant.js`)

#### `answerQuestion(question: string, context: Object): Object`
- **Semantic Routing:** Routes to `Scoring Rationale`, `Risk Analysis`, `Migration Roadmap`, `Readiness Diagnosis`, or `Business Case`.
- **Worked Verification:**
  - **Real Input:**
    ```javascript
    answerQuestion("Why is the top product ranked #1?", {
      results: [{
        productName: "Product Alpha",
        totalScore: 84.25,
        costSubScore: 80,
        securitySubScore: 90,
        scalabilitySubScore: 85,
        integrationSubScore: 70,
        featuresSubScore: 95,
        reason: "Strong alignment on top-priority criterion Security (30% weight)..."
      }]
    });
    ```
  - **Real Output:**
    ```json
    {
      "answer": "**Product Alpha** holds Rank #1 with an overall weighted score of **84.25/100**.\n\n• **Cost Fit**: 80/100\n• **Security**: 90/100\n• **Scalability**: 85/100\n• **Integration**: 70/100\n• **Features**: 95/100\n\n**Decision Rationale**: Strong alignment on top-priority criterion Security (30% weight)...",
      "category": "Scoring Rationale"
    }
    ```

---

## 4. Test Suite Execution & Verification

### Test Command
```bash
npm.cmd test
```

### Raw Test Execution Output
```text
> saas-transformation@1.0.0 test
> node --test test/unit/*.test.js

▶ 8-Phase Migration Planner Engine
  ✔ contains exactly 8 standard transformation phases (0.9095ms)
  ✔ generates a sequential migration plan with dates and risk adaptations (1.9838ms)
  ✔ correctly calculates overall progress percentage (0.2163ms)
✔ 8-Phase Migration Planner Engine (3.8896ms)
▶ Explainability Reason Generator
  ✔ generates rich rationale based on highest weighted criteria (0.959ms)
✔ Explainability Reason Generator (1.6315ms)
▶ Rule-Based Risk Assessment Engine
  ✔ correctly maps severity thresholds from score (0.4825ms)
  ✔ elevates data loss probability when data sensitivity is High (0.4022ms)
  ✔ elevates integration failure probability on on-premise infrastructure with high legacy apps count (0.1332ms)
  ✔ derives overall risk level correctly (0.1151ms)
✔ Rule-Based Risk Assessment Engine (2.0565ms)
▶ SaaS Recommendation Scoring Engine
  ✔ validates that default weights total 100 (0.5024ms)
  ✔ correctly calculates weighted score for a single product (0.1511ms)
  ✔ ranks evaluated products in descending score order (0.3304ms)
  ✔ filters by target category when specified (0.1257ms)
  ✔ produces reproducible results and explanation reason (1.1185ms)
✔ SaaS Recommendation Scoring Engine (3.1653ms)
ℹ tests 13
ℹ suites 4
ℹ pass 13
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 103.7422
```

---

## 5. Portability to Supabase + React

This API contract facilitates zero-loss migration:
1. **Schema & RLS:** All entities map $1:1$ to PostgreSQL tables with Foreign Keys and Row Level Security policies.
2. **Deterministic Calculations:** Scoring (`scoring.js`), Risk (`risk.js`), TOE Readiness (`readiness.js`), and Planner (`planner.js`) can run both inside frontend React hooks / client libraries and inside Supabase Edge Functions or PostgreSQL stored functions.
3. **Contracts Preserved:** The React UI can consume these exact input and response structures using a Supabase client API layer or lightweight REST client.

