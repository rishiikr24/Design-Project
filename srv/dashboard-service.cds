using { saas.transformation as my } from '../db/views';
using { saas.transformation as schema } from '../db/schema';

service DashboardService @(path: '/odata/v4/dashboard') {
  @readonly entity TransformationOverview as projection on my.TransformationOverview;
  @readonly entity RiskDistribution as projection on my.RiskDistribution;

  function getMetrics(assessmentId: UUID) returns {
    readinessScore: Decimal(5,2);
    toeTechScore: Decimal(5,2);
    toeOrgScore: Decimal(5,2);
    toeEnvScore: Decimal(5,2);
    legacyCount: Integer;
    overallRiskLevel: String;
    migrationProgress: Decimal(5,2);
    topProduct: String;
    topScore: Decimal(5,2);
    adoptionRate: Decimal(5,2);
    costEfficiency: Decimal(5,2);
    licenseUtilization: Decimal(5,2);
  };
}
