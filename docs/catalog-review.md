# SaaS Catalog Ratings Review & Justification Audit

> **Source File:** `legacy-sap/db/data/saas.transformation-SaaSProducts.csv`  
> **Status:** Step S4 Review  
> **Evaluation Dimensions:** Cost (20%), Security (30%), Scalability (25%), Integration (15%), Features (10%)

---

## 1. Product Ratings Table

| ID | Product Name | Vendor | Category | Cost Rating / Score | Security Rating / Score | Scalability Rating / Score | Integration Score | Features Score | Migration Complexity | Potential Anomalies & Audit Observations | Source (User to fill) |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- | :--- |
| `salesforce-crm` | Salesforce Sales Cloud | Salesforce | CRM | High / 68.0 | SOC2 Type II, ISO 27001, FedRAMP High / 94.0 | Enterprise / 95.0 | 92.0 | 96.0 | Medium | High premium pricing justifies lower Cost score (68.0). High feature maturity (96.0). Migration complexity Medium could arguably be High for deep enterprise customizations. | |
| `ms-dynamics-365` | Microsoft Dynamics 365 | Microsoft | CRM | Medium / 78.0 | FedRAMP, ISO 27001, HIPAA, SOC 1-3 / 92.0 | Very High / 90.0 | 90.0 | 91.0 | Medium | Balanced score. Strong integration with Power Platform and Azure Dataverse. | |
| `sap-cloud-erp` | SAP S/4HANA Cloud | SAP | ERP | High / 65.0 | ISO 27001, SOC 1-2, C5, BSI / 96.0 | Enterprise / 98.0 | 95.0 | 98.0 | High | Cost score (65.0) reflects enterprise implementation expenses. Scalability (98.0) and Security (96.0) align with sovereign cloud benchmarks. | |
| `oracle-fusion-erp` | Oracle Fusion Cloud ERP | Oracle | ERP | High / 70.0 | FedRAMP, ISO 27001, SOC 2, HIPAA / 93.0 | Enterprise / 94.0 | 88.0 | 93.0 | High | Integration score (88.0) is slightly lower than SAP/Salesforce, reflecting steeper learning curve for OIC outside Oracle ecosystems. | |
| `workday-hcm` | Workday HCM | Workday | HCM | Medium / 75.0 | SOC 1-3, ISO 27001, CSA STAR / 95.0 | Very High / 92.0 | 87.0 | 94.0 | Medium | Integration capability (87.0) is relatively conservative given Workday's Enterprise Interface Builder (EIB) and REST/SOAP APIs. | |
| `servicenow-itsm` | ServiceNow IT Service Management | ServiceNow | ITSM | Medium / 74.0 | FedRAMP, SOC 1-2, ISO 27001, DoD IL4 / 95.0 | Enterprise / 96.0 | 94.0 | 95.0 | Medium | High compliance rating (DoD IL4) justifies 95.0 Security. IntegrationHub workflows justify 94.0 Integration. | |
| `jira-cloud` | Atlassian Jira Software | Atlassian | Productivity | Low / 90.0 | SOC 2, ISO 27001, GDPR / 88.0 | High / 86.0 | 89.0 | 88.0 | Low | **Observation:** Scalability is rated "High" (86.0) while others are "Enterprise"/"Very High". Cost fit is high (90.0) reflecting accessible per-seat pricing. | |
| `microsoft-365` | Microsoft 365 Enterprise | Microsoft | Productivity | Low / 88.0 | FedRAMP High, ISO 27001, HIPAA, SOC2 / 96.0 | Enterprise / 98.0 | 92.0 | 95.0 | Low | Very high composite scores (98.0 scale, 96.0 security) reflecting global hyperscaler infrastructure. | |
| `ms-power-bi` | Microsoft Power BI | Microsoft | Analytics | Low / 92.0 | ISO 27001, SOC2, HIPAA, FedRAMP / 91.0 | Enterprise / 92.0 | 91.0 | 92.0 | Low | Highest cost fit score in catalog (92.0) due to low entry-level licensing (Pro/Premium per user). | |
| `ms-entra-id` | Microsoft Entra ID | Microsoft | Identity | Low / 89.0 | FedRAMP High, ISO 27001, SOC 1-3, CSA / 98.0 | Enterprise / 99.0 | 96.0 | 94.0 | Medium | Highest scalability score (99.0) and security score (98.0) across all catalog entries, reflecting critical global identity tier. | |

---

## 2. Inconsistencies & Observations for Review

1. **Inverted Cost Scale (Higher = Better / More Affordable):**
   - In standard enterprise scoring, a higher score represents a favorable condition. Here, products with "Low" cost (Jira, Power BI, Entra ID) have **high scores** (88-92), whereas products with "High" cost (SAP, Salesforce, Oracle) have **lower scores** (65-70). This is mathematically consistent for weighted maximization, but should be clearly labeled as **"Cost Fit / Affordability Rating"** rather than "Cost Level".
2. **Category Diversity:**
   - 4 out of 10 products are from Microsoft (`ms-dynamics-365`, `microsoft-365`, `ms-power-bi`, `ms-entra-id`). While representative of enterprise Microsoft estates, third-party alternatives (e.g. Okta for Identity, Tableau for Analytics, Google Workspace for Productivity) could be added in future catalog expansions.
3. **Migration Complexity vs. Integration Score:**
   - `sap-cloud-erp` has Migration Complexity = "High", yet an Integration Score of 95.0. This indicates strong integration capabilities via BTP/OData, but high effort for data migration/cutover from on-premise systems.
