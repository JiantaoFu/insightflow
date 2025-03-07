import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, MessageCircle, ArrowLeft } from 'lucide-react';
import PageTransition from '@/components/ui/PageTransition';
import GlassCard from '@/components/common/GlassCard';
import AnimatedButton from '@/components/common/AnimatedButton';

const mockInterviewContext = {
  projectName: "Mock Project",
  objectives: ["Understand user needs", "Identify pain points"],
  targetAudience: "Product Managers, Developers",
  questions: [
    { question: "What problem were you trying to solve when you found our product?", purpose: "Understand the initial user pain point" },
    { question: "How are you currently solving this problem?", purpose: "Learn about existing alternatives and workflows" },
    { question: "What would make this product a must-have for you?", purpose: "Identify key features and value propositions" }
  ],
  personas: {
    interviewer: {
      role: 'interviewer',
      background: "Product Research Expert",
      expertise: ["User Research", "Product Strategy", "Market Analysis"],
      personality: "Professional but friendly, asks insightful follow-up questions"
    },
    interviewee: {
      role: 'interviewee',
      background: "Product Manager",
      expertise: ["User Experience", "Product Development"],
      personality: "Experienced professional with relevant domain knowledge"
    }
  }
};

const InterviewLanding = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const interviewContext = location.state?.interviewContext || mockInterviewContext;

  const handleBack = () => {
    navigate('/interview-builder', {
      state: { 
        preservedContext: {
          ...interviewContext,
          projectName: interviewContext.projectName,
          targetAudience: interviewContext.targetAudience,
          objectives: interviewContext.objectives,
          suggestions: interviewContext.suggestions || {},
          setupState: interviewContext.setupState,
          generatedQuestions: interviewContext.generatedQuestions || [] // Preserve generated questions
        }
      }
    });
  };

  return (
    <PageTransition transition="fade">
      <div className="container mx-auto p-8">
        <div className="flex justify-between mb-8">
          <AnimatedButton 
            icon={<ArrowLeft />}
            onClick={handleBack}
          >
            Back
          </AnimatedButton>
        </div>
        
        <h1 className="text-3xl font-bold mb-8">Choose Interview Mode</h1>
        
        <div className="grid md:grid-cols-2 gap-6">
          <GlassCard className="p-6">
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <MessageCircle size={20} />
              Interactive Simulation
            </h2>
            <p className="text-muted-foreground mb-4">
              Conduct a real-time interview simulation with turn-by-turn responses.
              Best for practicing interview techniques and following up on specific points.
            </p>
            <Link to="/interview-simulator" state={{ interviewContext }}>
              <AnimatedButton icon={<ArrowRight />} iconPosition="right">
                Start Interactive Mode
              </AnimatedButton>
            </Link>
          </GlassCard>

          <GlassCard className="p-6">
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <Sparkles size={20} />
              Batch Generation
            </h2>
            <p className="text-muted-foreground mb-4">
              Generate complete interview simulations instantly with AI analysis.
              Best for quick validation and getting structured insights.
            </p>
            <Link to="/batch-interview" state={{ interviewContext }}>
              <AnimatedButton icon={<ArrowRight />} iconPosition="right">
                Try Batch Mode
              </AnimatedButton>
            </Link>
          </GlassCard>
        </div>
      </div>
    </PageTransition>
  );
};

export default InterviewLanding;
