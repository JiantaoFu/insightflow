import axios from 'axios';

interface ProjectIdea {
  idea: string;
}

interface AnalysisResult {
  names: string[];
  audiences: string[];
  objectives: string[];
}

class ProjectAnalysisService {
  private ollamaApiUrl = 'http://localhost:11434/api/generate';
  private maxRetries = 3;
  private retryDelay = 1000;

  async analyzeProject(project: ProjectIdea): Promise<AnalysisResult> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const response = await axios.post(this.ollamaApiUrl, {
          model: 'deepseek-r1:latest',
          prompt: this.constructPrompt(project),
          stream: false,
          options: {
            temperature: 0.7,
            max_tokens: 500
          }
        });

        const result = this.extractJsonFromResponse(response.data.response);
        if (result && this.isValidAnalysis(result)) {
          return result;
        }

        console.log(`Attempt ${attempt + 1}: Invalid response format, retrying...`);
        await this.delay(this.retryDelay);
        continue;

      } catch (error) {
        lastError = error as Error;
        console.log(`Attempt ${attempt + 1} failed:`, error);
        await this.delay(this.retryDelay);
      }
    }

    throw new Error(`Failed to analyze project after ${this.maxRetries} attempts. ${lastError?.message}`);
  }

  private constructPrompt(project: ProjectIdea): string {
    return `
    You are an expert Product-Market Fit consultant. Analyze this project idea and provide suggestions.

    Project Idea:
    ${project.idea}

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
