import React, { useState } from 'react';
import { Sparkles, Save, ArrowLeft, Copy, Info } from 'lucide-react';
import PageTransition from '@/components/ui/PageTransition';
import GlassCard from '@/components/common/GlassCard';
import AnimatedButton from '@/components/common/AnimatedButton';
import { Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import batchInterviewService from '@/services/batchInterviewService';
import { toast } from 'react-toastify';

interface SimMessage {
  role: 'interviewer' | 'interviewee';
  content: string;
}

const BatchInterviewSimulator = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const interviewContext = location.state?.interviewContext;

  // Redirect if no context is provided
  if (!interviewContext) {
    return <Navigate to="/interview-builder" replace />;
  }

  const [messages, setMessages] = useState<SimMessage[]>([]);
  const [insights, setInsights] = useState<{ keyFindings: string[]; recommendations: string[]; }>({ 
    keyFindings: [], 
    recommendations: [] 
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const generateInterview = async () => {
    setIsGenerating(true);
    try {
      const result = await batchInterviewService.generateInterview(interviewContext);
      setMessages(result.messages);
      setInsights(result.insights);
    } catch (error) {
      console.error('Failed to generate interview:', error);
      toast.error('Failed to generate interview');
    } finally {
      setIsGenerating(false);
    }
  };

  const startGenerator = () => {
    setHasStarted(true);
    generateInterview();
  };

  return (
    <PageTransition transition="fade">
      <div className="container mx-auto p-4">
        <div className="flex justify-between mb-6">
          <AnimatedButton 
            icon={<ArrowLeft />}
            onClick={() => navigate(-1)}
          >
            Back
          </AnimatedButton>
        </div>

        {!hasStarted ? (
          <GlassCard className="mb-6 p-6">
            <div className="flex items-start gap-4">
              <Info className="w-6 h-6 text-primary mt-1" />
              <div>
                <h2 className="text-xl font-semibold mb-4">About Batch Interview Generation</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>This mode will generate a complete simulated interview based on your project context:</p>
                  <ul className="list-disc pl-4 space-y-2">
                    <li>Project: <span className="text-foreground">{interviewContext.projectName}</span></li>
                    <li>Audience: <span className="text-foreground">{interviewContext.targetAudience}</span></li>
                    <li>Questions: <span className="text-foreground">{interviewContext.questions.length} prepared</span></li>
                  </ul>
                  <p>The AI will:</p>
                  <ul className="list-disc pl-4 space-y-2">
                    <li>Generate a natural conversation flow</li>
                    <li>Cover all your prepared questions</li>
                    <li>Add relevant follow-up questions</li>
                    <li>Provide key insights and recommendations</li>
                  </ul>
                </div>
                <div className="mt-6">
                  <AnimatedButton 
                    icon={<Sparkles />}
                    onClick={startGenerator}
                    disabled={isGenerating}
                    className="w-full"
                  >
                    {isGenerating ? 'Generating Interview...' : 'Start Generation'}
                  </AnimatedButton>
                </div>
              </div>
            </div>
          </GlassCard>
        ) : (
          <>
            {/* Messages Display */}
            <GlassCard className="mb-6">
              {messages.map((message, index) => (
                <div key={index} className={cn(
                  "p-4 mb-2 rounded",
                  message.role === 'interviewer' ? 'bg-primary/10' : 'bg-secondary/10'
                )}>
                  <div className="font-semibold mb-1">{message.role}</div>
                  <div>{message.content}</div>
                </div>
              ))}
            </GlassCard>

            {/* Insights Display */}
            {insights.keyFindings.length > 0 && (
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold mb-4">Key Insights</h3>
                <div className="grid gap-4">
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
          </>
        )}
      </div>
    </PageTransition>
  );
};

export default BatchInterviewSimulator;
