# Enterprise SaaS Transformation Platform

> **Modern Enterprise Cloud Decision-Support System**  
> Developed as part of the **E1CSA313 / E1ITA306 Design Project - I** at Alliance University.  
> **Team Members:** Rishi Kumar, Aarushi Joshi, Pradyumn Bisen, Akshayadevi K  
> **Mentor:** Dr. T Prashant

---

## 1. Overview & Architecture

The **Enterprise SaaS Transformation Platform** is a decision-support and transformation-planning platform designed to guide organizations through digital modernization, legacy monolith migration, and multi-SaaS adoption.

The platform evaluates enterprise candidates (e.g., Salesforce, Microsoft Dynamics 365, SAP S/4HANA Cloud, Oracle Fusion, Workday, ServiceNow, Microsoft 365, Atlassian Jira, Power BI, Entra ID) using a multi-criteria weighted scoring model (MCDA), rule-based risk exposure matrices, an 8-phase transformation roadmap, and an AI-powered transformation advisor.

```
┌────────────────────────────────────────────────────────────────────────┐
│                   React 18 + Vite + Tailwind CSS                       │
│  [Dashboard]  [Assessment]  [Catalog]  [Evaluation]  [Risks]  [Plan]   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                       Supabase Client SDK (PostgREST)
                                    │
          ┌─────────────────────────┴─────────────────────────┐
          ▼                                                   ▼
┌──────────────────────────────┐        ┌──────────────────────────────┐
│     Supabase Edge Functions  │        │   Supabase PostgreSQL 15+    │
│  - evaluate-recommendations  │        │  - 15 Relational Tables      │
│  - assess-risks              │        │  - Row Level Security (RLS)  │
│  - dashboard-metrics         │        │  - RBAC (Admin/Mgr/Analyst)  │
│  - assistant-advisor (LLM)   │        │  - Analytical Views          │
└──────────────────────────────┘        └──────────────────────────────┘
```

### Modern Technology Stack
- **Frontend SPA:** [React 18](https://react.dev/), [Vite](https://vitejs.dev/), [Tailwind CSS](https://tailwindcss.com/), [React Router v6](https://reactrouter.com/), [Lucide Icons](https://lucide.dev/), [Recharts](https://recharts.org/)
- **Data & Auth Tier:** [Supabase](https://supabase.com/) (PostgreSQL 15+, Supabase Auth with Row-Level Security, PostgREST API)
- **Serverless Compute:** Supabase Edge Functions (Deno / TypeScript)
- **Unit & Integration Testing:** [Vitest](https://vitest.dev/), React Testing Library (56 passing automated unit tests)

---

## 2. Final 8-Module Implementation Status

Every capability from the original enterprise blueprint is implemented and covered by unit tests:

| Module | Feature Scope | Status | File & Code Evidence | Key Tests |
| :--- | :--- | :--- | :--- | :--- |
| **Module 1: User & Admin Management** | Multi-tenancy, User Profiles, RBAC (`Admin`, `Manager`, `Analyst`, `Viewer`), company profiles | **Implemented** | `frontend/src/features/auth/AuthPage.jsx`<br>`frontend/src/features/company/CompanyPage.jsx`<br>`frontend/src/services/authService.js`<br>`supabase/migrations/20261101000002_auth_rls.sql` | `auth.test.js` (8 tests)<br>`rls_tests.sql` (6 tests) |
| **Module 2: Enterprise Assessment** | 5-step wizard: Profile & Strategy, IT Topology, Legacy Monoliths inventory (CRUD), Criteria Weights ($=100\%$), TOE Readiness | **Implemented** | `frontend/src/features/assessment/AssessmentPage.jsx`<br>`frontend/src/services/assessmentService.js`<br>`frontend/src/lib/readiness.js` | `validation.test.js` (6 tests) |
| **Module 3: SaaS Product Catalog** | 10 real products from seed, search/filter, category pills, product detail modal, admin creation | **Implemented** | `frontend/src/features/catalog/CatalogPage.jsx`<br>`frontend/src/services/catalogService.js`<br>`supabase/seed.sql` | `catalog.test.js` (5 tests) |
| **Module 4: SaaS Evaluation Engine** | Weighted scoring (Cost 20, Sec 30, Scale 25, Int 15, Feat 10), live sensitivity sliders, 3-way compare matrix, explainability rationale | **Implemented** | `frontend/src/features/recommendation/RecommendationPage.jsx`<br>`frontend/src/services/recommendationService.js`<br>`supabase/functions/evaluate-recommendations/index.ts` | `scoring.test.js` (7 tests)<br>`engines.test.js` |
| **Module 5: Cost & Risk Assessment** | Rule-based risk engine, 5x5 exposure heatmap, severity thresholds, contextual mitigations | **Implemented** | `frontend/src/features/risk/RiskPage.jsx`<br>`frontend/src/services/riskService.js`<br>`supabase/functions/assess-risks/index.ts` | `risk.test.js` (5 tests)<br>`engines.test.js` |
| **Module 6: Transformation Planner** | 8 standard phases, timeline, milestone checklist, progress sliders, overall progress roll-up | **Implemented** | `frontend/src/features/planner/PlannerPage.jsx`<br>`frontend/src/services/plannerService.js`<br>`frontend/src/lib/planner.js` | `planner.test.js` (4 tests) |
| **Module 7: Interactive Dashboard** | Executive telemetry, Recharts BarChart for TOE readiness, Recharts BarChart for telemetry, Top Recommended Solution card, printable report modal | **Implemented** | `frontend/src/features/dashboard/DashboardPage.jsx`<br>`frontend/src/services/dashboardService.js`<br>`supabase/functions/dashboard-metrics/index.ts` | `services.test.js`<br>`engines.test.js` |
| **Module 8: AI Transformation Advisor** | Conversational transformation advisor, 5 suggested prompt chips, deterministic local responses, typing indicator, zero API keys in frontend | **Implemented** | `frontend/src/features/assistant/AssistantPage.jsx`<br>`frontend/src/services/assistantService.js`<br>`supabase/functions/assistant-advisor/index.ts` | `engines.test.js`<br>`services.test.js` |

---

## 3. Project Directory Structure

```text
├── frontend/                     # React 18 + Vite + Tailwind SPA
│   ├── src/
│   │   ├── app/                  # Router, Layout, ProtectedRoute, ShellBar
│   │   ├── components/           # Shared UI components (Card, Button, Modal, Toast, Badge)
│   │   ├── data/                 # Seed JSON datasets (Products, Risk Templates, Users)
│   │   ├── features/             # 8 feature modules
│   │   │   ├── assessment/       # 5-step Enterprise Assessment Wizard
│   │   │   ├── assistant/        # AI Transformation Advisor Chat UI
│   │   │   ├── auth/             # Login, Registration & Persona Switcher
│   │   │   ├── catalog/          # SaaS Catalog with Search, Filters & Details Modal
│   │   │   ├── company/          # Tenant Profile & User Management
│   │   │   ├── dashboard/        # Executive Dashboard with Recharts
│   │   │   ├── planner/          # 8-Phase Transformation Roadmap
│   │   │   ├── recommendation/   # Multi-Criteria Recommendation & Matrix
│   │   │   └── risk/             # 5x5 Risk Exposure Heatmap
│   │   ├── lib/                  # Core algorithms (scoring, risk, readiness, planner)
│   │   ├── services/             # Data access layer (Supabase SDK with mock fallback)
│   │   └── test/                 # 56 Vitest unit tests
│   ├── package.json
│   └── vite.config.js
├── supabase/                     # Supabase Backend & Compute
│   ├── functions/                # Deno TypeScript Edge Functions
│   │   ├── assess-risks/         # Rule-based risk elevation & severity classifier
│   │   ├── assistant-advisor/    # AI advisor with LLM secret & deterministic fallback
│   │   ├── dashboard-metrics/    # Telemetry and KPI roll-up engine
│   │   └── evaluate-recommendations/ # MCDA weighted scoring & reason generator
│   ├── migrations/               # PostgreSQL schema & RLS migrations
│   │   ├── 20261101000001_initial_schema.sql
│   │   ├── 20261101000002_auth_rls.sql
│   │   └── 20261101000003_engines.sql
│   ├── tests/                    # SQL test scripts
│   │   └── rls_tests.sql         # 6 transactional RLS policy test cases
│   └── seed.sql                  # Real seed data (10 products, 5 templates, users)
├── test/unit/                    # Original CAP test fixtures (preserved for verification)
└── README.md
```

---

## 4. Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** (v9 or higher)

### 4.1 Running the Frontend
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
# The dev server runs at http://localhost:3000

# Or build and run production preview
npm run build
npm run preview
# The preview server runs at http://localhost:3000
```

### 4.2 Running Tests
```bash
# Run the 56 Vitest unit tests
npm --prefix frontend test

# Run ESLint validation
npm --prefix frontend run lint
```

---

## 5. Supabase Backend Deployment

### 5.1 Environment Configuration
Create a `.env` file in `frontend/` matching `frontend/.env.example`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_USE_MOCKS=false
```

### 5.2 Deploying Migrations & Edge Functions
```bash
# 1. Login to Supabase CLI
supabase login

# 2. Link your local repo to your hosted Supabase project
supabase link --project-ref <your-project-ref>

# 3. Push schema migrations and seed data
supabase db push
supabase db seed

# 4. Set optional LLM API Key secrets for AI Advisor
supabase secrets set OPENAI_API_KEY="sk-..."
# or:
supabase secrets set GEMINI_API_KEY="AIza..."

# 5. Deploy all Edge Functions
supabase functions deploy evaluate-recommendations
supabase functions deploy assess-risks
supabase functions deploy dashboard-metrics
supabase functions deploy assistant-advisor
```

---

## 6. Mathematical Decision Models

1. **TOE Readiness Index (Technology, Organisation, Environment):**
   $$\text{Readiness Score} = 0.40 \times \text{Tech} + 0.35 \times \text{Org} + 0.25 \times \text{Env}$$
2. **Multi-Criteria Scoring Engine:**
   $$\text{Total Score} = \sum_{i=1}^5 (\text{Score}_i \times \text{Weight}_i)$$
   - Cost (20%), Security (30%), Scalability (25%), Integration (15%), Features (10%).
3. **Calibrated Risk Engine:**
   $$\text{Risk Exposure Score} = \text{Probability} \times \text{Impact} \quad (1 \le \text{Score} \le 25)$$
   - Automatically elevates integration risk for on-premise infrastructure and legacy monolith footprints $\ge 4$.
   - Automatically elevates data governance risk under high sensitivity mandates.
