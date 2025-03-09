import { GroqService } from './models/GroqService';
import { OllamaService } from './models/OllamaService';
import { OpenAIService } from './models/OpenAIService';
import { BaseModelService } from './models/BaseModelService';

interface QuestionGenerationContext {
  objective: string;
  targetInterviewee: string;
  domain: string;
}

interface Question {
  id?: string;
  text: string;
  category: string;
}

class QuestionGenerationService {
  private groqService: GroqService;
  private ollamaService: OllamaService;
  private openAIService: OpenAIService;
  private preferredModel: 'ollama' | 'groq' | 'openai';
  private promptTemplate: string;

  // Define the default template as a static readonly property
  private static readonly DEFAULT_TEMPLATE = `You are an expert Product-Market Fit (PMF) interview question generator.

Context:
- Objective: {{context.objective}}
- Target Interviewee: {{context.targetInterviewee}}
- Domain: {{context.domain}}

Generate 5-7 open-ended interview questions that:
1. Explore background and context
2. Uncover current challenges
3. Understand existing solutions
4. Probe potential new solutions
5. Assess willingness to adopt

Provide questions in this JSON format:
[
  {"id": "q1", "text": "Question text", "category": "background"},
  ...
]`;

  constructor() {
    this.groqService = new GroqService();
    this.ollamaService = new OllamaService();
    this.openAIService = new OpenAIService();
    this.preferredModel = (import.meta.env.VITE_PREFERRED_MODEL as 'ollama' | 'groq' | 'openai') || 'groq';

    // Initialize with the default template
    this.promptTemplate = QuestionGenerationService.DEFAULT_TEMPLATE;
  }

  private getService(): BaseModelService {
    switch (this.preferredModel) {
      case 'groq':
        return this.groqService;
      case 'openai':
        return this.openAIService;
      default:
        return this.ollamaService;
    }
  }

  setModel(model: 'ollama' | 'groq' | 'openai') {
    this.preferredModel = model;
  }

  // Get the current template
  getTemplate(): string {
    return this.promptTemplate;
  }

  // Set a custom template
  setTemplate(template: string) {
    if (template && template.trim()) {
      this.promptTemplate = template;
    }
  }

  // Reset to the original default template
  resetTemplate() {
    this.promptTemplate = QuestionGenerationService.DEFAULT_TEMPLATE;
  }

  async generateQuestions(context: QuestionGenerationContext, customTemplate?: string): Promise<Question[]> {
    const prompt = this.constructPrompt(context, customTemplate);
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const service = this.getService();
        const response = await service.generateResponse(prompt);

        if (response.error) {
          throw new Error(`Model error: ${response.error}`);
        }

        const result = this.extractJsonFromResponse(response.content);
        if (result && Array.isArray(result)) {
          return result.map((q, i) => ({
            id: q.id || `gen-${i}`,
            text: q.text,
            category: q.category || 'general'
          }));
        }

        console.log(`Attempt ${attempt + 1}: Invalid response format, retrying...`);
        await this.delay(1000);
        continue;

      } catch (error) {
        lastError = error as Error;
        console.log(`Attempt ${attempt + 1} failed:`, error);
        await this.delay(1000);
      }
    }

    throw new Error(`Failed to generate questions after 3 attempts. ${lastError?.message}`);
  }

  private constructPrompt(context: QuestionGenerationContext, customTemplate?: string): string {
    const template = customTemplate || this.promptTemplate;

    // Replace placeholders with actual values
    return template
      .replace(/\{\{context\.objective\}\}/g, context.objective)
      .replace(/\{\{context\.targetInterviewee\}\}/g, context.targetInterviewee)
      .replace(/\{\{context\.domain\}\}/g, context.domain);
  }

  private extractJsonFromResponse(response: string): any {
    try {
      return JSON.parse(response);
    } catch {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      return JSON.parse(jsonMatch[0]);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new QuestionGenerationService();