export interface ModelMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ModelResponse {
  content: string;
  error?: string;
}

export abstract class BaseModelService {
  abstract generateResponse(systemPrompt: string, messages?: ModelMessage[]): Promise<ModelResponse>;
}
