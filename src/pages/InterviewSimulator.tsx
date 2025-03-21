import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Save, ArrowLeft, Settings, ChevronDown, ChevronUp, RotateCw, Copy, Info } from 'lucide-react';
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

const InterviewSimulator = () => {
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
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState<'slow' | 'normal' | 'fast'>('slow');
  const [interviewState, setInterviewState] = useState<'ongoing' | 'asking_final_thoughts' | 'waiting_for_final_response' | 'completed'>('ongoing');
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
  const [intervieweeTemplate, setIntervieweeTemplate] = useState('');
  const [insightsTemplate, setInsightsTemplate] = useState('');
  
  // Create default personas if not provided in context
  const [interviewer] = useState(() => 
    interviewContext.personas?.interviewer || {
      role: 'interviewer' as const,
      background: "Product Research Expert",
      expertise: ["User Research", "Product Strategy", "Market Analysis"],
      personality: "Professional but friendly, asks insightful follow-up questions"
    }
  );

  const [interviewee] = useState(() => 
    interviewContext.personas?.interviewee || {
      role: 'interviewee' as const,
      background: `${interviewContext.targetAudience}`,
      expertise: interviewContext.objectives,
      personality: "Experienced professional with relevant domain knowledge"
    }
  );

  const [interviewService] = useState(() => InterviewSimulationService);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    const userMessage = {
      role: 'interviewee' as const,
      content: newMessage
    };
    
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsThinking(true);
    
    try {
      const response = await interviewService.conductInterview(
        context,
        interviewer,
        [...messages, userMessage]
      );
      
      const aiMessage = {
        role: 'interviewer' as const,
        content: response.content
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Failed to get interviewer response:', error);
      // TODO: Add error toast
    } finally {
      setIsThinking(false);
    }
  };

  const handleSaveTranscript = async () => {
    try {
      await interviewService.saveConversation(
        'project-id', // TODO: Get from props/context
        messages
      );
      // TODO: Add success toast
    } catch (error) {
      console.error('Failed to save transcript:', error);
      // TODO: Add error toast
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
  };

  const addMessageWithDelay = async (message: SimMessage) => {
    // console.log('Adding message with delay:', message);
    const delays = {
      slow: 8000,
      normal: 5000,
      fast: 1000
    };

    await new Promise(resolve => setTimeout(resolve, delays[simulationSpeed]));
    setMessages(prev => {
      console.log('Previous messages:', prev.length);
      const updated = [...prev, message];
      console.log('New messages length:', updated.length);
      return updated;
    });
  };

  useEffect(() => {
    setInterviewerTemplate(interviewService.getInterviewerTemplate());
    setIntervieweeTemplate(interviewService.getIntervieweeTemplate());
    setInsightsTemplate(interviewService.getInsightsTemplate());
  }, []);

  // Scroll to the bottom of the messages container
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Move simulation logic to useEffect
  useEffect(() => {
    let isMounted = true;

    async function startSimulation() {
      console.log('Starting simulation in effect');
      setMessages([]); // Clear messages state
      
      try {
        // Create a local array to track conversation
        const conversation: SimMessage[] = [];

        // Get initial greeting from AI interviewer instead of using hardcoded message
        setIsThinking(true);
        const initialResponse = await interviewService.conductInterview(
          context,
          interviewer,
          [] // Empty conversation to start
        );

        if (!isMounted) return;

        const initialMessage: SimMessage = {
          id: Date.now().toString(),
          content: initialResponse.content,
          sender: 'interviewer',
          timestamp: new Date()
        };

        await addMessageWithDelay(initialMessage);
        conversation.push(initialMessage);
        setIsThinking(false);

        let conversationLength = 0;
        const maxExchanges = 20;

        while (isMounted && isSimulating) {
          console.log("Conversation length:", conversation.length);

          // Interviewee's turn
          const intervieweeResult = await interviewService.conductInterview(
            context,
            interviewee,
            conversation.map(m => ({ role: m.sender, content: m.content }))
          );

          if (!isMounted || !isSimulating) break;
          
          const intervieweeMessage: SimMessage = {
            id: Date.now().toString(),
            content: intervieweeResult.content,
            sender: 'interviewee',
            timestamp: new Date()
          };
          await addMessageWithDelay(intervieweeMessage);
          conversation.push(intervieweeMessage);  // Add to local conversation array

          setInterviewState(intervieweeResult.state);
          console.log('Interview state:', intervieweeResult.state);
          
          if (intervieweeResult.state === 'completed') break;

          await new Promise(resolve => setTimeout(resolve, 500));
          if (!isMounted || !isSimulating) break;

          // Interviewer's turn
          const interviewerResult = await interviewService.conductInterview(
            context,
            interviewer,
            conversation.map(m => ({ role: m.sender, content: m.content }))
          );

          if (!isMounted || !isSimulating) break;
          
          const interviewerMessage: SimMessage = {
            id: Date.now().toString(),
            content: interviewerResult.content,
            sender: 'interviewer',
            timestamp: new Date()
          };
          await addMessageWithDelay(interviewerMessage);
          conversation.push(interviewerMessage);  // Add to local conversation array

          setInterviewState(interviewerResult.state);
          console.log('Interview state:', interviewerResult.state);
          
          if (interviewerResult.state === 'completed') break;

          conversationLength++;
        }
      } catch (error) {
        console.error('Simulation error:', error);
      } finally {
        if (isMounted) {
          setIsSimulating(false);
        }
      }
    }

    if (isSimulating) {
      startSimulation();
    }

    return () => {
      isMounted = false;
    };
  }, [isSimulating, interviewService]); // Only depend on isSimulating

  const handleResetInterviewerTemplate = () => {
    interviewService.resetInterviewerTemplate();
    setInterviewerTemplate(interviewService.getInterviewerTemplate());
  };

  const handleResetIntervieweeTemplate = () => {
    interviewService.resetIntervieweeTemplate();
    setIntervieweeTemplate(interviewService.getIntervieweeTemplate());
  };

  const handleResetInsightsTemplate = () => {
    interviewService.resetInsightsTemplate();
    setInsightsTemplate(interviewService.getInsightsTemplate());
  };

  const handleResetAllTemplates = () => {
    handleResetInterviewerTemplate();
    handleResetIntervieweeTemplate();
    handleResetInsightsTemplate();
  };

  const handleStartSimulation = () => {
    setIsSimulating(true);
  };

  const handleStopSimulation = () => {
    setIsSimulating(false);
  };

  const handleCopyConversation = async () => {
    try {
      const text = messages.map(m => 
        `${m.content}\n${m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
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
      // Handle error
      toast.error('Failed to copy conversation');
    }
  };

  // Add this function to generate insights when conversation ends
  const generateInsights = async () => {
    try {
      const result = await interviewService.generateInsights(
        'project-id',
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

  // Update the simulation effect to generate insights when completed
  useEffect(() => {
    if (interviewState === 'completed' && messages.length > 0) {
      generateInsights();
    }
  }, [interviewState, messages]);

  const handleStartInterview = () => {
    interviewService.setInterviewerTemplate(interviewerTemplate);
    interviewService.setIntervieweeTemplate(intervieweeTemplate);
    interviewService.setInsightsTemplate(insightsTemplate);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      setHasStarted(true);
    }, 300); // Small delay to ensure scroll completes first
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
                <h2 className="text-xl font-semibold mb-4">About Interactive Interview Simulation</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>This mode will conduct a real-time interview simulation based on your project context:</p>
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
                  <p>The AI will:</p>
                  <ul className="list-disc pl-4 space-y-2">
                    <li>Conduct a natural, interactive conversation</li>
                    <li>Cover your prepared questions adaptively</li>
                    <li>Add relevant follow-up questions based on responses</li>
                    <li>Provide immediate feedback and insights</li>
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
                        intervieweeTemplate={intervieweeTemplate}
                        insightsTemplate={insightsTemplate}
                        onInterviewerTemplateChange={setInterviewerTemplate}
                        onIntervieweeTemplateChange={setIntervieweeTemplate}
                        onInsightsTemplateChange={setInsightsTemplate}
                      />
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  <AnimatedButton
                    icon={<Play />}
                    onClick={handleStartInterview}
                    className="w-full bg-primary hover:bg-primary/90 text-sm md:text-base"
                  >
                    Start Interactive Interview
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
                  <h1 className="text-2xl md:text-3xl font-bold mb-2">Interview Simulator</h1>
                  <p className="text-sm md:text-base text-muted-foreground">
                    Test your interview flow with our AI interviewer
                  </p>
                </div>
              </div>
              
              {/* Simulation Controls */}
              <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
                  {isSimulating ? (
                    <AnimatedButton
                      onClick={handleStopSimulation}
                      icon={<Pause size={18} />}
                      variant="outline"
                      className="w-full sm:w-auto text-sm md:text-base"
                    >
                      Pause Simulation
                    </AnimatedButton>
                  ) : (
                    <AnimatedButton
                      onClick={handleStartSimulation}
                      icon={<Play size={18} />}
                      className="w-full sm:w-auto text-sm md:text-base"
                    >
                      Start Simulation
                    </AnimatedButton>
                  )}
                  <select
                    value={simulationSpeed}
                    onChange={(e) => setSimulationSpeed(e.target.value as any)}
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm md:text-base w-full sm:w-auto"
                  >
                    <option value="slow">Slow</option>
                    <option value="normal">Normal</option>
                    <option value="fast">Fast</option>
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-2 w-full sm:w-auto sm:flex sm:items-center sm:gap-2">
                  <AnimatedButton
                    variant="outline"
                    size="sm"
                    onClick={() => setMessages([])}
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
                    className="text-xs md:text-sm"
                  >
                    Copy
                  </AnimatedButton>
                  <AnimatedButton
                    variant="outline"
                    size="sm"
                    onClick={handleSaveTranscript}
                    icon={<Save size={16} />}
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
                    <ToastContainer position="bottom-right" />
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
    </PageTransition>
  );
};

export default InterviewSimulator;
