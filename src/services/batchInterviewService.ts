import { GroqService } from './models/GroqService';
import { OllamaService } from './models/OllamaService';
import { OpenAIService } from './models/OpenAIService';
import { BaseModelService } from './models/BaseModelService';

interface InterviewContext {
  projectName: string;
  objectives: string[];
  targetAudience: string;
  questions: Array<{
    question: string;
    purpose: string;
  }>;
}

interface SimulatedMessage {
  role: 'interviewer' | 'interviewee';
  content: string;
}

interface BatchInterviewResult {
  messages: SimulatedMessage[];
  insights: {
    keyFindings: string[];
    recommendations: string[];
  };
}

class BatchInterviewService {
  private groqService: GroqService;
  private ollamaService: OllamaService;
  private openAIService: OpenAIService;
  private preferredModel: 'ollama' | 'groq' | 'openai';
  private static readonly DEFAULT_BATCH_INTERVIEW_TEMPLATE = `Generate a complete product research interview simulation.

PROJECT CONTEXT
Name: {{context.projectName}}
Goals: {{context.objectives}}
Target Audience: {{context.targetAudience}}

QUESTIONS TO COVER:
{{context.questions}}

REQUIREMENTS:
1. Generate a natural conversation between interviewer and participant
2. Cover all questions while maintaining flow
3. Include relevant follow-up questions
4. Keep responses concise and realistic
5. End with a proper wrap-up
6. NEVER include meta-commentary, notes to yourself, or explanations in parentheses
7. DO NOT include phrases like "Note:" or explanations about your reasoning

OUTPUT FORMAT:
{
  "messages": [
    {"role": "interviewer", "content": "message"},
    {"role": "interviewee", "content": "message"}
  ],
  "insights": {
    "keyFindings": ["finding 1", "finding 2"],
    "recommendations": ["recommendation 1", "recommendation 2"]
  }
}`;

  private batchInterviewTemplate: string;

  constructor() {
    this.groqService = new GroqService();
    this.ollamaService = new OllamaService();
    this.openAIService = new OpenAIService();
    this.preferredModel = (import.meta.env.VITE_PREFERRED_MODEL as 'ollama' | 'groq' | 'openai') || 'groq';
    this.batchInterviewTemplate = BatchInterviewService.DEFAULT_BATCH_INTERVIEW_TEMPLATE;
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

  getBatchInterviewTemplate(): string {
    return this.batchInterviewTemplate;
  }

  setBatchInterviewTemplate(template: string): void {
    this.batchInterviewTemplate = template;
  }

  resetBatchInterviewTemplate(): void {
    this.batchInterviewTemplate = BatchInterviewService.DEFAULT_BATCH_INTERVIEW_TEMPLATE;
  }

  async generateInterview(context: InterviewContext): Promise<BatchInterviewResult> {
    const systemPrompt = this.batchInterviewTemplate
      .replace('{{context.projectName}}', context.projectName)
      .replace('{{context.objectives}}', context.objectives.join(', '))
      .replace('{{context.targetAudience}}', context.targetAudience)
      .replace('{{context.questions}}', context.questions.map(q => `- ${q.question}`).join('\n'));

    try {
      const service = this.getService();
      const response = await service.generateResponse(systemPrompt);
      return this.parseResponse(response.content);
    } catch (error) {
      console.error('Failed to generate interview:', error);
      throw new Error('Interview generation failed');
    }
  }

  private parseResponse(response: string): BatchInterviewResult {
    try {
      // Find JSON in response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No valid JSON found in response');
      
      const result = JSON.parse(jsonMatch[0]);
      
      // Map the roles to our internal format
      return {
        messages: result.messages.map((m: any) => ({
          role: m.role,
          content: m.content
        })),
        insights: result.insights
      };
    } catch (error) {
      console.error('Failed to parse interview response:', error);
      throw new Error('Failed to parse interview response');
    }
  }
}

export default new BatchInterviewService();
