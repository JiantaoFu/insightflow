import { BaseModelService, ModelResponse, ModelMessage } from './BaseModelService';
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

  async generateResponse(systemPrompt: string, messages: ModelMessage[] = []): Promise<ModelResponse> {
    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];
    console.log('OpenAIService - Formatted messages:', JSON.stringify(formattedMessages, null, 2));

    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: "gpt-4o-mini",
          messages: formattedMessages,
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

      console.log('OpenAIService - Response:', response.data.choices[0].message.content);
      return {
        content: response.data.choices[0].message.content
      };
    } catch (error) {
      console.error('OpenAIService - Error:', error);
      return {
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}