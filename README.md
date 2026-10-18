# Enterprise Transformation Framework for Scalable SaaS Adoption

This repository hosts an SAP-based decision-support platform designed to guide enterprises through scalable SaaS adoption and digital business evolution. The framework addresses the challenges of multi-SaaS integration, cost, security, and migration planning by providing a unified workflow for evaluating platforms like Microsoft 365, Salesforce, SAP solutions, and ServiceNow.

## Tech Stack
- **Cloud Platform:** SAP Business Technology Platform (BTP)
- **Frontend:** SAPUI5 / SAP Fiori / Vanilla Web UI
- **Backend:** SAP Cloud Application Programming Model (CAP) Node.js
- **Database:** SAP HANA Cloud / SQLite (Local Development)
- **Development & Testing:** SAP Business Application Studio, Node.js, Git/GitHub, Postman

## Core Modules & Features
- **Enterprise Assessment:** Captures current IT systems, company size, budget, security requirements, and integration needs.
- **SaaS Evaluation Engine:** Compares cataloged SaaS products using a transparent weighted scoring model based on cost (20%), security (30%), scalability (25%), integration (15%), and features (10%).
- **Cost & Risk Analysis:** Assesses migration complexity, security risks, integration challenges, and vendor dependency.
- **Recommendation & Transformation Planner:** Generates a compatibility score with justifications, and creates a phased transformation roadmap moving from assessment to pilot, data migration, integration, deployment, and monitoring.
- **Interactive Dashboard:** A centralized report presenting readiness scores, recommended SaaS options, overall risk levels, and the complete migration roadmap.

## Project Structure
```text
├── app/
│   ├── approuter/            # Application router configuration
│   └── saas-ui/              # Frontend web application
├── db/
│   ├── data/                 # Seed data (SaaS products, risk templates, user profiles)
│   ├── schema.cds            # Database entity definitions
│   └── views.cds             # Analytical and projection views
├── srv/
│   ├── assessment-service.*  # Enterprise assessment service
│   ├── evaluation-service.*  # SaaS evaluation and scoring service
│   ├── planner-service.*     # Migration roadmap and transformation planner
│   ├── risk-service.*        # Risk evaluation service
│   ├── dashboard-service.*   # Unified metrics and dashboard service
│   └── lib/                  # Scoring algorithms and recommendation rules
├── test/                     # Unit and integration test suites
├── mta.yaml                  # Multi-Target Application deployment descriptor
├── server.js                 # Custom server bootstrap
└── package.json              # Dependencies and scripts
```

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation
```bash
# Clone the repository
git clone https://github.com/rishiikr24/Design-Project.git
cd Design-Project

# Install dependencies
npm install
```

### Database Deployment & Local Run
```bash
# Deploy data models and seed data to local SQLite database
npm run deploy

# Start the application server
npm start
```
The server will start at `http://localhost:4004` (or your configured port).

### Running Tests
```bash
npm test
```

## Project Context
This system was developed as part of the **E1CSA313/E1ITA306 Design Project - 1** at Alliance University.

- **Team Members:** Rishi Kumar, Aarushi Joshi, Pradyumn Bisen, Akshyadevi K
- **Mentor:** Dr. T Prashant
