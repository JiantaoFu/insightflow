import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Save, ArrowLeft, FastForward, RotateCw, Copy } from 'lucide-react';
import PageTransition from '@/components/ui/PageTransition';
import GlassCard from '@/components/common/GlassCard';
import AnimatedButton from '@/components/common/AnimatedButton';
import { Input } from '@/components/ui/input';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { InterviewSimulationService } from '@/services/interviewSimulationService';
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
  const [simulationSpeed, setSimulationSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');
  const [interviewState, setInterviewState] = useState<'ongoing' | 'asking_final_thoughts' | 'waiting_for_final_response' | 'completed'>('ongoing');
  
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

  const [interviewService] = useState(() => new InterviewSimulationService());

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
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
        content: response
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

  // Add effect to monitor message changes
  useEffect(() => {
    console.log('Messages updated:', messages.length);
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

        // Initial greeting
        const initialMessage: SimMessage = {
          id: Date.now().toString(),
          content: "Hello! Thank you for participating in this research interview. I'd like to learn about your experiences with productivity tools. First, could you briefly tell me about your role?",
          sender: 'interviewer',
          timestamp: new Date()
        };

        if (!isMounted) return;
        await addMessageWithDelay(initialMessage);
        conversation.push(initialMessage);

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

  return (
    <PageTransition transition="fade" className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-8">
          <Link to="/interview-builder">
            <AnimatedButton variant="outline" size="sm" icon={<ArrowLeft size={16} />} iconPosition="left">
              Back to Builder
            </AnimatedButton>
          </Link>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Interview Simulator</h1>
              <p className="text-muted-foreground">
                Test your interview flow with our AI interviewer
              </p>
            </div>
          </div>
          
          {/* Simulation Controls */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {isSimulating ? (
                <AnimatedButton
                  onClick={handleStopSimulation}
                  icon={<Pause size={18} />}
                  variant="outline"
                >
                  Pause Simulation
                </AnimatedButton>
              ) : (
                <AnimatedButton
                  onClick={handleStartSimulation}
                  icon={<Play size={18} />}
                >
                  Start Simulation
                </AnimatedButton>
              )}
              <select
                value={simulationSpeed}
                onChange={(e) => setSimulationSpeed(e.target.value as any)}
                className="rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="slow">Slow</option>
                <option value="normal">Normal</option>
                <option value="fast">Fast</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <AnimatedButton
                variant="outline"
                size="sm"
                onClick={() => setMessages([])}
                icon={<RotateCw size={16} />}
              >
                Reset
              </AnimatedButton>
              <AnimatedButton
                variant="outline"
                size="sm"
                onClick={handleCopyConversation}
                icon={<Copy size={16} />}
              >
                Copy Conversation
              </AnimatedButton>
              <AnimatedButton
                variant="outline"
                size="sm"
                onClick={handleSaveTranscript}
                icon={<Save size={16} />}
              >
                Save Transcript
              </AnimatedButton>
            </div>
          </div>

          {/* Chat Interface */}
          <GlassCard className="mb-8 p-0 overflow-hidden">
            {/* Interview Header */}
            <div className="bg-secondary/50 backdrop-blur-sm p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary text-lg font-semibold">AI</span>
                </div>
                <div>
                  <h3 className="font-medium">AI Interviewer</h3>
                  <p className="text-xs text-muted-foreground">Product Research Session</p>
                </div>
              </div>
            </div>
            
            {/* Messages */}
            <div className="p-6 h-[500px] overflow-y-auto scrollbar-hidden">
              <div className="space-y-6">
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
                        "max-w-[75%] rounded-2xl p-4",
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
                    <div className="bg-secondary max-w-[75%] rounded-2xl p-4">
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
        </div>
      </div>
    </PageTransition>
  );
};

export default InterviewSimulator;
