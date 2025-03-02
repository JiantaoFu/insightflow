
import React, { useState } from 'react';
import { Plus, Save, ArrowLeft, ArrowRight } from 'lucide-react';
import PageTransition from '@/components/ui/PageTransition';
import GlassCard from '@/components/common/GlassCard';
import AnimatedButton from '@/components/common/AnimatedButton';
import QuestionCard from '@/components/interview/QuestionCard';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';

const InterviewBuilder = () => {
  const [projectName, setProjectName] = useState('New Interview Project');
  const [projectDescription, setProjectDescription] = useState('');
  const [audience, setAudience] = useState('');
  const [questions, setQuestions] = useState([
    {
      id: '1',
      question: 'What problem were you trying to solve when you found our product?',
      description: 'Understand the initial user pain point',
    },
    {
      id: '2',
      question: 'How are you currently solving this problem?',
      description: 'Learn about existing alternatives and workflows',
    },
    {
      id: '3',
      question: 'What would make this product a must-have for you?',
      description: 'Identify key features and value propositions',
    },
  ]);
  const [newQuestion, setNewQuestion] = useState('');
  const [newQuestionDescription, setNewQuestionDescription] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  
  const handleAddQuestion = () => {
    if (!newQuestion.trim()) return;
    
    if (editingIndex !== null) {
      // Update existing question
      const updatedQuestions = [...questions];
      updatedQuestions[editingIndex] = {
        ...updatedQuestions[editingIndex],
        question: newQuestion,
        description: newQuestionDescription,
      };
      setQuestions(updatedQuestions);
      setEditingIndex(null);
    } else {
      // Add new question
      setQuestions([
        ...questions, 
        {
          id: Date.now().toString(),
          question: newQuestion,
          description: newQuestionDescription,
        }
      ]);
    }
    
    // Reset form
    setNewQuestion('');
    setNewQuestionDescription('');
  };
  
  const handleEditQuestion = (index: number) => {
    setNewQuestion(questions[index].question);
    setNewQuestionDescription(questions[index].description || '');
    setEditingIndex(index);
  };
  
  const handleDeleteQuestion = (index: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions.splice(index, 1);
    setQuestions(updatedQuestions);
    
    // Reset editing state if deleting the question being edited
    if (editingIndex === index) {
      setEditingIndex(null);
      setNewQuestion('');
      setNewQuestionDescription('');
    } else if (editingIndex !== null && editingIndex > index) {
      // Adjust editing index if deleting a question above the one being edited
      setEditingIndex(editingIndex - 1);
    }
  };
  
  const handleMoveQuestion = (fromIndex: number, toIndex: number) => {
    const updatedQuestions = [...questions];
    const [movedItem] = updatedQuestions.splice(fromIndex, 1);
    updatedQuestions.splice(toIndex, 0, movedItem);
    setQuestions(updatedQuestions);
    
    // Update editing index if moving the question being edited
    if (editingIndex === fromIndex) {
      setEditingIndex(toIndex);
    } else if (
      editingIndex !== null && 
      ((editingIndex > fromIndex && editingIndex <= toIndex) || 
       (editingIndex < fromIndex && editingIndex >= toIndex))
    ) {
      // Adjust editing index if the move affects its position
      const direction = fromIndex < toIndex ? -1 : 1;
      setEditingIndex(editingIndex + direction);
    }
  };
  
  return (
    <PageTransition transition="fade" className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-8">
          <Link to="/dashboard">
            <AnimatedButton variant="outline" size="sm" icon={<ArrowLeft size={16} />} iconPosition="left">
              Back to Dashboard
            </AnimatedButton>
          </Link>
        </div>
        
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Interview Builder</h1>
          <p className="text-muted-foreground mb-8">
            Design effective interview questions to uncover valuable user insights
          </p>
          
          {/* Project Details */}
          <GlassCard className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Project Information</h2>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <Label htmlFor="project-name">Project Name</Label>
                <Input
                  id="project-name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="mt-2"
                  placeholder="Enter project name"
                />
              </div>
              
              <div>
                <Label htmlFor="project-description">Project Description</Label>
                <Textarea
                  id="project-description"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  className="mt-2"
                  placeholder="What are you trying to learn from these interviews?"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="target-audience">Target Audience</Label>
                <Input
                  id="target-audience"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="mt-2"
                  placeholder="Who will you be interviewing?"
                />
              </div>
            </div>
          </GlassCard>
          
          {/* Question Builder */}
          <GlassCard className="mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {editingIndex !== null ? 'Edit Question' : 'Add New Question'}
            </h2>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <Label htmlFor="question">Question</Label>
                <Input
                  id="question"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  className="mt-2"
                  placeholder="Enter your interview question"
                />
              </div>
              
              <div>
                <Label htmlFor="question-description">Description (Optional)</Label>
                <Textarea
                  id="question-description"
                  value={newQuestionDescription}
                  onChange={(e) => setNewQuestionDescription(e.target.value)}
                  className="mt-2"
                  placeholder="What are you trying to learn from this question?"
                  rows={2}
                />
              </div>
              
              <div className="flex justify-end gap-3">
                {editingIndex !== null && (
                  <AnimatedButton
                    variant="outline"
                    onClick={() => {
                      setEditingIndex(null);
                      setNewQuestion('');
                      setNewQuestionDescription('');
                    }}
                  >
                    Cancel
                  </AnimatedButton>
                )}
                <AnimatedButton
                  onClick={handleAddQuestion}
                  disabled={!newQuestion.trim()}
                  icon={editingIndex !== null ? <Save size={18} /> : <Plus size={18} />}
                  iconPosition="left"
                >
                  {editingIndex !== null ? 'Update Question' : 'Add Question'}
                </AnimatedButton>
              </div>
            </div>
          </GlassCard>
          
          {/* Questions List */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Interview Questions</h2>
            {questions.length > 0 ? (
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <QuestionCard
                    key={question.id}
                    question={question.question}
                    description={question.description}
                    index={index}
                    onEdit={handleEditQuestion}
                    onDelete={handleDeleteQuestion}
                    onMove={handleMoveQuestion}
                    isFirst={index === 0}
                    isLast={index === questions.length - 1}
                  />
                ))}
              </div>
            ) : (
              <GlassCard className="py-8 text-center">
                <p className="text-muted-foreground mb-4">No questions added yet</p>
                <AnimatedButton
                  icon={<Plus size={18} />}
                  iconPosition="left"
                >
                  Add Your First Question
                </AnimatedButton>
              </GlassCard>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <AnimatedButton variant="outline">
              Save Draft
            </AnimatedButton>
            <Link to="/interview-simulator">
              <AnimatedButton 
                disabled={questions.length === 0}
                icon={<ArrowRight size={18} />}
                iconPosition="right"
              >
                Preview Interview
              </AnimatedButton>
            </Link>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default InterviewBuilder;
