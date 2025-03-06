
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, ExternalLink, Filter, Check } from 'lucide-react';
import PageTransition from '@/components/ui/PageTransition';
import GlassCard from '@/components/common/GlassCard';
import AnimatedButton from '@/components/common/AnimatedButton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';

// Mock data for insights
const insightCategories = [
  {
    category: "Pain Points",
    insights: [
      {
        id: "1",
        content: "Most users struggle with integrating multiple tools in their workflow",
        frequency: 8,
        interviews: [1, 3, 4, 5, 7, 8, 10, 12],
        quotes: [
          "I waste at least an hour every day switching between tools",
          "Nothing talks to each other, it's frustrating",
        ],
      },
      {
        id: "2",
        content: "Search functionality is inadequate across existing solutions",
        frequency: 6,
        interviews: [2, 3, 6, 8, 9, 11],
        quotes: [
          "I can never find what I'm looking for quickly",
          "The search is too basic and doesn't understand what I mean",
        ],
      },
    ],
  },
  {
    category: "Feature Requests",
    insights: [
      {
        id: "3",
        content: "Users want AI-powered assistance for organizing information",
        frequency: 9,
        interviews: [1, 2, 4, 5, 7, 8, 10, 11, 12],
        quotes: [
          "I wish the tool could automatically organize my notes",
          "An AI assistant would save me hours of manual organization",
        ],
      },
      {
        id: "4",
        content: "Mobile-first experience with full feature parity is crucial",
        frequency: 7,
        interviews: [2, 3, 5, 7, 9, 11, 12],
        quotes: [
          "I need to access everything on my phone, not just a limited version",
          "Most tools have terrible mobile experiences that lack key features",
        ],
      },
    ],
  },
  {
    category: "User Goals",
    insights: [
      {
        id: "5",
        content: "Primary goal is reducing context switching between applications",
        frequency: 10,
        interviews: [1, 2, 3, 4, 5, 7, 8, 9, 11, 12],
        quotes: [
          "I want one place for everything",
          "The constant switching between apps destroys my focus",
        ],
      },
      {
        id: "6",
        content: "Users want better collaboration features for team projects",
        frequency: 8,
        interviews: [1, 3, 4, 6, 8, 9, 10, 12],
        quotes: [
          "Sharing and collaborating should be seamless",
          "I need to see what my team is working on in real-time",
        ],
      },
    ],
  },
];

// Chart data
const chartData = [
  { name: 'Context Switching', value: 10, fill: 'rgb(37, 99, 235)' },
  { name: 'AI Assistance', value: 9, fill: 'rgb(37, 99, 235)' },
  { name: 'Integration Issues', value: 8, fill: 'rgb(37, 99, 235)' },
  { name: 'Collaboration', value: 8, fill: 'rgb(37, 99, 235)' },
  { name: 'Mobile Experience', value: 7, fill: 'rgb(37, 99, 235)' },
  { name: 'Search Quality', value: 6, fill: 'rgb(37, 99, 235)' },
];

const recommendations = [
  {
    id: "1",
    title: "All-in-one Workspace",
    description: "Develop a unified workspace that combines notes, tasks, and documents to minimize context switching.",
    priority: "High",
  },
  {
    id: "2",
    title: "AI-Powered Organization",
    description: "Implement smart AI features for automatic organization, tagging, and surfacing relevant content.",
    priority: "High",
  },
  {
    id: "3",
    title: "Mobile-First Design",
    description: "Ensure complete feature parity between mobile and desktop versions with intuitive touch interfaces.",
    priority: "Medium",
  },
  {
    id: "4",
    title: "Advanced Search",
    description: "Develop semantic search capabilities that understand context and user intent beyond keywords.",
    priority: "Medium",
  },
  {
    id: "5",
    title: "Real-time Collaboration",
    description: "Create seamless collaboration features with presence indicators, commenting, and shared workspaces.",
    priority: "High",
  },
];

const Insights = () => {
  const [activeTab, setActiveTab] = useState('summary');
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <PageTransition transition="fade" className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-8">
          <Link to="/interview-modes">
            <AnimatedButton variant="outline" size="sm" icon={<ArrowLeft size={16} />} iconPosition="left">
              Back to Interview
            </AnimatedButton>
          </Link>
        </div>
        
        <div>
          <h1 className="text-3xl font-bold mb-2">Research Insights</h1>
          <p className="text-muted-foreground mb-8">
            Actionable findings from your user interviews
          </p>
          
          <Tabs defaultValue="summary" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-8">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="insights">Detailed Insights</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            </TabsList>
            
            {/* Summary Tab */}
            <TabsContent value="summary" className="animate-slide-up">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <GlassCard>
                  <h2 className="text-xl font-semibold mb-4">Key Themes</h2>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={chartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" />
                        <YAxis 
                          type="category" 
                          dataKey="name" 
                          width={120}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip 
                          formatter={(value) => [`${value} mentions`, 'Frequency']}
                          contentStyle={{ 
                            background: 'rgba(255, 255, 255, 0.9)',
                            border: '1px solid #f0f0f0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                          }}
                        />
                        <Bar 
                          dataKey="value" 
                          radius={[0, 4, 4, 0]}
                          barSize={24}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </GlassCard>
                
                <GlassCard>
                  <h2 className="text-xl font-semibold mb-4">Summary of Findings</h2>
                  <div className="space-y-4">
                    <p>
                      Based on 12 user interviews, we identified several consistent pain points and desires across participants. The most prominent issue is the <strong>frustration with context switching</strong> between multiple applications, mentioned by 83% of interviewees.
                    </p>
                    <p>
                      There's strong interest in <strong>AI-powered organizational features</strong> (75%) that could automatically categorize and surface relevant information. Users also emphasized the importance of <strong>seamless collaboration</strong> (67%) and <strong>mobile-first experiences</strong> (58%).
                    </p>
                    <p>
                      The target audience shows a clear willingness to pay for solutions that effectively address these pain points, with 70% indicating they would consider switching from their current tools if a better alternative was available.
                    </p>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <AnimatedButton
                      variant="outline"
                      size="sm"
                      icon={<Download size={16} />}
                      iconPosition="left"
                    >
                      Download Full Report
                    </AnimatedButton>
                  </div>
                </GlassCard>
                
                <GlassCard className="lg:col-span-2">
                  <h2 className="text-xl font-semibold mb-4">Top Recommendations</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {recommendations.slice(0, 3).map((rec) => (
                      <div key={rec.id} className="flex flex-col h-full">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={cn(
                            "px-2 py-0.5 text-xs font-medium rounded-full",
                            rec.priority === "High" ? "bg-insight-light text-insight-dark" : "bg-secondary text-muted-foreground"
                          )}>
                            {rec.priority} Priority
                          </div>
                        </div>
                        <h3 className="text-lg font-medium mb-2">{rec.title}</h3>
                        <p className="text-muted-foreground text-sm">{rec.description}</p>
                      </div>
                    ))}
                  </div>
                  <Separator className="my-6" />
                  <div className="flex justify-center">
                    <AnimatedButton
                      variant="outline"
                      onClick={() => setActiveTab('recommendations')}
                    >
                      View All Recommendations
                    </AnimatedButton>
                  </div>
                </GlassCard>
              </div>
            </TabsContent>
            
            {/* Detailed Insights Tab */}
            <TabsContent value="insights" className="animate-slide-up">
              <div className="mb-6 flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Detailed Insights</h2>
                <div className="flex items-center gap-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <AnimatedButton variant="outline" size="sm" icon={<Filter size={16} />} iconPosition="left">
                        Filter
                      </AnimatedButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem className="flex items-center gap-2">
                        <Check size={16} className="text-primary" />
                        <span>Pain Points</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-2">
                        <Check size={16} className="text-primary" />
                        <span>Feature Requests</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-2">
                        <Check size={16} className="text-primary" />
                        <span>User Goals</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <AnimatedButton
                    variant="outline"
                    size="sm"
                    icon={<Download size={16} />}
                    iconPosition="left"
                  >
                    Export
                  </AnimatedButton>
                </div>
              </div>
              
              <div className="space-y-10">
                {insightCategories.map((category) => (
                  <div key={category.category}>
                    <h3 className="text-xl font-semibold mb-4">{category.category}</h3>
                    <div className="space-y-4">
                      {category.insights.map((insight) => (
                        <GlassCard key={insight.id}>
                          <div className="flex flex-col md:flex-row md:items-center gap-4">
                            <div className="md:w-16 flex items-center justify-center">
                              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-primary text-lg font-semibold">{insight.frequency}</span>
                              </div>
                            </div>
                            <div className="flex-1">
                              <p className="text-lg font-medium mb-2">{insight.content}</p>
                              <div className="text-sm text-muted-foreground mb-4">
                                Mentioned in {insight.interviews.length} interviews: #{insight.interviews.join(', #')}
                              </div>
                              <div className="bg-secondary/50 rounded-lg p-4">
                                <h4 className="text-sm font-medium mb-2">Sample Quotes:</h4>
                                <ul className="space-y-2">
                                  {insight.quotes.map((quote, index) => (
                                    <li key={index} className="text-sm italic">"{quote}"</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </GlassCard>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            {/* Recommendations Tab */}
            <TabsContent value="recommendations" className="animate-slide-up">
              <div className="mb-6 flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Recommendations</h2>
                <AnimatedButton
                  variant="outline"
                  size="sm"
                  icon={<Download size={16} />}
                  iconPosition="left"
                >
                  Export Action Plan
                </AnimatedButton>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                {recommendations.map((rec) => (
                  <GlassCard key={rec.id}>
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="md:w-40">
                        <div className={cn(
                          "px-3 py-1 inline-flex items-center rounded-full text-sm font-medium",
                          rec.priority === "High" 
                            ? "bg-insight-light text-insight-dark" 
                            : rec.priority === "Medium"
                              ? "bg-primary/10 text-primary"
                              : "bg-secondary text-muted-foreground"
                        )}>
                          {rec.priority} Priority
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{rec.title}</h3>
                        <p className="text-muted-foreground mb-4">{rec.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-secondary/50 rounded-lg p-4">
                            <h4 className="text-sm font-medium mb-2">Implementation Suggestions:</h4>
                            <ul className="list-disc pl-5 space-y-1 text-sm">
                              <li>Start with an MVP focused on core functionality</li>
                              <li>Validate with a small user group before full launch</li>
                              <li>Consider phased rollout to gather continuous feedback</li>
                            </ul>
                          </div>
                          <div className="bg-secondary/50 rounded-lg p-4">
                            <h4 className="text-sm font-medium mb-2">Expected Impact:</h4>
                            <ul className="list-disc pl-5 space-y-1 text-sm">
                              <li>Increase user retention by reducing friction</li>
                              <li>Differentiate from competitors with unique approach</li>
                              <li>Address key pain points identified in research</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageTransition>
  );
};

export default Insights;
