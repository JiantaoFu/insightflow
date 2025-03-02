
import React, { useState } from 'react';
import { Trash2, Edit, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import GlassCard from '../common/GlassCard';

interface QuestionCardProps {
  question: string;
  description?: string;
  index: number;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
  isLast: boolean;
  isFirst: boolean;
}

const QuestionCard = ({
  question,
  description,
  index,
  onEdit,
  onDelete,
  onMove,
  isLast,
  isFirst,
}: QuestionCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <GlassCard
      className={cn(
        "relative transition-all duration-300 ease-in-out",
        isHovered ? "shadow-md" : ""
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-3">
        <div className="flex items-center text-muted-foreground">
          <span className="mr-2 text-sm w-6 text-center">{index + 1}</span>
          <div className="cursor-move">
            <GripVertical size={18} />
          </div>
        </div>
        <div className="flex-1">
          <h4 className="text-base font-medium mb-1">{question}</h4>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        <div className={cn(
          "flex items-center gap-1 transition-opacity duration-300",
          isHovered ? "opacity-100" : "opacity-0"
        )}>
          <button 
            className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            onClick={() => onEdit(index)}
            aria-label="Edit question"
          >
            <Edit size={16} />
          </button>
          <button 
            className="p-1.5 rounded-full text-muted-foreground hover:text-destructive hover:bg-accent transition-colors"
            onClick={() => onDelete(index)}
            aria-label="Delete question"
          >
            <Trash2 size={16} />
          </button>
          {!isFirst && (
            <button 
              className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              onClick={() => onMove(index, index - 1)}
              aria-label="Move up"
            >
              <ChevronUp size={16} />
            </button>
          )}
          {!isLast && (
            <button 
              className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              onClick={() => onMove(index, index + 1)}
              aria-label="Move down"
            >
              <ChevronDown size={16} />
            </button>
          )}
        </div>
      </div>
    </GlassCard>
  );
};

export default QuestionCard;
