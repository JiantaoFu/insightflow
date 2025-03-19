import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Save, ArrowLeft, Settings, RotateCw, Copy, Mic, MicOff, Send, Download } from 'lucide-react';

// Add type definition for the Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
import { Button } from '@/components/ui/button';
import PageTransition from '@/components/ui/PageTransition';
import GlassCard from '@/components/common/GlassCard';
import AnimatedButton from '@/components/common/AnimatedButton';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
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

// Custom interviewer prompt for startup founders
const CUSTOM_INTERVIEWER_PROMPT = `# Role

You are an AI researcher interviewing startup founders to understand their their product, business, and (target) users.

# Goals

- Identify founders' current PMF journey, challenges, and unmet needs.
- Understand their ideal PMF process and how they validate it.
- Determine whether your AI-powered researcher aligns with their needs.
- Gather insights to decide whether to modify your product.

# Product Overview

Your product is an AI-powered researcher (interviewer) that conducts user interviews based on what founders want to learn. It also provides a TL;DR summary of insights after completing the interviews.

# Key Guidelines for the Interview

1. Engage naturally: Keep the conversation friendly, clear, and comfortable.
2. Be efficient but thorough: Founders are busy, so minimize unnecessary back-and-forth while ensuring strong insights.
3. Probe when responses are vague: If a response is too short or unclear, ask a targeted follow-up question to clarify before moving on. Example: If a founder answers "early stage", follow up with "Got it! What key milestones have you reached so far?"
4. Wait for a response before moving forward. After asking a question, do not assume an answer or continue speaking. Always wait for the participant's response before asking a follow-up. If no response is given after a reasonable pause, gently prompt them again rather than moving ahead on your own.
5. Adapt dynamically: If a founder answers multiple questions at once, don't repeat—move forward.
6. Avoid bias: Frame questions neutrally, without leading them toward specific answers.
7. Start with confirmation: Provide a brief introduction and get the founder's confirmation before beginning.
8. Keep the conversation fluid: Do not use structured labels (e.g., "Introduction:", "Question 1:"). The dialogue should feel natural.
9. Ask one question at a time: Start by asking only about the founder's startup (e.g., 'Can you tell me a bit about your startup and what you're building?'). Then, after their response, ask a separate follow-up question about their product-market fit journey. Do not combine these into a single question.
10. Keep questions simple and easy to understand: Use clear, conversational language and avoid complex phrasing. Break down long or multi-part questions into smaller, more direct ones. If a question involves a process or concept, make it more approachable by using familiar wording and examples.

# STATE MANAGEMENT:

- Wrapping up naturally once key objectives and questions are covered.
- **DO NOT ask any new questions or follow-ups once wrapping up.**
- Use [[STATE:COMPLETED]] only after final thoughts.  

Now respond to the user as the interviewer.`;

// Default demo interview context
const DEMO_INTERVIEW_CONTEXT = {
  projectId: 'demo-project',
  projectName: 'Startup Founder Research',
  targetAudience: 'Startup founders seeking product-market fit',
  objectives: [
    'Understand founders\' PMF journey and challenges',
    'Identify how founders validate their product ideas',
    'Determine if our AI researcher aligns with their needs'
  ],
  questions: [
    {
      question: 'Can you tell me a bit about your startup and what you\'re building?',
      purpose: 'Establish context'
    },
    {
      question: 'Where are you in your product-market fit journey?',
      purpose: 'Understand current state'
    },
    {
      question: 'How do you currently validate your product ideas with users?',
      purpose: 'Identify existing processes'
    },
    {
      question: 'What challenges do you face when trying to understand your users?',
      purpose: 'Discover pain points'
    }
  ],
  personas: {
    interviewer: {
      role: 'interviewer' as const,
      background: "AI Researcher for Startups",
      expertise: ["User Research", "Product-Market Fit", "Startup Growth"],
      personality: "Professional, empathetic, and insightful"
    }
  }
};

const DemoInterview = () => {
  const navigate = useNavigate();
  const [context] = useState(DEMO_INTERVIEW_CONTEXT);
  const [messages, setMessages] = useState<SimMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [hasStarted, setHasStarted] = useState(false); // Don't start automatically
  const [insights, setInsights] = useState<{ 
    keyFindings: string[]; 
    recommendations: string[]; 
  }>({ 
    keyFindings: [], 
    recommendations: [] 
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Create interviewer persona
  const [interviewer] = useState(DEMO_INTERVIEW_CONTEXT.personas.interviewer);
  
  // Create interview service instance
  const [interviewService] = useState(() => InterviewSimulationService);

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

  // Cleanup speech recognition on component unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, []);

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

  const handleSaveTranscript = () => {
    if (messages.length === 0) {
      toast.error('No conversation to save');
      return;
    }
    
    try {
      // Format the transcript
      let transcriptContent = `# AI Researcher Interview Transcript\n`;
      transcriptContent += `Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\n\n`;
      
      // Add interview context
      transcriptContent += `## Interview Context\n`;
      transcriptContent += `Project: ${context.projectName}\n`;
      transcriptContent += `Target Audience: ${context.targetAudience}\n\n`;
      
      // Add objectives
      transcriptContent += `## Objectives\n`;
      context.objectives.forEach((obj, i) => {
        transcriptContent += `${i+1}. ${obj}\n`;
      });
      transcriptContent += '\n';
      
      // Add conversation
      transcriptContent += `## Conversation\n\n`;
      messages.forEach(m => {
        const role = m.sender === 'interviewer' ? 'AI Researcher' : 'You';
        const time = new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        transcriptContent += `${role} (${time}):\n${m.content}\n\n`;
      });
      
      // Add insights if available
      if (insights.keyFindings.length > 0) {
        transcriptContent += `## Key Findings\n`;
        insights.keyFindings.forEach((finding, i) => {
          transcriptContent += `${i+1}. ${finding}\n`;
        });
        transcriptContent += '\n';
        
        transcriptContent += `## Recommendations\n`;
        insights.recommendations.forEach((rec, i) => {
          transcriptContent += `${i+1}. ${rec}\n`;
        });
      }
      
      // Create a blob and download link
      const blob = new Blob([transcriptContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      // Set filename with date for uniqueness
      const date = new Date();
      const formattedDate = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
      const filename = `interview-transcript-${formattedDate}.txt`;
      
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      toast.success('Transcript downloaded successfully!');
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
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Speech recognition is not supported in your browser');
      return;
    }

    if (isRecording) {
      // Stop recording
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      setIsRecording(false);
      toast.info('Voice recording stopped');
    } else {
      // Start recording
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        
        setNewMessage(prev => {
          // If we already have text, add a space before the new transcript
          const prefix = prev.trim() ? prev.trim() + ' ' : '';
          return prefix + transcript;
        });
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        toast.error(`Speech recognition error: ${event.error}`);
        setIsRecording(false);
      };
      
      recognition.onend = () => {
        setIsRecording(false);
      };
      
      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);
      toast.info('Voice recording started - speak now');
    }
  };

  // Scroll to the bottom of the messages container
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Start interview function - now called by button click instead of automatically
  const startInterview = async () => {
    if (messages.length > 0) return; // Don't start if already has messages
    
    setIsThinking(true);
    setIsInterviewActive(true);
    setHasStarted(true);
    
    try {
      // Initial greeting from AI interviewer
      const response = await interviewService.conductInterview(
        context,
        interviewer,
        [] // Empty conversation to start
      );
      
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
      setIsThinking(false);
    }
  };

  const handleStartInterview = () => {
    if (!hasStarted) {
      startInterview();
    } else {
      setIsInterviewActive(true);
    }
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
        context.projectId || 'demo-project',
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

  const handleResetInterview = () => {
    setMessages([]);
    setIsInterviewActive(false);
    setHasStarted(false);
  };

  return (
    <PageTransition transition="fade" className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between mb-6">
          <AnimatedButton
            icon={<ArrowLeft />}
            onClick={() => navigate('/')}
            className="text-sm md:text-base"
            size="sm"
          >
            Back
          </AnimatedButton>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">AI Researcher Demo</h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Chat with an AI researcher about your startup
              </p>
            </div>
          </div>
          
          {/* Interview Controls - Responsive Layout */}
          <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="w-full sm:w-auto">
              {!hasStarted ? (
                <AnimatedButton
                  onClick={handleStartInterview}
                  icon={<Play size={18} />}
                  className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
                >
                  Start Interview
                </AnimatedButton>
              ) : isInterviewActive ? (
                <AnimatedButton
                  onClick={handleStopInterview}
                  icon={<Pause size={18} />}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  Pause Interview
                </AnimatedButton>
              ) : (
                <AnimatedButton
                  onClick={handleStartInterview}
                  icon={<Play size={18} />}
                  className="w-full sm:w-auto"
                >
                  Resume Interview
                </AnimatedButton>
              )}
            </div>
            
            {/* Action buttons in a responsive grid */}
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
                icon={<Download size={16} />}
                disabled={messages.length === 0}
                className="text-xs md:text-sm"
              >
                Download
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
                  <h3 className="font-medium text-sm md:text-base">AI Researcher</h3>
                  <p className="text-xs text-muted-foreground">Startup Founder Interview</p>
                </div>
              </div>
            </div>
            
            {/* Messages or Welcome Screen */}
            <div 
              ref={messagesContainerRef} 
              className="p-4 md:p-6 h-[400px] md:h-[500px] overflow-y-auto scrollbar-hidden"
            >
              {!hasStarted ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-4">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Play className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold mb-2">Ready to start your interview?</h3>
                  <p className="text-sm md:text-base text-muted-foreground max-w-md mb-6">
                    Our AI researcher will ask you questions about your startup and product-market fit journey.
                  </p>
                  <Button 
                    onClick={handleStartInterview}
                    className="bg-primary hover:bg-primary/90"
                    size="lg"
                  >
                    Start Interview
                  </Button>
                </div>
              ) : (
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
              )}
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
                  disabled={!hasStarted || !isInterviewActive || isThinking}
                >
                  {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
                </Button>
                <Input
                  ref={inputRef}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={hasStarted ? "Type your response..." : "Start the interview to begin chatting..."}
                  className="flex-1 text-sm md:text-base"
                  disabled={!isInterviewActive || isThinking || !hasStarted}
                />
                <Button
                  type="button"
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || !isInterviewActive || isThinking || !hasStarted}
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
      </div>
      <ToastContainer position="bottom-right" />
    </PageTransition>
  );
};

export default DemoInterview;
