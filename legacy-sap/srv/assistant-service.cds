using { saas.transformation as my } from '../db/schema';

service AssistantService @(path: '/odata/v4/assistant') {
  entity AssistantMessages as projection on my.AssistantMessages;

  action askAssistant(assessmentId: UUID, question: String) returns {
    answer: LargeString;
    category: String;
  };
}
