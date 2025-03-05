import { GroqService } from './models/GroqService';
import { OllamaService } from './models/OllamaService';

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

  constructor() {
    this.groqService = new GroqService();
  }

  async generateInterview(context: InterviewContext): Promise<BatchInterviewResult> {
    const systemPrompt = `Generate a complete product research interview simulation.

PROJECT CONTEXT
Name: ${context.projectName}
Goals: ${context.objectives.join(', ')}
Target Audience: ${context.targetAudience}

Key Questions to Cover:
${context.questions.map(q => `- ${q.question}`).join('\n')}

REQUIREMENTS:
1. Generate a natural conversation between interviewer and participant
2. Cover all questions while maintaining flow
3. Include relevant follow-up questions
4. Keep responses concise and realistic
5. End with a proper wrap-up
6. Provide key insights from the conversation

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

    try {
      const response = await this.groqService.generateResponse(systemPrompt);
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
      
      // Validate structure
      if (!Array.isArray(result.messages) || !result.insights) {
        throw new Error('Invalid response structure');
      }

      return result;
    } catch (error) {
      console.error('Failed to parse interview response:', error);
      throw new Error('Failed to parse interview response');
    }
  }
}

export default new BatchInterviewService();
