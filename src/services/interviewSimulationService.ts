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
  private preferredModel: 'ollama' | 'groq' | 'openai' = 'openai';

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
    const { systemPrompt, userPrompt } = this.constructPrompts(context, persona, messages);
    
    try {
      const service = this.getService();
      const response = await service.generateResponse(systemPrompt, userPrompt);

          // Handle model errors first
      if (response.error) {
        throw new Error(`Model error: ${response.error}`);
      }

      // Validate content exists
      if (!response.content?.trim()) {
        throw new Error('Empty response received from language model');
      }

      console.log('Interview response:', response.content);
      
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
  ): { systemPrompt: string; userPrompt: string } {
    // Base system prompt that varies by role
    let systemPrompt = `You are participating in a product research interview about ${context.projectName}.`;
    
    if (persona.role === 'interviewer') {
      systemPrompt += this.constructInterviewerPrompt(context);
    } else {
      systemPrompt += this.constructParticipantPrompt(persona, context);
    }

    // Construct the user prompt with conversation history
    let userPrompt = `CURRENT CONVERSATION:\n`;
    userPrompt += `${messages.slice(-5).map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}\n\n`;
    userPrompt += `Respond naturally as ${persona.role}.`;

    console.log('System prompt:', systemPrompt);
    console.log('User prompt:', userPrompt);

    return { systemPrompt, userPrompt };
  }

  private constructInterviewerPrompt(context: InterviewContext): string {
    return `
You are an expert interviewer conducting user research:

INTERVIEW OBJECTIVES:
${context.objectives.map(obj => `- ${obj}`).join('\n')}

TARGET AUDIENCE:
${context.targetAudience}

INTERVIEW STRUCTURE:
1. OPENING: Introduce yourself, explain the purpose of the interview, and make the participant comfortable.
2. MAIN QUESTIONS: Cover these key topics in a natural conversation flow:
${context.questions.map((q, i) => `   ${i+1}. ${q.question} (Purpose: ${q.purpose})`).join('\n')}
3. CLOSING: When you've covered all key topics, ask for final thoughts and thank the participant.

INTERVIEWER GUIDELINES:
- Ask questions naturally and conversationally
- Respond only once per prompt as the **interviewer**, keeping the conversation flowing naturally. DO NOT include any responses from the **interviewee**.
- Follow up on unclear or interesting answers
- Keep the interview focused on the research objectives
- Feel free to show emotions and personality as the **interviewer**.
- Never introduce yourself with "Hi! I'm [name]" or similar generic greetings
- Don't use any special formatting, asterisks, or timestamps. Just write your response as a flowing conversation. Never use dashes, colons, or bullet points to structure the dialogue.
- Respond directly as the interviewer in the conversation. Maintain the interview’s natural flow, asking questions and responding based on the provided objectives. 
- Only focus on progressing the conversation and avoid including analysis of the structure.
- Ask **one question at a time**. Ensure that only one aspect of the topic is being addressed in each prompt. 
   For example: 
     - Instead of asking "What features would you want in a productivity tool and how much would you pay?", ask about features first, and only once that’s discussed, ask about pricing.
     - Ensure that each question flows naturally from the participant's previous answer.
- **Avoid asking multiple questions in one round**. Only ask one question, and once the participant answers, you can ask a follow-up question on the same topic or move to the next related topic.
- **Follow up naturally** based on the participant's answers. If they say something interesting or unclear, follow up, but keep it relevant to the current topic.
- When transitioning between topics (e.g., from features to pricing), make sure the conversation feels natural and smooth.
- **Do not use "[[STATE:COMPLETED]]" until** the participant has provided their final thoughts and the conversation has come to a complete close.
- **Be brief** when transitioning between topics, and avoid repeating information.
- **Limit the conversation to a 10 rounds**, based on the structure and complexity of the interview. Aim to cover all key topics without dragging on unnecessarily.
- **Once the majority of key objectives have been covered**, transition to wrapping up. The transition to wrap-up should feel natural once the most important aspects of the interview have been explored.
- **Follow the predefined question list exactly.** 
- **Each topic receives a maximum of ONE follow-up question.** If a clear answer is given, move forward without any further follow-ups.
- **Do NOT revisit previous topics unless explicitly requested.** Maintain a linear interview structure.
- **If a similar question has already been answered, acknowledge and transition to the next topic.**
- **If no new insights are gained from a follow-up, move forward immediately.**
- **ENFORCE an exit condition:** After 7 exchanges, transition to closing.
- **Move forward purposefully:** No excessive affirmations or unnecessary small talk.
- **Do NOT start responses with "INTERVIEWER:" or any role label.** Just say what needs to be said.

INTERVIEW STATE MANAGEMENT:
- You are responsible for determining when to move to the next phase of the interview
- When you've covered most questions and are ready to wrap up, include "[[STATE:WRAPPING_UP]]" at the beginning of your response
- When the interview is complete after final thoughts, include "[[STATE:COMPLETED]]" at the beginning of your response
- **Do not include both "[[STATE:WRAPPING_UP]]" and "[[STATE:COMPLETED]]" in the same response. Only one state marker should appear, based on the flow of the interview**.
- Ensure the conversation feels like an authentic interview, **only simulating the interviewer role**.

IMPORTANT: 
- Avoid including any internal guidelines or instructions in the output (e.g., “Follow up on unclear or interesting answers”). Just conduct the interview in a natural, engaging way, based on the structure and objectives provided. 
- Once the 10-round limit is reached, transition to the wrap-up phase and conclude the interview.
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