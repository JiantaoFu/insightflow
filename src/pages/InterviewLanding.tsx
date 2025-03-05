import React from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { ArrowRight, Sparkles, MessageCircle } from 'lucide-react';
import PageTransition from '@/components/ui/PageTransition';
import GlassCard from '@/components/common/GlassCard';
import AnimatedButton from '@/components/common/AnimatedButton';

const InterviewLanding = () => {
  const location = useLocation();
  const interviewContext = location.state?.interviewContext;

  // Redirect if no context is provided
  if (!interviewContext) {
    return <Navigate to="/interview-builder" replace />;
  }

  return (
    <PageTransition transition="fade">
      <div className="container mx-auto p-8">
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
