
import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import PageTransition from '@/components/ui/PageTransition';
import GlassCard from '@/components/common/GlassCard';
import AnimatedButton from '@/components/common/AnimatedButton';
import ProjectCard from '@/components/dashboard/ProjectCard';
import { Input } from '@/components/ui/input';

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock projects data
  const projects = [
    {
      id: '1',
      title: 'Mobile App User Research',
      description: 'Understanding user needs and pain points for our mobile application.',
      interviewCount: 8,
      lastUpdated: '2 days ago',
      progress: 65,
    },
    {
      id: '2',
      title: 'Subscription Model Validation',
      description: 'Exploring pricing models and subscription tiers with potential customers.',
      interviewCount: 5,
      lastUpdated: '1 week ago',
      progress: 40,
    },
    {
      id: '3',
      title: 'New Feature Concept Testing',
      description: 'Gathering feedback on proposed new features for the platform.',
      interviewCount: 12,
      lastUpdated: 'Yesterday',
      progress: 90,
    },
    {
      id: '4',
      title: 'Competitor Analysis',
      description: 'Interviewing users of competitive products to understand differences.',
      interviewCount: 6,
      lastUpdated: '3 days ago',
      progress: 50,
    },
    {
      id: '5',
      title: 'Onboarding Flow Research',
      description: 'Improving the initial user experience through targeted interviews.',
      interviewCount: 3,
      lastUpdated: '5 days ago',
      progress: 25,
    },
    {
      id: '6',
      title: 'Enterprise Customer Needs',
      description: 'Understanding specific requirements for enterprise-level customers.',
      interviewCount: 4,
      lastUpdated: '1 day ago',
      progress: 35,
    },
  ];

  // Filter projects based on search query
  const filteredProjects = searchQuery
    ? projects.filter(project => 
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : projects;

  return (
    <PageTransition transition="fade" className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Your Research Projects</h1>
            <p className="text-muted-foreground">
              Manage and organize your user research initiatives
            </p>
          </div>
          
          <AnimatedButton
            icon={<Plus size={18} />}
            iconPosition="left"
          >
            New Project
          </AnimatedButton>
        </div>
        
        {/* Search and Filter */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search projects..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, index) => (
            <PageTransition
              key={project.id}
              transition="scale"
              duration={300 + index * 50}
            >
              <ProjectCard {...project} />
            </PageTransition>
          ))}
          
          {/* Empty State */}
          {filteredProjects.length === 0 && (
            <div className="col-span-full">
              <GlassCard className="py-12 text-center">
                <h3 className="text-xl font-medium mb-2">No projects found</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your search or create a new project
                </p>
                <AnimatedButton
                  icon={<Plus size={18} />}
                  iconPosition="left"
                >
                  Create New Project
                </AnimatedButton>
              </GlassCard>
            </div>
          )}
        </div>
        
        {/* Stats Overview */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Research Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Total Projects', value: '6' },
              { label: 'Interviews Conducted', value: '38' },
              { label: 'Insights Generated', value: '142' },
              { label: 'Hours Saved', value: '76' },
            ].map((stat, index) => (
              <PageTransition
                key={index}
                transition="scale"
                duration={300 + index * 100}
              >
                <GlassCard>
                  <h3 className="text-muted-foreground text-sm mb-1">{stat.label}</h3>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </GlassCard>
              </PageTransition>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Dashboard;
