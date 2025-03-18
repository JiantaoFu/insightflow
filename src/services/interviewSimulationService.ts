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
  private groqService: GroqService;
  private ollamaService: OllamaService;
  private openAIService: OpenAIService;
  private preferredModel: 'ollama' | 'groq' | 'openai';
  private interviewerTemplate: string;
  private intervieweeTemplate: string;
  private insightsTemplate: string;

  // Define the default templates as static readonly properties
  private static readonly DEFAULT_INTERVIEWER_TEMPLATE = `You are conducting a user research interview for a product.

You are an expert interviewer conducting user research. Begin by greeting the participant and providing a brief, friendly introduction to the interview’s purpose.

INTRODUCTION:
  - Start with a natural greeting.
  - Briefly introduce the purpose of the interview, ensuring the participant feels comfortable.
  - Keep it concise and professional—avoid unnecessary details.

INTERVIEW OBJECTIVES:
{{context.objectives}}

TARGET AUDIENCE:
{{context.targetAudience}}

INTERVIEW QUESTIONS:
{{context.questions}}

IMPORTANT GUIDELINES:

  - Conduct a natural, conversational interview, asking one focused question at a time.
  - Follow up on unclear or interesting answers but limit each topic to one follow-up before moving forward.
  - **One question at a time—avoid multi-part questions or complex phrasing.**
  - Ensure smooth transitions between topics and avoid revisiting previous questions unless explicitly requested.
  - Maintain a linear structure, following the predefined question list exactly.
  - Keep the conversation purposeful—no excessive affirmations, small talk, or unnecessary prolonging.

STYLE & FORMAT:

  - Speak directly as the interviewer; do not introduce yourself or use special formatting, timestamps, dashes, colons, or bullet points.
  - **NEVER include meta-commentary, notes to yourself, or explanations in parentheses**.
  - **DO NOT include phrases like 'Note:' 'Purpose:' or explanations about your reasoning.**
  - Be brief when transitioning topics, avoiding repetition.

STATE MANAGEMENT:

  - Wrapping up naturally once key objectives and questions are covered.
  - **DO NOT ask any new questions or follow-ups once wrapping up.**
  - Use [[STATE:COMPLETED]] only after final thoughts.

IMPORTANT:

  - Never include internal instructions in the output—just conduct the interview as intended.
  - Move forward efficiently—avoid redundant questions or unnecessary delays.

Now respond to the user as the interviewer.`;

  private static readonly DEFAULT_INTERVIEWEE_TEMPLATE = `You are participating in a user research interview for a product.
You are a participant in this research interview with this background: {{persona.background}}.

### **GUIDELINES FOR YOUR RESPONSES**
- **Give clear, thoughtful answers** based on your background.
- **Share specific examples** when relevant.
- **Keep responses CONCISE (2-4 sentences MAX).**
- **Do NOT ask the interviewer questions.** Focus only on answering.
- **Express both positive and negative opinions.**
- **Avoid structured bullet points—stay conversational.**
- **Show personality but keep it relevant.**
- **Never introduce yourself with "Hi! I'm [name]" or similar greetings.**

Now respond to the user as the interviewee.`;

  private static readonly DEFAULT_INSIGHTS_TEMPLATE = `Analyze this product research interview conversation and generate structured insights in JSON format:

Interview transcript:
{{conversation}}

Generate a JSON response with this structure:
{
  "keyFindings": [
    "Finding 1",
    "Finding 2",
    ...
  ],
  "recommendations": [
    "Recommendation 1",
    "Recommendation 2",
    ...
  ]
}

Important formatting instructions:
1. Return ONLY valid JSON without any additional text, markdown formatting, or code blocks
2. Do not include the \`\`\`json and \`\`\` markers in your response
3. Use double quotes for all keys and string values
4. Include 3-5 key findings and 3-5 recommendations

Focus on:
1. Pain points identified
2. Current solutions and their limitations
3. Feature requests and preferences
4. Willingness to adopt new solutions
5. Pricing sensitivity

Keep findings and recommendations clear, specific, and actionable.`;

  constructor() {
    this.groqService = new GroqService();
    this.ollamaService = new OllamaService();
    this.openAIService = new OpenAIService();
    this.preferredModel = (import.meta.env.VITE_PREFERRED_MODEL as 'ollama' | 'groq' | 'openai') || 'groq';
    this.interviewerTemplate = InterviewSimulationService.DEFAULT_INTERVIEWER_TEMPLATE;
    this.intervieweeTemplate = InterviewSimulationService.DEFAULT_INTERVIEWEE_TEMPLATE;
    this.insightsTemplate = InterviewSimulationService.DEFAULT_INSIGHTS_TEMPLATE;
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

  getInterviewerTemplate(): string {
    return this.interviewerTemplate;
  }

  getIntervieweeTemplate(): string {
    return this.intervieweeTemplate;
  }

  getInsightsTemplate(): string {
    return this.insightsTemplate;
  }

  // Set custom templates
  setInterviewerTemplate(template: string) {
    if (template && template.trim()) {
      this.interviewerTemplate = template;
    }
  }

  setIntervieweeTemplate(template: string) {
    if (template && template.trim()) {
      this.intervieweeTemplate = template;
    }
  }

  setInsightsTemplate(template: string) {
    if (template && template.trim()) {
      this.insightsTemplate = template;
    }
  }
  resetInterviewerTemplate() {
    this.interviewerTemplate = InterviewSimulationService.DEFAULT_INTERVIEWER_TEMPLATE;
  }

  resetIntervieweeTemplate() {
    this.intervieweeTemplate = InterviewSimulationService.DEFAULT_INTERVIEWEE_TEMPLATE;
  }

  resetInsightsTemplate() {
    this.insightsTemplate = InterviewSimulationService.DEFAULT_INSIGHTS_TEMPLATE;
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
    let state: 'ongoing' | 'completed' = 'ongoing';
    let content = fullResponse;
    
    // Look for state markers in the response using regex to handle markers anywhere in text
    const completedMatch = content.match(/\[\[STATE:COMPLETED\]\]/);
    
    content = content.replace(/\[\[STATE:COMPLETED\]\]/g, '');

    if (completedMatch) {
      state = 'completed';
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
    let template = '';
    if (persona.role === 'interviewer') {
      template = this.interviewerTemplate;
    } else {
      template = this.intervieweeTemplate;
    }
    const systemPrompt = template
      .replace(/\{\{context\.projectName\}\}/g, context.projectName)
      .replace(/\{\{context\.targetAudience\}\}/g, context.targetAudience)
      .replace(/\{\{context\.objectives\}\}/g, context.objectives.map(obj => `- ${obj}`).join('\n'))
      .replace(/\{\{persona\.background\}\}/g, persona.background)
      .replace(/\{\{context\.questions\}\}/g, context.questions.map((q, i) => ` ${i+1}. ${q.question} (Purpose: ${q.purpose})`).join('\n'));

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

  async saveConversation(projectId: string, messages: Message[]): Promise<void> {
    // TODO: Implement conversation storage
    // This could save to a database or file system
    console.log('Saving conversation:', projectId, messages);
  }

  async generateInsights(projectId: string, conversation: Message[]): Promise<string> {
    // Format the conversation for the template
    const formattedConversation = conversation
      .map(m => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n');
    
    // Replace placeholders in the insights template
    const prompt = this.insightsTemplate.replace(/\{\{conversation\}\}/g, formattedConversation);

    try {
      const service = this.getService();
      const response = await service.generateResponse(prompt);

      if (response.error) {
        throw new Error(`Model error: ${response.error}`);
      }

      return response.content;
    } catch (error) {
      console.error('Failed to generate insights:', error);
      throw new Error(`Failed to generate insights: ${error}`);
    }
  }
}

export default new InterviewSimulationService();