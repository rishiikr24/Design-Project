namespace saas.transformation;

using { saas.transformation as my } from './schema';

view TransformationOverview as select from my.Assessments as a {
  key a.ID as assessmentId,
  a.title as assessmentTitle,
  a.company.ID as companyId,
  a.company.name as companyName,
  a.infrastructure,
  a.readinessScore,
  a.toeTechScore,
  a.toeOrgScore,
  a.toeEnvScore,
  a.status as assessmentStatus,
  count(distinct a.legacyApplications.ID) as legacyAppCount : Integer,
  count(distinct a.assessedRisks.ID) as riskCount : Integer
} group by a.ID, a.title, a.company.ID, a.company.name, a.infrastructure, a.readinessScore, a.toeTechScore, a.toeOrgScore, a.toeEnvScore, a.status;

view RiskDistribution as select from my.AssessedRisks {
  key ID,
  assessment.ID as assessmentId,
  severity,
  count(ID) as countBySeverity : Integer
} group by ID, assessment.ID, severity;
