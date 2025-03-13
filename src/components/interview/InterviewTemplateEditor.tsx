// In InterviewTemplateEditor.tsx
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface InterviewTemplateEditorProps {
  interviewerTemplate: string;
  intervieweeTemplate: string;
  insightsTemplate: string;
  onInterviewerTemplateChange: (value: string) => void;
  onIntervieweeTemplateChange: (value: string) => void;
  onInsightsTemplateChange: (value: string) => void;
  hideIntervieweeTemplate?: boolean;
}

const InterviewTemplateEditor: React.FC<InterviewTemplateEditorProps> = ({ 
  interviewerTemplate, 
  intervieweeTemplate,
  insightsTemplate,
  onInterviewerTemplateChange,
  onIntervieweeTemplateChange,
  onInsightsTemplateChange,
  hideIntervieweeTemplate = false
}) => {
  return (
    <div className="w-full">
      <Tabs defaultValue="interviewer" className="w-full">
        <TabsList className="mb-4 w-full flex flex-wrap h-auto">
          <TabsTrigger value="interviewer" className="flex-1">Interviewer</TabsTrigger>
          {!hideIntervieweeTemplate && (
            <TabsTrigger value="interviewee" className="flex-1">Interviewee</TabsTrigger>
          )}
          <TabsTrigger value="insights" className="flex-1">Insights</TabsTrigger>
        </TabsList>
        
        <TabsContent value="interviewer" className="space-y-3">
          <Textarea
            value={interviewerTemplate}
            onChange={(e) => onInterviewerTemplateChange(e.target.value)}
            className="w-full min-h-[250px] sm:min-h-[300px] font-mono text-sm"
            placeholder="Enter your interviewer prompt template here..."
          />
          <div className="text-xs text-muted-foreground">
            <p>Available placeholders:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 pl-4 mt-1">
              <div><code>{"{{context.projectName}}"}</code> - Project name</div>
              <div><code>{"{{context.targetAudience}}"}</code> - Target audience</div>
              <div><code>{"{{context.questions}}"}</code> - Questions list</div>
              <div><code>{"{{persona.background}}"}</code> - Background</div>
              <div><code>{"{{persona.expertise}}"}</code> - Expertise</div>
              <div><code>{"{{persona.personality}}"}</code> - Personality</div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="interviewee" className="space-y-3">
          <Textarea
            value={intervieweeTemplate}
            onChange={(e) => onIntervieweeTemplateChange(e.target.value)}
            className="w-full min-h-[250px] sm:min-h-[300px] font-mono text-sm"
            placeholder="Enter your interviewee prompt template here..."
          />
          <div className="text-xs text-muted-foreground">
            <p>Available placeholders:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 pl-4 mt-1">
              <div><code>{"{{context.projectName}}"}</code> - Project name</div>
              <div><code>{"{{context.targetAudience}}"}</code> - Target audience</div>
              <div><code>{"{{context.questions}}"}</code> - Questions list</div>
              <div><code>{"{{persona.background}}"}</code> - Background</div>
              <div><code>{"{{persona.expertise}}"}</code> - Expertise</div>
              <div><code>{"{{persona.personality}}"}</code> - Personality</div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="insights" className="space-y-3">
          <Textarea
            value={insightsTemplate}
            onChange={(e) => onInsightsTemplateChange(e.target.value)}
            className="w-full min-h-[250px] sm:min-h-[300px] font-mono text-sm"
            placeholder="Enter your insights generation template here..."
          />
          <div className="text-xs text-muted-foreground">
            <p>Available placeholders:</p>
            <div className="pl-4 mt-1">
              <div><code>{"{{conversation}}"}</code> - The full interview transcript</div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InterviewTemplateEditor;