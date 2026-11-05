/**
 * 20 Structured Enterprise Readiness Statements across the 5 canonical dimensions
 * Options: 'fully' (3 pts) | 'partially' (2 pts) | 'not_sure' (1 pt) | 'not_in_place' (0 pts)
 */

export const ASSESSMENT_DIMENSIONS = [
  {
    id: 'org',
    num: 1,
    title: 'Business & Organisational Readiness',
    shortTitle: 'Business & Org',
    description: 'Executive sponsorship, change management capacity, business agility, and cross-functional alignment.',
    questionCount: 4,
    estMinutes: '3–5 min',
    questions: [
      {
        id: 'org_1',
        prompt: 'Executive Leadership & Strategy',
        statement: 'Senior executive leadership has clearly defined and endorsed cloud SaaS transformation as an enterprise strategic priority.',
        guidance: 'Evaluates C-suite sponsorship, chartered transformation budget, and strategic alignment.'
      },
      {
        id: 'org_2',
        prompt: 'Change Management & Training Capacity',
        statement: 'A formal change enablement framework and dedicated user training program exist for business department adoption.',
        guidance: 'Checks for change champion networks, user readiness programs, and adoption monitoring.'
      },
      {
        id: 'org_3',
        prompt: 'Cross-Functional Process Alignment',
        statement: 'Standard operating business processes are documented and adaptable to fit standard commercial SaaS workflows without custom code.',
        guidance: 'Evaluates willingness to adopt SaaS best practices rather than forcing customizations.'
      },
      {
        id: 'org_4',
        prompt: 'Workforce Digital Literacy & Culture',
        statement: 'Business units actively utilize modern collaborative digital tooling and exhibit high receptiveness to new platforms.',
        guidance: 'Reflects organizational agility and resistance to transition from legacy spreadsheets/desktops.'
      }
    ]
  },
  {
    id: 'tech',
    num: 2,
    title: 'Technology Readiness',
    shortTitle: 'Technology',
    description: 'Architecture modernism, legacy monolith decoupled state, integration interfaces, and API maturity.',
    questionCount: 4,
    estMinutes: '3–5 min',
    questions: [
      {
        id: 'tech_1',
        prompt: 'Modern API & Integration Middleware',
        statement: 'The IT landscape features secure REST/GraphQL API integration gateways capable of bi-directional synchronization with cloud SaaS.',
        guidance: 'Evaluates middleware availability (iPaaS, ESB) vs fragile point-to-point ETL.'
      },
      {
        id: 'tech_2',
        prompt: 'Identity & Access Modernization (IAM)',
        statement: 'A centralized Single Sign-On (SSO / SAML 2.0 / OIDC) identity provider is implemented across the corporate directory.',
        guidance: 'Verifies Azure AD, Okta, or similar centralized identity governance.'
      },
      {
        id: 'tech_3',
        prompt: 'Data Architecture & Cleanse State',
        statement: 'Core business master data (customer, vendor, inventory) has been audited, deduplicated, and cataloged for cloud migration.',
        guidance: 'Evaluates data quality debt and extract-transform-load feasibility.'
      },
      {
        id: 'tech_4',
        prompt: 'Legacy Monolith Decoupling Feasibility',
        statement: 'Custom legacy applications can be phased out systematically without causing cascading downtime across core business operations.',
        guidance: 'Checks for hardwired database-level couplings or tight batch dependencies.'
      }
    ]
  },
  {
    id: 'sec',
    num: 3,
    title: 'Security & Compliance Readiness',
    shortTitle: 'Security & Compliance',
    description: 'Data classification governance, regulatory certifications (SOC2, ISO27001), privacy, and sovereignty controls.',
    questionCount: 4,
    estMinutes: '3–5 min',
    questions: [
      {
        id: 'sec_1',
        prompt: 'Data Classification & Sovereignty Policy',
        statement: 'Enterprise information assets are formally classified by sensitivity (PII, IP, Financial) with explicit jurisdictional storage rules.',
        guidance: 'Evaluates compliance with regional data sovereignty mandates (GDPR, HIPAA, DPDPA).'
      },
      {
        id: 'sec_2',
        prompt: 'Vendor Security & Vendor Risk Assessment',
        statement: 'A structured third-party vendor risk assessment procedure enforces mandatory SOC 2 Type II or ISO 27001 verification.',
        guidance: 'Ensures external SaaS vendors meet strict enterprise cybersecurity posture.'
      },
      {
        id: 'sec_3',
        prompt: 'Encryption at Rest & in Transit',
        statement: 'All corporate transactional data is mandated to employ AES-256 encryption at rest and TLS 1.3 in transit.',
        guidance: 'Validates baseline cryptographic hygiene across cloud services.'
      },
      {
        id: 'sec_4',
        prompt: 'Auditability & Continuous Monitoring',
        statement: 'Automated SIEM/audit logging monitors user session anomalies, privileged administrative actions, and data export events.',
        guidance: 'Checks for security event visibility and rapid incident response readiness.'
      }
    ]
  },
  {
    id: 'fin',
    num: 4,
    title: 'Financial Readiness',
    shortTitle: 'Financial Readiness',
    description: 'OpEx budget runway, TCO visibility, licensing optimization, and business case value realization.',
    questionCount: 4,
    estMinutes: '3–5 min',
    questions: [
      {
        id: 'fin_1',
        prompt: 'OpEx Subscription Budgeting Transition',
        statement: 'Enterprise finance models comfortably support recurring operational expenditures (OpEx) alongside legacy CapEx phase-outs.',
        guidance: 'Evaluates financial readiness for multi-year software-as-a-service subscription commitments.'
      },
      {
        id: 'fin_2',
        prompt: 'Total Cost of Ownership (TCO) Transparency',
        statement: 'Legacy on-premise infrastructure costs (hardware, power, cooling, DBA maintenance, downtime) are rigorously tracked.',
        guidance: 'Enables accurate TCO comparisons against SaaS vendor licensing.'
      },
      {
        id: 'fin_3',
        prompt: 'Migration & Dual-Running Contingency',
        statement: 'Adequate transformation budget reserves are provisioned for transition consulting, data migration tooling, and dual-run licensing.',
        guidance: 'Guards against project budget overruns during parallel cutover windows.'
      },
      {
        id: 'fin_4',
        prompt: 'ROI & Value Realization Framework',
        statement: 'Quantifiable operational efficiency and headcount productivity metrics are established to measure post-go-live transformation ROI.',
        guidance: 'Ensures accountability for business outcomes post-adoption.'
      }
    ]
  },
  {
    id: 'sus',
    num: 5,
    title: 'Sustainability & Future Readiness',
    shortTitle: 'Sustainability & Future',
    description: 'Long-term scalability, green cloud efficiency, AI adoption runway, and continuous innovation velocity.',
    questionCount: 4,
    estMinutes: '3–5 min',
    questions: [
      {
        id: 'sus_1',
        prompt: 'Cloud Elasticity & Growth Scalability',
        statement: 'Target SaaS architectures can dynamically absorb 2x–5x growth surges in transaction volume without performance degradation.',
        guidance: 'Evaluates multi-tenant scalability matching enterprise expansion.'
      },
      {
        id: 'sus_2',
        prompt: 'Green Cloud & Energy Efficiency Goals',
        statement: 'Decommissioning inefficient on-premise server racks aligns with corporate carbon-neutrality and ESG sustainability pledges.',
        guidance: 'Calculates energy and environmental footprint reduction through hyper-scaler consolidation.'
      },
      {
        id: 'sus_3',
        prompt: 'AI & Machine Learning Innovation Readiness',
        statement: 'Enterprise data pipelines are positioned to leverage embedded AI copilots and predictive insights offered by modern SaaS platforms.',
        guidance: 'Assesses forward-looking readiness to adopt AI-assisted business workflows.'
      },
      {
        id: 'sus_4',
        prompt: 'Vendor Lock-in & Portability Safeguards',
        statement: 'Exit strategies, open data export protocols, and contractual migration rights are established to prevent vendor lock-in.',
        guidance: 'Protects enterprise independence and future software flexibility.'
      }
    ]
  }
];

export const ANSWER_CHOICES = [
  { value: 'fully', label: 'Fully in place', score: 3, badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { value: 'partially', label: 'Partially in place', score: 2, badgeColor: 'bg-blue-100 text-blue-800 border-blue-300' },
  { value: 'not_sure', label: 'Not sure / In review', score: 1, badgeColor: 'bg-amber-100 text-amber-800 border-amber-300' },
  { value: 'not_in_place', label: 'Not in place', score: 0, badgeColor: 'bg-slate-100 text-slate-700 border-slate-300' }
];

export const DEFAULT_QUESTION_ANSWERS = {
  // Org
  org_1: 'fully',
  org_2: 'partially',
  org_3: 'partially',
  org_4: 'fully',
  // Tech
  tech_1: 'partially',
  tech_2: 'fully',
  tech_3: 'partially',
  tech_4: 'not_sure',
  // Sec
  sec_1: 'fully',
  sec_2: 'fully',
  sec_3: 'fully',
  sec_4: 'partially',
  // Fin
  fin_1: 'fully',
  fin_2: 'partially',
  fin_3: 'partially',
  fin_4: 'fully',
  // Sus
  sus_1: 'fully',
  sus_2: 'partially',
  sus_3: 'not_sure',
  sus_4: 'partially'
};

