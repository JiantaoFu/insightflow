import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface BatchInterviewTemplateEditorProps {
  batchInterviewTemplate: string;
  onBatchInterviewTemplateChange: (value: string) => void;
}

const BatchInterviewTemplateEditor: React.FC<BatchInterviewTemplateEditorProps> = ({ 
  batchInterviewTemplate,
  onBatchInterviewTemplateChange
}) => {
  return (
    <div className="w-full">
      <Textarea
        value={batchInterviewTemplate}
        onChange={(e) => onBatchInterviewTemplateChange(e.target.value)}
        className="w-full min-h-[250px] sm:min-h-[300px] font-mono text-sm"
        placeholder="Enter your batch interview generation template here..."
      />
      <div className="text-xs text-muted-foreground mt-3">
        <p>Available placeholders:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 pl-4 mt-1">
          <div><code>{"{{context.projectName}}"}</code> - Project name</div>
          <div><code>{"{{context.objectives}}"}</code> - Project objectives</div>
          <div><code>{"{{context.targetAudience}}"}</code> - Target audience</div>
          <div><code>{"{{context.questions}}"}</code> - Questions list</div>
        </div>
      </div>
    </div>
  );
};

export default BatchInterviewTemplateEditor;