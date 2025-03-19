import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Save, ArrowLeft, Settings, ChevronDown, ChevronUp, RotateCw, Copy, Info, Mic, MicOff, Send } from 'lucide-react';
import InterviewTemplateEditor from '@/components/interview/InterviewTemplateEditor';
import { Button } from '@/components/ui/button';
import PageTransition from '@/components/ui/PageTransition';
import GlassCard from '@/components/common/GlassCard';
import AnimatedButton from '@/components/common/AnimatedButton';
import { Input } from '@/components/ui/input';
import { Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import InterviewSimulationService from '@/services/interviewSimulationService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface SimMessage {
  id: string;
  content: string;
  sender: 'interviewer' | 'interviewee';
  timestamp: Date;
}

const HumanIntervieweeSimulator = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const interviewContext = location.state?.interviewContext;

  // Redirect if no context is provided
  if (!interviewContext) {
    return <Navigate to="/interview-builder" replace />;
  }

  const [context] = useState(interviewContext);
  const [messages, setMessages] = useState<SimMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isInterviewActive, setIsInterviewActive] = useState(true); // Start as active
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [insights, setInsights] = useState<{ 
    keyFindings: string[]; 
    recommendations: string[]; 
  }>({ 
    keyFindings: [], 
    recommendations: [] 
  });

  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [interviewerTemplate, setInterviewerTemplate] = useState('');
  const [insightsTemplate, setInsightsTemplate] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Add this useEffect to focus the input after AI responds
  useEffect(() => {
    // When the AI stops thinking and the interview is active, focus the input
    if (!isThinking && isInterviewActive && hasStarted && inputRef.current) {
      // Small timeout to ensure the UI has updated
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isThinking, isInterviewActive, hasStarted]);
  
  // Create default interviewer persona if not provided in context
  const [interviewer] = useState(() => 
    interviewContext.personas?.interviewer || {
      role: 'interviewer' as const,
      background: "Product Research Expert",
      expertise: ["User Research", "Product Strategy", "Market Analysis"],
      personality: "Professional but friendly, asks insightful follow-up questions"
    }
  );

  const [interviewService] = useState(() => InterviewSimulationService);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    const userMessage: SimMessage = {
      id: Date.now().toString(),
      content: newMessage,
      sender: 'interviewee',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsThinking(true);
    
    try {
      const response = await interviewService.conductInterview(
        context,
        interviewer,
        messages.map(m => ({ role: m.sender, content: m.content })).concat({ role: 'interviewee', content: newMessage })
      );
      
      const aiMessage: SimMessage = {
        id: Date.now().toString(),
        content: response.content,
        sender: 'interviewer',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Check if interview should end
      if (response.state === 'completed') {
        generateInsights();
      }
    } catch (error) {
      console.error('Failed to get interviewer response:', error);
      toast.error('Failed to get interviewer response');
    } finally {
      setIsThinking(false);
    }
  };

  const handleSaveTranscript = async () => {
    try {
      await interviewService.saveConversation(
        context.projectId || 'project-id', // Use project ID from context if available
        messages
      );
      toast.success('Transcript saved successfully!');
    } catch (error) {
      console.error('Failed to save transcript:', error);
      toast.error('Failed to save transcript');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // In a real app, this would handle speech recognition
    toast.info(isRecording ? 'Voice recording stopped' : 'Voice recording started');
  };

  useEffect(() => {
    setInterviewerTemplate(interviewService.getInterviewerTemplate());
    setInsightsTemplate(interviewService.getInsightsTemplate());
  }, []);

  // Scroll to the bottom of the messages container
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Start interview with initial greeting when hasStarted becomes true
  useEffect(() => {
    let isMounted = true;

    const startInterview = async () => {
      // Only start if we've clicked the "Start Interview" button and there are no messages yet
      if (!hasStarted || !isInterviewActive || messages.length > 0) return;
      
      setIsThinking(true);
      try {
        // Initial greeting from AI interviewer
        const response = await interviewService.conductInterview(
          context,
          interviewer,
          [] // Empty conversation to start
        );
        
        if (!isMounted) return;
        
        const initialMessage: SimMessage = {
          id: Date.now().toString(),
          content: response.content,
          sender: 'interviewer',
          timestamp: new Date()
        };
        
        setMessages([initialMessage]);
      } catch (error) {
        console.error('Failed to start interview:', error);
        toast.error('Failed to start interview');
      } finally {
        if (isMounted) {
          setIsThinking(false);
        }
      }
    };

    startInterview();

    return () => {
      isMounted = false;
    };
  }, [hasStarted, isInterviewActive, interviewService, context, interviewer, messages.length]);

  const handleResetInterviewerTemplate = () => {
    interviewService.resetInterviewerTemplate();
    setInterviewerTemplate(interviewService.getInterviewerTemplate());
  };

  const handleResetInsightsTemplate = () => {
    interviewService.resetInsightsTemplate();
    setInsightsTemplate(interviewService.getInsightsTemplate());
  };

  const handleResetAllTemplates = () => {
    handleResetInterviewerTemplate();
    handleResetInsightsTemplate();
  };

  const handleStartInterview = () => {
    setIsInterviewActive(true);
  };

  const handleStopInterview = () => {
    setIsInterviewActive(false);
  };

  const handleCopyConversation = async () => {
    try {
      const text = messages.map(m => 
        `${m.sender === 'interviewer' ? 'Interviewer' : 'You'}: ${m.content}\n${m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      ).join('\n\n') + '\n';
     
      navigator.clipboard.writeText(text)
        .then(() => {
          toast.success('Conversation copied to clipboard!');
        })
        .catch((err) => {
          console.error('Failed to copy: ', err);
          toast.error('Failed to copy conversation');
        });
    } catch (error) {
      toast.error('Failed to copy conversation');
    }
  };

  // Generate insights from the conversation
  const generateInsights = async () => {
    if (messages.length < 2) return; // Need at least some conversation to generate insights
    
    try {
      const result = await interviewService.generateInsights(
        context.projectId || 'project-id',
        messages.map(m => ({
          role: m.sender,
          content: m.content
        }))
      );

      // Parse the insights from the result
      const parsedInsights = JSON.parse(result);
      setInsights(parsedInsights);
    } catch (error) {
      console.error('Failed to generate insights:', error);
      toast.error('Failed to generate insights');
    }
  };

  const handleInitialSetup = () => {
    interviewService.setInterviewerTemplate(interviewerTemplate);
    interviewService.setInsightsTemplate(insightsTemplate);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      setHasStarted(true);
      // Focus on input field after starting
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 300);
  };

  const handleResetInterview = () => {
    setMessages([]);
    setIsInterviewActive(true); // Ensure interview is active after reset
  };

  return (
    <PageTransition transition="fade" className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between mb-6">
          <AnimatedButton
            icon={<ArrowLeft size={18} />}
            onClick={() => navigate(-1)}
            className="text-sm md:text-base"
            size="sm"
          >
            Back
          </AnimatedButton>
        </div>

        {!hasStarted ? (
          <GlassCard className="mb-6 p-4 md:p-6">
            <div className="flex flex-col md:flex-row items-start gap-4">
              <Info className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
              <div className="w-full">
                <h2 className="text-xl font-semibold mb-4">Human Interviewee Mode</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>In this mode, you'll be interviewed by an AI based on your project context:</p>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-foreground font-medium mb-2">Project Details</h3>
                      <ul className="list-disc pl-4 space-y-2">
                        <li>Project: <span className="text-foreground">{interviewContext.projectName}</span></li>
                        <li>Audience: <span className="text-foreground">{interviewContext.targetAudience}</span></li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-foreground font-medium mb-2">Questions to Cover</h3>
                      <ul className="list-decimal pl-4 space-y-2">
                        {interviewContext.questions.map((q, i) => (
                          <li key={i} className="text-foreground">
                            {q.question}
                            <p className="text-sm text-muted-foreground ml-0 mt-1">Purpose: {q.purpose}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <p>The AI interviewer will:</p>
                  <ul className="list-disc pl-4 space-y-2">
                    <li>Ask questions based on your project context</li>
                    <li>Adapt follow-up questions based on your responses</li>
                    <li>Provide insights after the interview is complete</li>
                  </ul>
                </div>

                {/* Advanced Options Toggle */}
                <div className="mt-8 pt-6 border-t mb-4">
                  <button
                    type="button"
                    onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Settings size={16} />
                    Advanced Options
                    {showAdvancedOptions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>

                {/* Template Editor */}
                {showAdvancedOptions && (
                  <div className="space-y-3 mb-6 p-4 border border-dashed rounded-lg bg-muted/30 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h3 className="text-md font-semibold">Prompt Templates</h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleResetAllTemplates}
                        className="self-start sm:self-auto text-xs md:text-sm"
                      >
                        Reset to Default
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Customize how the AI generates responses in the interview
                    </p>
                    {/* Simplified container structure */}
                    <div className="border rounded-lg bg-card p-2 sm:p-4">
                      <InterviewTemplateEditor
                        interviewerTemplate={interviewerTemplate}
                        intervieweeTemplate=""
                        insightsTemplate={insightsTemplate}
                        onInterviewerTemplateChange={setInterviewerTemplate}
                        onIntervieweeTemplateChange={() => {}} // Not needed for human interviewee
                        onInsightsTemplateChange={setInsightsTemplate}
                        hideIntervieweeTemplate={true} // Hide the interviewee template since it's not needed
                      />
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  <AnimatedButton
                    icon={<Play />}
                    onClick={handleInitialSetup}
                    className="w-full bg-primary hover:bg-primary/90 text-sm md:text-base"
                  >
                    Start Interview
                  </AnimatedButton>
                </div>
              </div>
            </div>
          </GlassCard>
        ) : (
          <>
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-2">AI Interviewer</h1>
                  <p className="text-sm md:text-base text-muted-foreground">
                    Respond to the AI interviewer's questions
                  </p>
                </div>
              </div>
              
              {/* Interview Controls */}
              <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="w-full sm:w-auto">
                  {isInterviewActive ? (
                    <AnimatedButton
                      onClick={handleStopInterview}
                      icon={<Pause size={18} />}
                      variant="outline"
                      className="w-full sm:w-auto text-sm md:text-base"
                    >
                      Pause Interview
                    </AnimatedButton>
                  ) : (
                    <AnimatedButton
                      onClick={handleStartInterview}
                      icon={<Play size={18} />}
                      className="w-full sm:w-auto text-sm md:text-base"
                    >
                      Resume Interview
                    </AnimatedButton>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2 w-full sm:w-auto sm:flex sm:items-center sm:gap-2">
                  <AnimatedButton
                    variant="outline"
                    size="sm"
                    onClick={handleResetInterview}
                    icon={<RotateCw size={16} />}
                    className="text-xs md:text-sm"
                  >
                    Reset
                  </AnimatedButton>
                  <AnimatedButton
                    variant="outline"
                    size="sm"
                    onClick={handleCopyConversation}
                    icon={<Copy size={16} />}
                    disabled={messages.length === 0}
                    className="text-xs md:text-sm"
                  >
                    Copy
                  </AnimatedButton>
                  <AnimatedButton
                    variant="outline"
                    size="sm"
                    onClick={handleSaveTranscript}
                    icon={<Save size={16} />}
                    disabled={messages.length === 0}
                    className="text-xs md:text-sm"
                  >
                    Save
                  </AnimatedButton>
                </div>
              </div>

              {/* Chat Interface */}
              <GlassCard className="mb-8 p-0 overflow-hidden">
                {/* Interview Header */}
                <div className="bg-secondary/50 backdrop-blur-sm p-3 md:p-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary text-base md:text-lg font-semibold">AI</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm md:text-base">AI Interviewer</h3>
                      <p className="text-xs text-muted-foreground">Product Research Session</p>
                    </div>
                  </div>
                </div>
                
                {/* Messages */}
                <div 
                  ref={messagesContainerRef} 
                  className="p-4 md:p-6 h-[400px] md:h-[500px] overflow-y-auto scrollbar-hidden"
                >
                  <div className="space-y-4 md:space-y-6">
                    {messages.map((message) => (
                      <div 
                        key={message.id} 
                        className={cn(
                          "flex",
                          message.sender === 'interviewee' ? "justify-end" : "justify-start"
                        )}
                      >
                        <div 
                          className={cn(
                            "max-w-[85%] md:max-w-[75%] rounded-2xl p-3 md:p-4 text-sm md:text-base",
                            message.sender === 'interviewee' 
                              ? "bg-primary text-primary-foreground" 
                              : "bg-secondary"
                          )}
                        >
                          <p>{message.content}</p>
                          <div className="mt-1 text-xs opacity-70 text-right">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {isThinking && (
                      <div className="flex justify-start">
                        <div className="bg-secondary max-w-[85%] md:max-w-[75%] rounded-2xl p-3 md:p-4">
                          <div className="flex space-x-2">
                            <div className="w-2 h-2 rounded-full bg-foreground/30 animate-pulse"></div>
                            <div className="w-2 h-2 rounded-full bg-foreground/30 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 rounded-full bg-foreground/30 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Message Input */}
                <div className="border-t border-border p-3 md:p-4">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={toggleRecording}
                      className={cn(
                        "rounded-full",
                        isRecording && "text-red-500"
                      )}
                    >
                      {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
                    </Button>
                    <Input
                      ref={inputRef}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type your response..."
                      className="flex-1 text-sm md:text-base"
                      disabled={!isInterviewActive || isThinking}
                    />
                    <Button
                      type="button"
                      size="icon"
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || !isInterviewActive || isThinking}
                      className="rounded-full"
                    >
                      <Send size={18} />
                    </Button>
                  </div>
                </div>
              </GlassCard>

              {/* Add Insights Display */}
              {insights.keyFindings.length > 0 && (
                <GlassCard className="mt-8 p-4 md:p-6">
                  <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Interview Insights</h3>
                  <div className="grid gap-4 text-sm md:text-base">
                    <div>
                      <h4 className="font-medium mb-2">Key Findings</h4>
                      <ul className="list-disc pl-4">
                        {insights.keyFindings.map((finding, i) => (
                          <li key={i}>{finding}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Recommendations</h4>
                      <ul className="list-disc pl-4">
                        {insights.recommendations.map((rec, i) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </GlassCard>
              )}
            </div>
          </>
        )}
      </div>
      <ToastContainer position="bottom-right" />
    </PageTransition>
  );
};

export default HumanIntervieweeSimulator;
