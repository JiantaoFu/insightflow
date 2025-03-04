import { BaseModelService, ModelResponse } from './BaseModelService';
import axios from 'axios';

export class OllamaService extends BaseModelService {
  private apiUrl = 'http://localhost:11434/api/generate';

  async generateResponse(systemPrompt: string, userPrompt?: string): Promise<ModelResponse> {
    try {
      // Combine prompts for Ollama since it doesn't support system messages directly
      const combinedPrompt = `System: ${systemPrompt}\n\n${userPrompt || ''}`;
      
      const response = await axios.post(this.apiUrl, {
        model: 'deepseek-r1:latest',
        prompt: combinedPrompt,
        stream: false,
        options: {
          temperature: 0.7,
          max_tokens: 4096  // Increased from 1000 to 4096
        }
      });

      return {
        content: response.data.response
      };
    } catch (error) {
      console.error('Ollama API error:', error);
      return {
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}
