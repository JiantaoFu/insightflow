import { BaseModelService, ModelResponse, ModelMessage } from './BaseModelService';
import axios from 'axios';

export class OllamaService extends BaseModelService {
  private apiUrl = 'http://localhost:11434/v1/chat/completions';

  async generateResponse(systemPrompt: string, messages: ModelMessage[] = []): Promise<ModelResponse> {
    try {
      // Format messages as a JSON array
      const formattedMessages = [
        { role: 'system', content: systemPrompt },
        ...messages
      ];

      console.log(JSON.stringify(formattedMessages, null, 2));

      const response = await axios.post(this.apiUrl, {
        model: 'deepseek-r1:latest',
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 4096
      }, {
        headers: {
          'Authorization': `Bearer OLLAMA_API_KEY`,
          'Content-Type': 'application/json',
        }
      });

      return {
        content: response.data.choices[0].message.content
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
