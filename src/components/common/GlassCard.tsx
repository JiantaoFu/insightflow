
import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

const GlassCard = ({ children, className, hoverEffect = false, ...props }: GlassCardProps) => {
  return (
    <div 
      className={cn(
        "glass rounded-2xl p-6 transition-all duration-300 ease-in-out border-primary/10",
        hoverEffect && "hover:shadow-lg hover:translate-y-[-4px] hover:border-primary/20",
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;
