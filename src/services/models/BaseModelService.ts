export interface ModelResponse {
  content: string;
  error?: string;
}

export abstract class BaseModelService {
  abstract generateResponse(systemPrompt: string, userPrompt?: string): Promise<ModelResponse>;
}
