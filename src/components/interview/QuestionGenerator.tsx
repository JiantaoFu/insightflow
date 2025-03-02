// src/components/interview/QuestionGenerator.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import QuestionCard from './QuestionCard';
import questionGenerationService from '@/services/questionGenerationService';

interface GeneratedQuestion {
  id: string;
  text: string;
  category: 'background' | 'challenges' | 'solutions' | 'exploration';
}

const QuestionGenerator: React.FC = () => {
  const [context, setContext] = useState({
    objective: '',
    targetInterviewee: '',
    domain: ''
  });
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const generatedQuestions = await questionGenerationService.generateInterviewQuestions(context);
      setQuestions(generatedQuestions);
    } catch (error) {
      console.error('Failed to generate questions', error);
      // TODO: Add error toast or notification
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteQuestion = (indexToRemove: number) => {
    setQuestions(questions.filter((_, index) => index !== indexToRemove));
  };

  const handleEditQuestion = (indexToEdit: number) => {
    // TODO: Implement edit functionality
    console.log('Edit question', indexToEdit);
  };

  const handleMoveQuestion = (fromIndex: number, toIndex: number) => {
    const reorderedQuestions = [...questions];
    const [movedQuestion] = reorderedQuestions.splice(fromIndex, 1);
    reorderedQuestions.splice(toIndex, 0, movedQuestion);
    setQuestions(reorderedQuestions);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Interview Question Generator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Interview Objective</Label>
              <Input 
                placeholder="e.g., Validate product-market fit" 
                value={context.objective}
                onChange={(e) => setContext({...context, objective: e.target.value})}
              />
            </div>
            <div>
              <Label>Target Interviewee</Label>
              <Input 
                placeholder="e.g., Startup founders, Product managers" 
                value={context.targetInterviewee}
                onChange={(e) => setContext({...context, targetInterviewee: e.target.value})}
              />
            </div>
          </div>
          <div>
            <Label>Domain/Industry</Label>
            <Input 
              placeholder="e.g., B2B SaaS, Consumer Mobile App" 
              value={context.domain}
              onChange={(e) => setContext({...context, domain: e.target.value})}
            />
          </div>
          <Button 
            onClick={handleGenerate} 
            disabled={isLoading || !context.objective}
            className="w-full"
          >
            {isLoading ? 'Generating Questions...' : 'Generate Interview Questions'}
          </Button>

          {questions.length > 0 && (
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold">Generated Questions</h3>
              {questions.map((q, index) => (
                <QuestionCard
                  key={q.id}
                  question={q.text}
                  index={index}
                  onEdit={() => handleEditQuestion(index)}
                  onDelete={() => handleDeleteQuestion(index)}
                  onMove={handleMoveQuestion}
                  isFirst={index === 0}
                  isLast={index === questions.length - 1}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuestionGenerator;