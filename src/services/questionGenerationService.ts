// src/services/questionGenerationService.ts
import axios from 'axios';

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

class QuestionGenerationService {
  private ollamaApiUrl = 'http://localhost:11434/api/generate';
  private maxRetries = 3;
  private retryDelay = 1000; // 1 second

  async generateInterviewQuestions(context: InterviewContext): Promise<GeneratedQuestion[]> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const response = await axios.post(this.ollamaApiUrl, {
          model: 'deepseek-r1:latest',
          prompt: this.constructPrompt(context),
          stream: false,
          options: {
            temperature: 0.7,
            max_tokens: 500
          }
        });

        const questions = this.extractJsonFromResponse(response.data.response);
        if (questions && questions.length > 0) {
          return questions;
        }

        // If we got a response but couldn't parse questions, try again
        console.log(`Attempt ${attempt + 1}: Invalid response format, retrying...`);
        await this.delay(this.retryDelay);
        continue;

      } catch (error) {
        lastError = error as Error;
        console.log(`Attempt ${attempt + 1} failed:`, error);
        await this.delay(this.retryDelay);
      }
    }

    throw new Error(`Failed to generate questions after ${this.maxRetries} attempts. ${lastError?.message}`);
  }

  private constructPrompt(context: InterviewContext): string {
    return `
    You are an expert Product-Market Fit (PMF) interview question generator.

    Here are examples of well-structured interview questions with their purposes:
    1. Q: "What problem were you trying to solve when you found our product?"
       Purpose: "Understand the initial user pain point"
    2. Q: "How are you currently solving this problem?"
       Purpose: "Learn about existing alternatives and workflows"
    3. Q: "What would make this product a must-have for you?"
       Purpose: "Identify key features and value propositions"

    Context for generating new questions:
    - Objective: ${context.objective}
    - Target Interviewee: ${context.targetInterviewee}
    - Domain: ${context.domain}

    Generate 5-7 interview questions following these principles:
    1. Each question should be open-ended and conversation-starting
    2. Include a clear purpose/description for each question
    3. Follow a logical flow: problem → current solutions → needs → opportunities
    4. Focus on uncovering real user behaviors and pain points
    5. Avoid leading questions or assumptions

    Respond ONLY with a JSON array in this exact format:
    [
      {
        "id": "q1",
        "text": "What specific challenges do you face when...",
        "category": "Clear, concise purpose of this question"
      }
    ]

    Make each question as specific and relevant as possible to the given context.
    `;
  }

  private extractJsonFromResponse(response: string): GeneratedQuestion[] {
    try {
      // First try direct JSON parse
      try {
        return JSON.parse(response);
      } catch {
        // If direct parse fails, try to find JSON in the response
        const jsonMatch = response.match(/\[\s*\{.*?\}\s*\]/s);
        if (!jsonMatch) {
          throw new Error('No JSON found in response');
        }
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      throw new Error('Failed to parse questions from AI response');
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new QuestionGenerationService();