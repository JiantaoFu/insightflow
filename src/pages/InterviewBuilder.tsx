import React, { useState, useEffect } from 'react';
import { Plus, Save, ArrowRight, Sparkles, ArrowLeftCircle, ArrowRightCircle, X, Edit, ArrowLeft } from 'lucide-react';
import PageTransition from '@/components/ui/PageTransition';
import GlassCard from '@/components/common/GlassCard';
import AnimatedButton from '@/components/common/AnimatedButton';
import QuestionCard from '@/components/interview/QuestionCard';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Link, useNavigate } from 'react-router-dom';
import questionGenerationService from '@/services/questionGenerationService';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProjectSetup from '@/components/interview/ProjectSetup';

const InterviewBuilder = () => {
  const navigate = useNavigate();
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Array<{ id: string, text: string, category: string }>>([]);
  const [currentGeneratedIndex, setCurrentGeneratedIndex] = useState<number>(-1);
  const [hasProjectContext, setHasProjectContext] = useState(false);
  const [setupState, setSetupState] = useState<{
    idea: string;
    suggestions: {
      names?: string[];
      audiences?: string[];
      objectives?: string[];
    };
    selected: {
      name?: string;
      audiences: string[];
      objectives: string[];
    };
  }>({
    idea: '',
    suggestions: {},
    selected: {
      audiences: [],
      objectives: []
    }
  });

  // Add useEffect to handle scrolling when context changes
  useEffect(() => {
    if (hasProjectContext) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [hasProjectContext]);

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
  
  const handleEditQuestion = (index: number, newQuestion: string, newDescription: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      question: newQuestion,
      description: newDescription,
    };
    setQuestions(updatedQuestions);
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

  const handleGenerateQuestions = async () => {
    if (!setupState.selected.objectives.length || !setupState.selected.audiences.length) return;

    setIsGenerating(true);
    try {
      const generated = await questionGenerationService.generateInterviewQuestions({
        objective: setupState.selected.objectives.join('\n'),
        targetInterviewee: setupState.selected.audiences.join(', '),
        domain: setupState.idea
      });

      setGeneratedQuestions(generated.map(q => ({
        id: Date.now().toString() + Math.random(),
        text: q.text,
        category: q.category
      })));
    } catch (error) {
      console.error('Failed to generate questions:', error);
      // TODO: Add error toast
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddGeneratedQuestion = (question: { text: string; category: string }) => {
    // Add to questions list
    setQuestions(prevQuestions => [
      ...prevQuestions,
      {
        id: Date.now().toString(),
        question: question.text,
        description: question.category,
      }
    ]);
    // Remove from generated list
    setGeneratedQuestions(prev => prev.filter(q => q.text !== question.text));
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const fromIndex = result.source.index;
    const toIndex = result.destination.index;
    
    if (fromIndex === toIndex) return;
    
    const updatedQuestions = [...questions];
    const [movedItem] = updatedQuestions.splice(fromIndex, 1);
    updatedQuestions.splice(toIndex, 0, movedItem);
    setQuestions(updatedQuestions);
  };

  const handleProjectSetupComplete = (context: { 
    idea: string,  // Add idea to the interface
    name: string, 
    audiences: string[], 
    objectives: string[],
    suggestions: any,
    selected: any
  }) => {
    setSetupState({
      idea: context.idea,
      suggestions: context.suggestions,
      selected: context.selected
    });
    setHasProjectContext(true);
  };

  // We should also scroll to top when going back to setup
  const handleBackToSetup = () => {
    setHasProjectContext(false);
  };

  const handlePreviewInterview = () => {
    // Get random audience member
    const randomAudience = setupState.selected.audiences[
      Math.floor(Math.random() * setupState.selected.audiences.length)
    ];

    const interviewContext = {
      projectName: setupState.selected.name || setupState.idea,
      objectives: setupState.selected.objectives,
      targetAudience: setupState.selected.audiences.join(', '),
      questions: questions.map(q => ({
        question: q.question,
        purpose: q.description
      })),
      personas: {
        interviewer: {
          role: 'interviewer',
          background: "Product Research Expert specialized in " + setupState.idea,
          expertise: ["User Research", "Product Strategy", "Market Analysis"],
          personality: "Professional but friendly, asks insightful follow-up questions"
        },
        interviewee: {
          role: 'interviewee',
          background: `${randomAudience} interested in ${setupState.idea}`,
          expertise: setupState.selected.objectives.map(obj => obj.split(' ').slice(0, 3).join(' ')),
          personality: "Experienced professional with relevant domain knowledge"
        }
      }
    };

    navigate('/interview-simulator', { state: { interviewContext } });
  };

  return (
    <PageTransition transition="fade" className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Interview Builder</h1>
          <p className="text-muted-foreground mb-8">
            Design effective interview questions to uncover valuable user insights
          </p>

          {!hasProjectContext ? (
            <ProjectSetup 
              onComplete={handleProjectSetupComplete}
              initialState={setupState} // Pass the entire state
            />
          ) : (
            <div className="space-y-8 mb-16">
              {/* Existing Questions */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Interview Questions</h2>
                  <AnimatedButton
                    variant="ghost"
                    size="sm"
                    onClick={handleBackToSetup}
                    icon={<ArrowLeft size={16} />}
                    iconPosition="left"
                  >
                    Back to Project Setup
                  </AnimatedButton>
                </div>
                {questions.length > 0 ? (
                  <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="questions">
                      {(provided) => (
                        <div 
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="space-y-4"
                        >
                          {questions.map((question, index) => (
                            <Draggable 
                              key={question.id} 
                              draggableId={question.id} 
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >
                                  <QuestionCard
                                    question={question.question}
                                    description={question.description}
                                    index={index}
                                    onEdit={handleEditQuestion}
                                    onDelete={handleDeleteQuestion}
                                    isDragging={snapshot.isDragging}
                                  />
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                ) : (
                  <GlassCard className="py-8 text-center">
                    <p className="text-muted-foreground mb-4">No questions added yet</p>
                    <p className="text-sm text-muted-foreground">
                      Generate questions automatically or add them manually below
                    </p>
                  </GlassCard>
                )}
              </div>

              {/* Add New Question Form */}
              <GlassCard className="p-4">
                <Tabs defaultValue="ai" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Add New Question</h2>
                    <TabsList>
                      <TabsTrigger value="ai">AI</TabsTrigger>
                      <TabsTrigger value="manual">Manual</TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="ai" className="space-y-4">
                    <div className="flex flex-col gap-4">
                      {/* Replace the flex container with a better mobile layout */}
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Generate questions based on your project details
                        </p>
                        <AnimatedButton
                          variant="default"
                          onClick={handleGenerateQuestions}
                          disabled={isGenerating || !setupState.selected.objectives.length || !setupState.selected.audiences.length}
                          icon={<Sparkles size={18} />}
                          iconPosition="left"
                          className="w-full bg-primary hover:bg-primary/90"
                        >
                          {isGenerating ? 'Generating...' : 'Generate Questions'}
                        </AnimatedButton>
                      </div>

                      {/* Generated Questions */}
                      {generatedQuestions.length > 0 && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Sparkles size={16} className="text-yellow-500" />
                            <span className="text-sm">Click Add to add questions to your list</span>
                          </div>
                          {generatedQuestions.map((question, index) => (
                            <QuestionCard
                              key={question.id}
                              question={question.text}
                              description={question.category}
                              index={index}
                              onEdit={(_, newQuestion, newDescription) => {
                                handleAddGeneratedQuestion({
                                  text: newQuestion,
                                  category: newDescription
                                });
                              }}
                              onDelete={() => {
                                setGeneratedQuestions(prev => 
                                  prev.filter(q => q.id !== question.id)
                                );
                              }}
                              isGenerated={true}
                              onAdd={() => handleAddGeneratedQuestion(question)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="manual" className="space-y-4">
                    <Input
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      placeholder="Enter your interview question"
                    />
                    <Textarea
                      value={newQuestionDescription}
                      onChange={(e) => setNewQuestionDescription(e.target.value)}
                      placeholder="What do you want to learn from this question?"
                      rows={2}
                    />
                    <div className="flex justify-end">
                      <AnimatedButton
                        onClick={handleAddQuestion}
                        disabled={!newQuestion.trim()}
                        icon={<Plus size={18} />}
                        iconPosition="left"
                      >
                        Add Question
                      </AnimatedButton>
                    </div>
                  </TabsContent>
                </Tabs>
              </GlassCard>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-8 pt-4 border-t">
            {hasProjectContext ? (
              <>
                <AnimatedButton variant="outline">
                  Save Draft
                </AnimatedButton>
                {questions.length > 0 && (
                  <Link to="/interview-modes" state={{ 
                    interviewContext: {
                      projectName: setupState.selected.name || setupState.idea,
                      objectives: setupState.selected.objectives,
                      targetAudience: setupState.selected.audiences.join(', '),
                      questions: questions.map(q => ({
                        question: q.question,
                        purpose: q.description
                      })),
                      personas: {
                        interviewer: {
                          role: 'interviewer',
                          background: "Product Research Expert specialized in " + setupState.idea,
                          expertise: ["User Research", "Product Strategy", "Market Analysis"],
                          personality: "Professional but friendly, asks insightful follow-up questions"
                        },
                        interviewee: {
                          role: 'interviewee',
                          background: `${setupState.selected.audiences[0]} interested in ${setupState.idea}`,
                          expertise: setupState.selected.objectives.map(obj => obj.split(' ').slice(0, 3).join(' ')),
                          personality: "Experienced professional with relevant domain knowledge"
                        }
                      }
                    }
                  }}>
                    <AnimatedButton 
                      icon={<ArrowRight size={18} />}
                      iconPosition="right"
                    >
                      Choose Interview Mode
                    </AnimatedButton>
                  </Link>
                )}
              </>
            ) : (
              <div className="w-full flex justify-end">
                {/* Add any other project setup actions here */}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default InterviewBuilder;
