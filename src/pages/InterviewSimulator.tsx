
import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, Mic, MicOff } from 'lucide-react';
import PageTransition from '@/components/ui/PageTransition';
import GlassCard from '@/components/common/GlassCard';
import AnimatedButton from '@/components/common/AnimatedButton';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const InterviewSimulator = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your AI interviewer today. I'd like to learn more about your experiences with productivity tools. Could you start by telling me which tools you currently use to manage your tasks?",
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    
    // Simulate AI thinking
    setIsThinking(true);
    
    // Simulate AI response after delay
    setTimeout(() => {
      const responses = [
        "That's interesting! Could you tell me more about why you chose those specific tools?",
        "How do these tools help you in your day-to-day work? Are there any specific features you find particularly valuable?",
        "Have you encountered any limitations with these tools? What would make them better for your workflow?",
        "If you could design the perfect productivity tool, what would it include that current solutions are missing?",
        "Thank you for sharing that. How has your approach to productivity changed over time?",
      ];
      
      const aiMessage: Message = {
        id: Date.now().toString(),
        content: responses[Math.floor(Math.random() * responses.length)],
        sender: 'ai',
        timestamp: new Date(),
      };
      
      setIsThinking(false);
      setMessages(prev => [...prev, aiMessage]);
    }, 1500);
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
          
          {/* Interview Session */}
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
                      message.sender === 'user' ? "justify-end" : "justify-start"
                    )}
                  >
                    <div 
                      className={cn(
                        "max-w-[75%] rounded-2xl p-4",
                        message.sender === 'user' 
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
              </div>
            </div>
            
            {/* Message Input */}
            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleRecording}
                  className={cn(
                    "p-2 rounded-full",
                    isRecording 
                      ? "bg-destructive text-destructive-foreground" 
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  )}
                >
                  {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your response..."
                  className="flex-grow"
                />
                <AnimatedButton 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  size="icon"
                >
                  <Send size={18} />
                </AnimatedButton>
              </div>
            </div>
          </GlassCard>
          
          {/* Interview Controls */}
          <div className="flex justify-between items-center">
            <AnimatedButton variant="outline">
              Save Transcript
            </AnimatedButton>
            <Link to="/insights">
              <AnimatedButton>
                Generate Insights
              </AnimatedButton>
            </Link>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default InterviewSimulator;
