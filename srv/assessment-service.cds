using { saas.transformation as my } from '../db/schema';

service AssessmentService @(path: '/odata/v4/assessment') {
  entity Companies as projection on my.Companies;
  entity Assessments as projection on my.Assessments;
  entity LegacyApplications as projection on my.LegacyApplications;
  entity Requirements as projection on my.Requirements;

  action calculateReadiness(assessmentId: UUID) returns {
    readinessScore: Decimal(5,2);
    toeTechScore: Decimal(5,2);
    toeOrgScore: Decimal(5,2);
    toeEnvScore: Decimal(5,2);
    readinessLevel: String;
  };
}
