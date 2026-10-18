using { saas.transformation as my } from '../db/schema';

service RiskService @(path: '/odata/v4/risk') {
  @readonly entity RiskTemplates as projection on my.RiskTemplates;
  entity AssessedRisks as projection on my.AssessedRisks;

  action assessRisks(assessmentId: UUID) returns array of AssessedRisks;
}
