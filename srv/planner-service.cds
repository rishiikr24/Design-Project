using { saas.transformation as my } from '../db/schema';

service PlannerService @(path: '/odata/v4/planner') {
  entity MigrationPlans as projection on my.MigrationPlans;
  entity MigrationPhases as projection on my.MigrationPhases;

  action generatePlan(assessmentId: UUID, productId: String) returns MigrationPlans;
  action updatePhase(phaseId: UUID, status: String, progress: Integer) returns MigrationPhases;
}
