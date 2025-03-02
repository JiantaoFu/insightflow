import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, GripVertical } from 'lucide-react';
import GlassCard from '@/components/common/GlassCard';
import AnimatedButton from '@/components/common/AnimatedButton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface QuestionCardProps {
  question: string;
  description?: string;
  index: number;
  onEdit: (index: number, question: string, description: string) => void;
  onDelete: (index: number) => void;
  isDragging?: boolean;
  isGenerated?: boolean;  // New prop to indicate if this is a generated question
  onAdd?: () => void;     // New prop for adding generated questions
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  description,
  index,
  onEdit,
  onDelete,
  isDragging,
  isGenerated,
  onAdd,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedQuestion, setEditedQuestion] = useState(question);
  const [editedDescription, setEditedDescription] = useState(description || '');

  // Update local state when props change
  React.useEffect(() => {
    setEditedQuestion(question);
    setEditedDescription(description || '');
  }, [question, description]);

  const handleSave = () => {
    if (editedQuestion.trim()) {
      onEdit(index, editedQuestion, editedDescription);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedQuestion(question);
    setEditedDescription(description || '');
    setIsEditing(false);
  };

  return (
    <GlassCard className={`relative ${isDragging ? 'shadow-lg' : ''}`}>
      {isEditing ? (
        <div className="p-4 space-y-4">
          <Input
            value={editedQuestion}
            onChange={(e) => setEditedQuestion(e.target.value)}
            placeholder="Enter question"
            className="w-full"
          />
          <Textarea
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            placeholder="What do you want to learn from this question?"
            rows={2}
          />
          <div className="flex justify-end gap-2">
            <AnimatedButton
              size="sm"
              variant="ghost"
              onClick={handleCancel}
              icon={<X size={16} />}
            >
              Cancel
            </AnimatedButton>
            <AnimatedButton
              size="sm"
              onClick={handleSave}
              icon={<Save size={16} />}
              disabled={!editedQuestion.trim()}
            >
              Save
            </AnimatedButton>
          </div>
        </div>
      ) : (
        <div className="p-4">
          <div className="flex items-start gap-4">
            <div className="flex items-center gap-3">
              <span className="text-lg font-semibold text-muted-foreground w-6">
                {index + 1}
              </span>
              {!isGenerated && <GripVertical className="text-muted-foreground cursor-move" />}
            </div>
            <div className="flex-grow">
              <p className="font-medium mb-2">{question}</p>
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              {isGenerated && onAdd && (
                <AnimatedButton
                  size="sm"
                  variant="ghost"
                  onClick={onAdd}
                  icon={<Plus size={16} />}
                  className="text-primary hover:text-primary"
                >
                  Add
                </AnimatedButton>
              )}
              <AnimatedButton
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(true)}
                icon={<Edit2 size={16} />}
              />
              <AnimatedButton
                size="sm"
                variant="ghost"
                onClick={() => onDelete(index)}
                icon={<Trash2 size={16} />}
                className="text-destructive hover:text-destructive"
              />
            </div>
          </div>
        </div>
      )}
    </GlassCard>
  );
};

export default QuestionCard;
