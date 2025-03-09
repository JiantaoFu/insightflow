import { GroqService } from './models/GroqService';
import { OllamaService } from './models/OllamaService';
import { OpenAIService } from './models/OpenAIService';
import { BaseModelService } from './models/BaseModelService';

interface ProjectIdea {
  idea: string;
}

interface AnalysisResult {
  names: string[];
  audiences: string[];
  objectives: string[];
}

class ProjectAnalysisService {
  private groqService: GroqService;
  private ollamaService: OllamaService;
  private openAIService: OpenAIService;
  private preferredModel: 'ollama' | 'groq' | 'openai';
  private defaultTemplate: string;

  private static readonly DEFAULT_TEMPLATE = `You are an expert Product-Market Fit consultant. Analyze this project idea and provide suggestions.

Project Idea:
{{context.idea}}

Provide analysis in this exact JSON format:
{
  "names": [
    "3-4 suggested project names that are memorable and relevant"
  ],
  "audiences": [
    "4-6 specific target audience segments, be very specific"
  ],
  "objectives": [
    "4-5 key research objectives to validate with interviews"
  ]
}

Requirements:
1. Project names should be concise and memorable
2. Audiences should be specific segments, not broad categories
3. Objectives should be clear, measurable goals
4. Use professional, business-oriented language
5. Focus on validation and learning opportunities

Respond ONLY with the JSON object, no other text.
`;

  constructor() {
    this.groqService = new GroqService();
    this.ollamaService = new OllamaService();
    this.openAIService = new OpenAIService();
    this.preferredModel = (import.meta.env.VITE_PREFERRED_MODEL as 'ollama' | 'groq' | 'openai') || 'groq';
    // Default template that can be customized
    this.defaultTemplate = ProjectAnalysisService.DEFAULT_TEMPLATE;
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
    return this.defaultTemplate;
  }

  // Set a custom template
  setTemplate(template: string) {
    if (template && template.trim()) {
      this.defaultTemplate = template;
    }
  }

  // Reset to the original default template
  resetTemplate() {
    this.defaultTemplate = ProjectAnalysisService.DEFAULT_TEMPLATE;
  }

  async analyzeProject(project: ProjectIdea, customTemplate?: string): Promise<AnalysisResult> {
    const prompt = this.constructPrompt(project, customTemplate);
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const service = this.getService();
        const response = await service.generateResponse(prompt);

        if (response.error) {
          throw new Error(`Model error: ${response.error}`);
        }

        const result = this.extractJsonFromResponse(response.content);
        if (result && this.isValidAnalysis(result)) {
          return result;
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

    throw new Error(`Failed to analyze project after 3 attempts. ${lastError?.message}`);
  }

  private constructPrompt(project: ProjectIdea, customTemplate?: string): string {
    const template = customTemplate || this.defaultTemplate;

    // Replace placeholders with actual values
    return template.replace(/\{\{context\.idea\}\}/g, project.idea);
  }

  private extractJsonFromResponse(response: string): any {
    try {
      return JSON.parse(response);
    } catch {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      return JSON.parse(jsonMatch[0]);
    }
  }

  private isValidAnalysis(result: any): result is AnalysisResult {
    return (
      Array.isArray(result.names) && result.names.length > 0 &&
      Array.isArray(result.audiences) && result.audiences.length > 0 &&
      Array.isArray(result.objectives) && result.objectives.length > 0
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new ProjectAnalysisService();