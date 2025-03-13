import React from 'react';
import { Textarea } from '../ui/textarea';

interface PromptTemplateEditorProps {
  template: string;
  onChange: (value: string) => void;
}

const PromptTemplateEditor: React.FC<PromptTemplateEditorProps> = ({ 
  template, 
  onChange 
}) => {
  return (
    <div className="w-full">
      <Textarea
        value={template}
        onChange={(e) => onChange(e.target.value)}
        className="w-full min-h-[200px] font-mono text-sm"
        placeholder="Enter your prompt template here..."
      />
      <div className="mt-2 text-xs text-muted-foreground">
        <p>Use <code>{"{{context.objective}}"}</code>, <code>{"{{context.targetInterviewee}}"}</code>, and <code>{"{{context.idea}}"}</code> as placeholders</p>
      </div>
    </div>
  );
};

export default PromptTemplateEditor;