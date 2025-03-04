import { BaseModelService, ModelResponse } from './BaseModelService';
import axios from 'axios';

export class OpenAIService extends BaseModelService {
  private apiKey: string;
  private apiUrl = 'https://api.openai.com/v1/chat/completions';

  constructor() {
    super();
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!this.apiKey) {
      throw new Error('OpenAI API key is not defined in environment variables');
    }
  }

  async generateResponse(systemPrompt: string, userPrompt?: string): Promise<ModelResponse> {
    try {
      const messages = [
        {
          role: "system",
          content: systemPrompt
        }
      ];

      if (userPrompt) {
        messages.push({
          role: "user",
          content: userPrompt
        });
      }

      const response = await axios.post(
        this.apiUrl,
        {
          model: "gpt-4o-mini",
          messages,
          temperature: 0.7,
          max_tokens: 16380,
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
      console.error('OpenAI API error:', error);
      return {
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}