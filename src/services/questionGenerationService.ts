// src/services/questionGenerationService.ts
import axios from 'axios';
import { GroqService } from './models/GroqService';
import { OllamaService } from './models/OllamaService';
import { OpenAIService } from './models/OpenAIService';
import { BaseModelService } from './models/BaseModelService';

interface InterviewContext {
  objective: string;
  targetInterviewee: string;
  domain: string;
}

interface GeneratedQuestion {
  id: string;
  text: string;
  category: string;
}

interface GenerateQuestionsRequest {
  objective: string;
  targetInterviewee: string;
  domain: string;
}

class QuestionGenerationService {
  private groqService: GroqService;
  private ollamaService: OllamaService;
  private openAIService: OpenAIService;
  private preferredModel: 'ollama' | 'groq' | 'openai';

  constructor() {
    this.groqService = new GroqService();
    this.ollamaService = new OllamaService();
    this.openAIService = new OpenAIService();
    this.preferredModel = (import.meta.env.VITE_PREFERRED_MODEL as 'ollama' | 'groq' | 'openai') || 'groq';
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

  async generateInterviewQuestions(request: GenerateQuestionsRequest) {
    const prompt = this.constructPrompt(request);
    
    try {
      const service = this.getService();
      const response = await service.generateResponse(prompt);

      if (response.error) {
        throw new Error(`Model error: ${response.error}`);
      }

      return this.extractJsonFromResponse(response.content);
    } catch (error) {
      console.error('Failed to generate questions:', error);
      throw new Error('Failed to generate interview questions');
    }
  }

  private constructPrompt(context: InterviewContext): string {
    return `
    You are an expert Product-Market Fit (PMF) interview question generator.

    Context:
    - Objective: ${context.objective}
    - Target Interviewee: ${context.targetInterviewee}
    - Domain: ${context.domain}

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
    ]
    `;
  }

  private extractJsonFromResponse(response: string): GeneratedQuestion[] {
    try {
      // Find the JSON part of the response (everything between [ and ])
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const jsonStr = jsonMatch[0];
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      throw new Error('Failed to parse questions from AI response');
    }
  }
}

export default new QuestionGenerationService();