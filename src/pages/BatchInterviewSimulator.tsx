import React, { useState, useEffect } from 'react';
import { Sparkles, Save, ArrowLeft, Copy, Info, Settings, ChevronDown, ChevronUp } from 'lucide-react';
import PageTransition from '@/components/ui/PageTransition';
import GlassCard from '@/components/common/GlassCard';
import { Button } from '@/components/ui/button';
import AnimatedButton from '@/components/common/AnimatedButton';
import { Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import BatchInterviewTemplateEditor from '@/components/interview/BatchInterviewTemplateEditor';

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
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [batchInterviewTemplate, setBatchInterviewTemplate] = useState('');

  useEffect(() => {
    // Load the template when component mounts
    setBatchInterviewTemplate(batchInterviewService.getBatchInterviewTemplate());
  }, []);

  const handleResetTemplate = () => {
    batchInterviewService.resetBatchInterviewTemplate();
    setBatchInterviewTemplate(batchInterviewService.getBatchInterviewTemplate());
  };

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

    batchInterviewService.setBatchInterviewTemplate(batchInterviewTemplate);

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
                    <li>Generate a natural conversation flow</li>
                    <li>Cover all your prepared questions</li>
                    <li>Add relevant follow-up questions</li>
                    <li>Provide key insights and recommendations</li>
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
                  <div className="space-y-3 mb-6 p-4 border border-dashed rounded-lg bg-muted/30">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h3 className="text-md font-semibold">Prompt Template</h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleResetTemplate}
                        className="self-start sm:self-auto"
                      >
                        Reset to Default
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Customize how the AI generates the batch interview
                    </p>
                    <div className="border rounded-lg bg-card p-2 sm:p-4">
                      <BatchInterviewTemplateEditor
                        batchInterviewTemplate={batchInterviewTemplate}
                        onBatchInterviewTemplateChange={setBatchInterviewTemplate}
                      />
                    </div>
                  </div>
                )}

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
