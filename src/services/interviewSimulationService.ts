import { OllamaService } from './models/OllamaService';
import { GroqService } from './models/GroqService';
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

interface InterviewPersona {
  role: 'interviewer' | 'participant';
  background: string;
}

interface Message {
  role: string;
  content: string;
}

interface ModelResponse {
  content: string;
  error?: string;
}

interface InterviewResponse {
  content: string;
  state: 'ongoing' | 'wrapping_up' | 'completed';
}

class InterviewSimulationService {
  private ollamaService: OllamaService;
  private groqService: GroqService;
  private openAIService: OpenAIService;
  private preferredModel: 'ollama' | 'groq' | 'openai' = 'groq';

  constructor() {
    this.ollamaService = new OllamaService();
    this.groqService = new GroqService();
    this.openAIService = new OpenAIService();
  }

  setModel(model: 'ollama' | 'groq' | 'openai') {
    this.preferredModel = model;
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

  async conductInterview(
    context: InterviewContext,
    persona: InterviewPersona,
    messages: Message[]
  ): Promise<InterviewResponse> {
    const { systemPrompt, messages: chatMessages } = this.constructPrompts(context, persona, messages);
    
    try {
      const service = this.getService();
      const response = await service.generateResponse(systemPrompt, chatMessages);

          // Handle model errors first
      if (response.error) {
        throw new Error(`Model error: ${response.error}`);
      }

      // Validate content exists
      if (!response.content?.trim()) {
        throw new Error('Empty response received from language model');
      }

      // console.log('Interview response:', response.content);
      
      // Extract the AI's assessment of the current state and the actual content
      const { state, content } = this.extractStateAndContent(response.content);

      console.log('Interview state:', state);
      
      return {
        content,
        state
      };
    } catch (error) {
      console.error('Interview simulation failed:', error);
      throw new Error('Failed to generate interview response');
    }
  }

  private extractStateAndContent(fullResponse: string): { state: 'ongoing' | 'wrapping_up' | 'completed', content: string } {
    // Default state
    let state: 'ongoing' | 'wrapping_up' | 'completed' = 'ongoing';
    let content = fullResponse;
    
    // Look for state markers in the response using regex to handle markers anywhere in text
    const wrappingUpMatch = content.match(/\[\[STATE:WRAPPING_UP\]\]/);
    const completedMatch = content.match(/\[\[STATE:COMPLETED\]\]/);
    
    content = content.replace(/\[\[STATE:COMPLETED\]\]/g, '');
    content = content.replace(/\[\[STATE:WRAPPING_UP\]\]/g, '');

    if (completedMatch) {
      state = 'completed';
    } else if (wrappingUpMatch) {
      state = 'wrapping_up';
    }
    
    // Clean up the content
    content = this.cleanResponse(content);
    
    return { state, content };
  }
  
  private cleanResponse(response: string): string {
    return response
      // Remove thinking sections
      .replace(/<think>[\s\S]*?<\/think>/g, '')
      .trim();
  }

  private constructPrompts(
    context: InterviewContext,
    persona: InterviewPersona,
    messages: Message[]
  ): { systemPrompt: string; messages: ModelMessage[] } {
    const systemPrompt = `You are participating in a product research interview about ${context.projectName}.` +
      (persona.role === 'interviewer' ? 
        this.constructInterviewerPrompt(context) : 
        this.constructParticipantPrompt(persona, context));

    // Convert each message to role/content pair
    const formattedMessages: ModelMessage[] = messages.map(m => ({
      role: m.role === persona.role ? 'assistant' : 'user',
      content: m.content
    }));

    return { 
      systemPrompt, 
      messages: formattedMessages 
    };
  }

  private constructInterviewerPrompt(context: InterviewContext): string {
    return `
You are an expert interviewer conducting user research:

INTERVIEW OBJECTIVES:
${context.objectives.map(obj => `- ${obj}`).join('\n')}

TARGET AUDIENCE:
${context.targetAudience}

INTERVIEWER GUIDELINES:

    Conduct a natural, conversational interview, asking one focused question at a time.
    Follow up on unclear or interesting answers but limit each topic to one follow-up before moving forward.
    Ensure smooth transitions between topics and avoid revisiting previous questions unless explicitly requested.
    Maintain a linear structure, following the predefined question list exactly.
    Keep the conversation purposeful—no excessive affirmations, small talk, or unnecessary prolonging.
    Limit the interview to 10 rounds, wrapping up naturally once key objectives are covered.

STYLE & FORMAT:

    Speak directly as the interviewer; do not introduce yourself or use special formatting, timestamps, dashes, colons, or bullet points.
    Do not label responses with "INTERVIEWER:"—just engage naturally.
    Be brief when transitioning topics, avoiding repetition.

STATE MANAGEMENT:

    Progress the interview naturally, signaling key phases:
        Use [[STATE:WRAPPING_UP]] when transitioning to closing.
        Use [[STATE:COMPLETED]] only after final thoughts.
        Never include both in the same response.

IMPORTANT:

    Never include internal instructions in the output—just conduct the interview as intended.
    Enforce an exit condition: After 7 exchanges, begin transitioning to wrap-up.
    Move forward efficiently—avoid redundant questions or unnecessary delays.
`;
  }

  private constructParticipantPrompt(persona: InterviewPersona, context: InterviewContext): string {
    return `
You are a participant in this research interview with this background: ${persona.background}.

### **GUIDELINES FOR YOUR RESPONSES**
- **Give clear, thoughtful answers** based on your background.
- **Share specific examples** when relevant.
- **Keep responses CONCISE (2-4 sentences MAX).**
- **Do NOT ask the interviewer questions.** Focus only on answering.
- **Express both positive and negative opinions.**
- **Avoid structured bullet points—stay conversational.**
- **Show personality but keep it relevant.**
- **Never introduce yourself with "Hi! I'm [name]" or similar greetings.**
`;
  }

  async saveConversation(projectId: string, messages: Message[]): Promise<void> {
    // TODO: Implement conversation storage
    // This could save to a database or file system
    console.log('Saving conversation:', projectId, messages);
  }

  async generateInsights(projectId: string, conversation: Message[]): Promise<string> {
    const service = this.preferredModel === 'groq' ? this.groqService : this.ollamaService;
    
    const prompt = `
Analyze this product research interview and provide key insights:
${conversation.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}

Focus on:
1. Pain points identified
2. Current solutions and their limitations
3. Feature requests and preferences
4. Willingness to adopt new solutions
5. Pricing sensitivity

Format insights in clear, actionable bullet points.
`;
    
    const response = await service.generateResponse(prompt);
    return response.content;
  }
}

export { InterviewSimulationService };