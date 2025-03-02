
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  transition?: 'fade' | 'slide-up' | 'slide-down' | 'scale';
  duration?: number;
}

const PageTransition = ({
  children,
  className,
  transition = 'fade',
  duration = 300,
}: PageTransitionProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  const getTransitionClass = () => {
    switch (transition) {
      case 'fade':
        return isVisible ? 'opacity-100' : 'opacity-0';
      case 'slide-up':
        return isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0';
      case 'slide-down':
        return isVisible ? 'translate-y-0 opacity-100' : 'translate-y-[-10px] opacity-0';
      case 'scale':
        return isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0';
      default:
        return isVisible ? 'opacity-100' : 'opacity-0';
    }
  };

  return (
    <div
      className={cn(
        'transition-all ease-out',
        getTransitionClass(),
        className
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
};

export default PageTransition;
