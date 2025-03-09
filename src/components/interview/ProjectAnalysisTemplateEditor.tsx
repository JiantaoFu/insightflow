import React from 'react';
import { Textarea } from '../ui/textarea';

interface ProjectAnalysisTemplateEditorProps {
  template: string;
  onChange: (value: string) => void;
}

const ProjectAnalysisTemplateEditor: React.FC<ProjectAnalysisTemplateEditorProps> = ({ 
  template, 
  onChange 
}) => {
  return (
    <div className="w-full">
      <Textarea
        value={template}
        onChange={(e) => onChange(e.target.value)}
        className="w-full min-h-[200px] font-mono text-sm"
        placeholder="Enter your project analysis prompt template here..."
      />
      <div className="mt-2 text-xs text-muted-foreground">
        <p>Use <code>{"{{context.idea}}"}</code> as a placeholder for the project idea</p>
      </div>
    </div>
  );
};

export default ProjectAnalysisTemplateEditor;