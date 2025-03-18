
import React, { useEffect, useState } from 'react';
import { ArrowRight, Users, Target, LineChart, ZapIcon, ArrowRightIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageTransition from '@/components/ui/PageTransition';
import GlassCard from '@/components/common/GlassCard';
import AnimatedButton from '@/components/common/AnimatedButton';

const Index = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const features = [
    {
      icon: <Users className="h-6 w-6 text-primary" />,
      title: 'AI-Powered Interviews',
      description: 'Conduct in-depth user interviews with our AI interviewer that adapts to responses.',
    },
    {
      icon: <Target className="h-6 w-6 text-primary" />,
      title: 'Question Builder',
      description: 'Craft effective interview questions that uncover deep user insights.',
    },
    {
      icon: <LineChart className="h-6 w-6 text-primary" />,
      title: 'Insights Dashboard',
      description: 'Transform interview data into actionable insights for product decisions.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-tr from-primary/10 via-primary/15 to-transparent blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <PageTransition transition="slide-up" duration={800}>
              <div className="inline-block mb-3 px-3 py-1 bg-primary/15 rounded-full">
                <span className="text-sm font-medium text-primary">Unlock Product-Market Fit</span>
              </div>
            </PageTransition>
            
            <PageTransition transition="slide-up" duration={1000}>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                <span className="branded-text">Discover insights</span> that drive product success
              </h1>
            </PageTransition>
            
            <PageTransition transition="slide-up" duration={1200}>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                InsightFlow helps startups identify and validate product-market fit through AI-guided user interviews and data-driven insights.
              </p>
            </PageTransition>
            
            <PageTransition transition="slide-up" duration={1400}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/dashboard">
                  <AnimatedButton size="lg" className="w-full sm:w-auto" icon={<ArrowRight size={18} />} iconPosition="right">
                    Get Started
                  </AnimatedButton>
                </Link>
                <Link to="/demo">
                  <AnimatedButton 
                    variant="secondary" 
                    size="lg" 
                    className="w-full sm:w-auto bg-gradient-to-r from-primary/20 to-primary/10 hover:from-primary/30 hover:to-primary/20"
                    icon={<ZapIcon size={18} />}
                    iconPosition="left"
                  >
                    Try Demo Interview
                  </AnimatedButton>
                </Link>
              </div>
            </PageTransition>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <PageTransition transition="slide-up">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Research-driven insights for <span className="accent-text">confident decisions</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                InsightFlow streamlines the user research process with AI-powered tools that help you understand your customers.
              </p>
            </PageTransition>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <PageTransition 
                key={index} 
                transition="scale" 
                duration={600 + index * 200}
                className="h-full"
              >
                <GlassCard className="h-full flex flex-col" hoverEffect>
                  <div className="p-3 rounded-full bg-primary/10 inline-block mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </GlassCard>
              </PageTransition>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-background to-accent/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <PageTransition transition="slide-up">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                How <span className="highlight-text">InsightFlow</span> works
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                A streamlined process for gathering and analyzing user insights.
              </p>
            </PageTransition>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {[
              { 
                step: 1, 
                title: 'Craft Questions', 
                description: 'Design effective interview questions that uncover valuable insights.',
                icon: <div className="text-2xl font-bold">1</div>
              },
              { 
                step: 2, 
                title: 'Find Interviewees', 
                description: 'Identify and recruit relevant participants for your research.',
                icon: <div className="text-2xl font-bold">2</div>
              },
              { 
                step: 3, 
                title: 'Conduct Interviews', 
                description: 'Let our AI guide conversations that adapt to participant responses.',
                icon: <div className="text-2xl font-bold">3</div>
              },
              { 
                step: 4, 
                title: 'Generate Insights', 
                description: 'Transform raw interview data into actionable product insights.',
                icon: <div className="text-2xl font-bold">4</div>
              },
            ].map((step, index) => (
              <PageTransition 
                key={index} 
                transition="slide-up" 
                duration={600 + index * 200}
                className="h-full"
              >
                <GlassCard className="h-full flex flex-col items-center text-center relative" hoverEffect>
                  <div className="p-3 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                  
                  {/* Add arrow for all cards except the last one */}
                  {index < 3 && (
                    <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 hidden md:block z-10">
                      <ArrowRightIcon className="w-6 h-6 text-primary" />
                    </div>
                  )}
                </GlassCard>
              </PageTransition>
            ))}

            {/* Removing the old connection line with dots */}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <PageTransition transition="scale">
            <GlassCard className="max-w-5xl mx-auto text-center p-10 md:p-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to unlock <span className="accent-text">product-market fit</span>?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Start gathering meaningful insights from your customers today and build products they'll love.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/dashboard">
                  <AnimatedButton size="lg" className="w-full sm:w-auto" icon={<ZapIcon size={18} />} iconPosition="left">
                    Get Started Free
                  </AnimatedButton>
                </Link>
                <Link to="/demo">
                  <AnimatedButton variant="outline" size="lg" className="w-full sm:w-auto">
                    Try Demo Interview
                  </AnimatedButton>
                </Link>
              </div>
            </GlassCard>
          </PageTransition>
        </div>
      </section>
    </div>
  );
};

export default Index;
