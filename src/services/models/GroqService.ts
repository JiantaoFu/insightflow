import { BaseModelService, ModelResponse, ModelMessage } from './BaseModelService';
import axios from 'axios';

export class GroqService extends BaseModelService {
  private apiKey: string;
  private apiUrl = 'https://api.groq.com/openai/v1/chat/completions';

  constructor() {
    super();
    this.apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!this.apiKey) {
      throw new Error('GROQ API key is not defined in environment variables');
    }
  }

  async generateResponse(systemPrompt: string, messages: ModelMessage[] = []): Promise<ModelResponse> {
    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: "mixtral-8x7b-32768",
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages
          ],
          temperature: 0.7,
          max_tokens: 32768,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          }
        }
      );

      return {
        content: response.data.choices[0].message.content
      };
    } catch (error) {
      console.error('Groq API error:', error);
      return {
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}
