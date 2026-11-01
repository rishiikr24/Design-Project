namespace saas.transformation;

using { cuid, managed } from '@sap/cds/common';

entity Companies : cuid, managed {
  name        : String(100);
  industry    : String(50);
  employees   : Integer;
  itBudget    : Decimal(15,2);
  region      : String(50);
  assessments : Composition of many Assessments on assessments.company = $self;
  users       : Composition of many UserProfiles on users.company = $self;
}

entity UserProfiles : cuid, managed {
  username    : String(50);
  fullName    : String(100);
  email       : String(100);
  role        : String(20); // Admin, Manager, Analyst, Viewer
  company     : Association to Companies;
}

entity Assessments : cuid, managed {
  title               : String(150);
  company             : Association to Companies;
  infrastructure      : String(50); // On-premise, Hybrid, Colocated, Private Cloud
  growthRate          : Decimal(5,2); // percentage
  dataSensitivity     : String(20); // Low, Medium, High
  painPoints          : LargeString;
  targetCategory      : String(50); // CRM, ERP, HCM, ITSM, All
  readinessScore      : Decimal(5,2); // 0-100 overall TOE score
  toeTechScore        : Decimal(5,2);
  toeOrgScore         : Decimal(5,2);
  toeEnvScore         : Decimal(5,2);
  status              : String(20); // Draft, In Progress, Completed, Approved
  legacyApplications  : Composition of many LegacyApplications on legacyApplications.assessment = $self;
  requirements        : Composition of many Requirements on requirements.assessment = $self;
  evaluations         : Composition of many Evaluations on evaluations.assessment = $self;
  assessedRisks       : Composition of many AssessedRisks on assessedRisks.assessment = $self;
  migrationPlans      : Composition of many MigrationPlans on migrationPlans.assessment = $self;
  assistantMessages   : Composition of many AssistantMessages on assistantMessages.assessment = $self;
}

entity LegacyApplications : cuid, managed {
  assessment    : Association to Assessments;
  name          : String(100);
  function      : String(100);
  hosting       : String(50);
  criticality   : String(20); // Critical, High, Medium, Low
  userCount     : Integer;
  yearsInUse    : Integer;
}

entity Requirements : cuid, managed {
  assessment    : Association to Assessments;
  category      : String(50);
  description   : String(255);
  priority      : String(20); // Must Have, Nice to Have, Optional
}

entity SaaSProducts : managed {
  key ID                : String(50);
  name                  : String(100);
  vendor                : String(100);
  category              : String(50); // CRM, ERP, HCM, ITSM, Productivity, Analytics, Identity
  businessFunction      : String(150);
  pricingModel          : String(50); // Per User/Month, Tiered Subscription, Consumption-based
  costLevel             : String(20); // Low, Medium, High
  costScore             : Decimal(5,2); // 0 - 100 rating
  scalabilityRating     : String(20); // High, Very High, Enterprise
  scalabilityScore      : Decimal(5,2); // 0 - 100 rating
  securityRating        : String(100); // e.g. SOC2 Type II, ISO 27001, FedRAMP
  securityScore         : Decimal(5,2); // 0 - 100 rating
  integrationCapability : String(100); // e.g. OData V4, GraphQL, Webhooks, MuleSoft
  integrationScore      : Decimal(5,2); // 0 - 100 rating
  featuresScore         : Decimal(5,2); // 0 - 100 rating
  deploymentType        : String(50); // Multi-tenant Public Cloud, Private Cloud, Managed
  targetOrganisation    : String(50); // Enterprise, Mid-Market, Global Enterprise
  migrationComplexity   : String(20); // Low, Medium, High
  apiAvailable          : Boolean;
  status                : String(20); // Active, Retired
  description           : LargeString;
  capabilities          : Composition of many ProductCapabilities on capabilities.product = $self;
}

entity ProductCapabilities : cuid, managed {
  product               : Association to SaaSProducts;
  capabilityName        : String(100);
  capabilityDescription : String(255);
  maturity              : String(20);
}

entity Evaluations : cuid, managed {
  assessment            : Association to Assessments;
  evaluationDate        : DateTime;
  status                : String(20);
  weights               : Composition of one CriteriaWeights on weights.evaluation = $self;
  results               : Composition of many EvaluationResults on results.evaluation = $self;
}

entity CriteriaWeights : cuid, managed {
  evaluation            : Association to Evaluations;
  costWeight            : Decimal(5,2) default 20.0;
  securityWeight        : Decimal(5,2) default 30.0;
  scalabilityWeight     : Decimal(5,2) default 25.0;
  integrationWeight     : Decimal(5,2) default 15.0;
  featuresWeight        : Decimal(5,2) default 10.0;
}

entity EvaluationResults : cuid, managed {
  evaluation            : Association to Evaluations;
  product               : Association to SaaSProducts;
  totalScore            : Decimal(5,2);
  costSubScore          : Decimal(5,2);
  securitySubScore      : Decimal(5,2);
  scalabilitySubScore   : Decimal(5,2);
  integrationSubScore   : Decimal(5,2);
  featuresSubScore      : Decimal(5,2);
  rank                  : Integer;
  reason                : LargeString;
}

entity RiskTemplates : managed {
  key ID                : String(50);
  category              : String(50);
  riskTitle             : String(150);
  description           : LargeString;
  baseProbability       : Integer; // 1-5
  baseImpact            : Integer; // 1-5
  defaultMitigation     : LargeString;
}

entity AssessedRisks : cuid, managed {
  assessment            : Association to Assessments;
  template              : Association to RiskTemplates;
  riskTitle             : String(150);
  category              : String(50);
  probability           : Integer; // 1-5
  impact                : Integer; // 1-5
  score                 : Integer; // probability * impact (1-25)
  severity              : String(20); // Low, Medium, High, Critical
  mitigation            : LargeString;
  adjustedReason        : LargeString;
}

entity MigrationPlans : cuid, managed {
  assessment            : Association to Assessments;
  selectedProduct       : Association to SaaSProducts;
  title                 : String(150);
  totalPhases           : Integer default 8;
  overallProgress       : Decimal(5,2) default 0.0;
  startDate             : Date;
  targetEndDate         : Date;
  estimatedDurationMonths : Integer default 12;
  phases                : Composition of many MigrationPhases on phases.plan = $self;
}

entity MigrationPhases : cuid, managed {
  plan                  : Association to MigrationPlans;
  sequence              : Integer; // 1 to 8
  name                  : String(100);
  status                : String(20); // Not Started, In Progress, Completed, Blocked
  progress              : Integer default 0; // 0-100%
  startDate             : Date;
  endDate               : Date;
  deliverables          : LargeString;
  notes                 : LargeString;
  riskMitigationFocus   : LargeString;
}

entity AssistantMessages : cuid, managed {
  assessment            : Association to Assessments;
  sender                : String(20); // user, assistant
  messageText           : LargeString;
  timestamp             : DateTime;
}
