
import React from 'react';
import { BarChart3, Users, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import GlassCard from '../common/GlassCard';
import { Link } from 'react-router-dom';

interface ProjectCardProps {
  title: string;
  description: string;
  interviewCount: number;
  lastUpdated: string;
  progress: number;
  id: string;
  className?: string;
}

const ProjectCard = ({
  title,
  description,
  interviewCount,
  lastUpdated,
  progress,
  id,
  className,
}: ProjectCardProps) => {
  return (
    <Link to={`/dashboard/${id}`}>
      <GlassCard 
        className={cn("h-full cursor-pointer", className)}
        hoverEffect
      >
        <div className="flex flex-col h-full">
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
          </div>
          
          <div className="mt-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Progress</span>
              <span className="text-xs font-medium">{progress}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-1.5 mb-4">
              <div 
                className="bg-primary h-1.5 rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users size={14} />
                <span>{interviewCount} interviews</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                <span>{lastUpdated}</span>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </Link>
  );
};

export default ProjectCard;
