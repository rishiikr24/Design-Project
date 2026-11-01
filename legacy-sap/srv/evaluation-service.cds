using { saas.transformation as my } from '../db/schema';

service EvaluationService @(path: '/odata/v4/evaluation') {
  entity Evaluations as projection on my.Evaluations;
  entity EvaluationResults as projection on my.EvaluationResults;
  entity CriteriaWeights as projection on my.CriteriaWeights;

  type WeightInput {
    cost: Decimal(5,2);
    security: Decimal(5,2);
    scalability: Decimal(5,2);
    integration: Decimal(5,2);
    features: Decimal(5,2);
  };

  action evaluate(assessmentId: UUID, weights: WeightInput) returns array of EvaluationResults;
}
