import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import GlassCard from '@/components/common/GlassCard';
import AnimatedButton from '@/components/common/AnimatedButton';
import { Sparkles, Check, X, ArrowRight, PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import projectAnalysisService from '@/services/projectAnalysisService';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Input } from '@/components/ui/input';

interface ProjectContext {
  idea: string;
  name?: string;
  audiences?: string[];
  objectives?: string[];
}

interface ProjectSetupProps {
  onComplete: (context: ProjectContext & { suggestions: any; selected: any }) => void;
  initialState?: {
    idea: string;
    suggestions: {
      names?: string[];
      audiences?: string[];
      objectives?: string[];
    };
    selected: {
      name?: string;
      audiences: string[];
      objectives: string[];
    };
  };
}

const ProjectSetup: React.FC<ProjectSetupProps> = ({ 
  onComplete, 
  initialState = {
    idea: '',
    suggestions: {},
    selected: { audiences: [], objectives: [] }
  }
}) => {
  const [idea, setIdea] = useState(initialState.idea);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState(initialState.suggestions);
  const [selected, setSelected] = useState(initialState.selected);

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [newItems, setNewItems] = useState<{
    names: string;
    audiences: string;
    objectives: string;
  }>({
    names: '',
    audiences: '',
    objectives: ''
  });

  const handleAnalyze = async () => {
    if (!idea.trim()) return;
    setIsAnalyzing(true);
    
    try {
      const results = await projectAnalysisService.analyzeProject({ idea });
      // Update to merge with existing suggestions instead of replacing
      setSuggestions(prev => ({
        names: [...new Set([...(prev.names || []), ...(results.names || [])])],
        audiences: [...new Set([...(prev.audiences || []), ...(results.audiences || [])])],
        objectives: [...new Set([...(prev.objectives || []), ...(results.objectives || [])])]
      }));
    } catch (error) {
      console.error('Failed to analyze project:', error);
      // TODO: Add error toast
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleComplete = async () => {
    setIsTransitioning(true);
    // Simulate a smooth transition
    await new Promise(resolve => setTimeout(resolve, 500));
    onComplete({
      idea,
      name: selected.name || '',
      audiences: selected.audiences,
      objectives: selected.objectives,
      suggestions,  // Pass back the full state
      selected
    });
  };

  const toggleSelection = (type: 'audiences' | 'objectives', item: string) => {
    setSelected(prev => ({
      ...prev,
      [type]: prev[type].includes(item)
        ? prev[type].filter(i => i !== item)
        : [...prev[type], item]
    }));
  };

  const handleRefreshAnalysis = async () => {
    // Clear current selections but keep the idea
    setSelected({ audiences: [], objectives: [] });
    // Rerun the analysis
    setIsAnalyzing(true);
    try {
      const results = await projectAnalysisService.analyzeProject({ idea });
      setSuggestions(results);
    } catch (error) {
      console.error('Failed to refresh analysis:', error);
      // TODO: Add error toast
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddCustomItem = (type: 'names' | 'audiences' | 'objectives') => {
    const value = newItems[type].trim();
    if (value) {
      setSuggestions(prev => ({
        ...prev,
        [type]: [...(prev[type] || []), value]
      }));
      setNewItems(prev => ({ ...prev, [type]: '' }));
    }
  };

  const handleRemoveItem = (type: 'names' | 'audiences' | 'objectives', item: string) => {
    setSuggestions(prev => ({
      ...prev,
      [type]: (prev[type] || []).filter(i => i !== item)
    }));
    // Also remove from selected if it was selected
    if (type === 'names' && selected.name === item) {
      setSelected(prev => ({ ...prev, name: undefined }));
    } else if (type === 'audiences' || type === 'objectives') {
      setSelected(prev => ({
        ...prev,
        [type]: prev[type].filter(i => i !== item)
      }));
    }
  };

  return (
    <div className={`space-y-6 transition-all duration-500 ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100'}`}>
      {/* Initial Idea Input */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">What are you working on?</h3>
        <div className="space-y-4">
          <Textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Tell us about your project or the problem you're trying to solve...
            (e.g., 'I'm building a tool to help developers manage their time better' or 
            'I want to help small business owners with customer support')"
            rows={4}
            className="w-full"
          />
          <AnimatedButton
            onClick={handleAnalyze}
            disabled={!idea.trim() || isAnalyzing}
            icon={isAnalyzing ? <LoadingSpinner size="sm" /> : <Sparkles size={16} />}
            iconPosition="left"
            className="w-full"
          >
            {isAnalyzing ? 'Analyzing your idea...' : 'Get Research Suggestions'}
          </AnimatedButton>
        </div>
      </GlassCard>

      {/* Suggestions sections */}
      {Object.keys(suggestions).length > 0 && (
        <div className="space-y-4 animate-fadeIn">
          {suggestions.names && (
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Project Name</h3>
              <div className="flex flex-wrap gap-2">
                {suggestions.names.map((name) => (
                  <Badge
                    key={name}
                    variant={selected.name === name ? 'default' : 'outline'}
                    className="group cursor-pointer"
                  >
                    <span onClick={() => setSelected(prev => ({ ...prev, name }))}>
                      {name}
                    </span>
                    <X 
                      size={14} 
                      className="ml-1 opacity-0 group-hover:opacity-100 hover:text-destructive"
                      onClick={() => handleRemoveItem('names', name)}
                    />
                  </Badge>
                ))}
                <div className="flex gap-2 items-center">
                  <Input
                    value={newItems.names}
                    onChange={(e) => setNewItems(prev => ({ ...prev, names: e.target.value }))}
                    placeholder="Add custom name..."
                    className="w-48"
                    size="sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddCustomItem('names');
                      }
                    }}
                  />
                  <AnimatedButton
                    size="sm"
                    variant="ghost"
                    onClick={() => handleAddCustomItem('names')}
                    icon={<PlusCircle size={16} />}
                    disabled={!newItems.names.trim()}
                  >
                    Add
                  </AnimatedButton>
                </div>
              </div>
            </GlassCard>
          )}

          {suggestions.audiences && (
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Who Should We Talk To?</h3>
              <div className="flex flex-wrap gap-2">
                {suggestions.audiences.map((audience) => (
                  <Badge
                    key={audience}
                    variant={selected.audiences.includes(audience) ? 'default' : 'outline'}
                    className="group cursor-pointer"
                  >
                    <span onClick={() => toggleSelection('audiences', audience)}>
                      {audience}
                    </span>
                    <X 
                      size={14} 
                      className="ml-1 opacity-0 group-hover:opacity-100 hover:text-destructive"
                      onClick={() => handleRemoveItem('audiences', audience)}
                    />
                  </Badge>
                ))}
                <div className="flex gap-2 items-center">
                  <Input
                    value={newItems.audiences}
                    onChange={(e) => setNewItems(prev => ({ ...prev, audiences: e.target.value }))}
                    placeholder="Add custom audience..."
                    className="w-48"
                    size="sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddCustomItem('audiences');
                      }
                    }}
                  />
                  <AnimatedButton
                    size="sm"
                    variant="ghost"
                    onClick={() => handleAddCustomItem('audiences')}
                    icon={<PlusCircle size={16} />}
                    disabled={!newItems.audiences.trim()}
                  >
                    Add
                  </AnimatedButton>
                </div>
              </div>
            </GlassCard>
          )}

          {suggestions.objectives && (
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">What Do We Need to Learn?</h3>
              <div className="flex flex-wrap gap-2">
                {suggestions.objectives.map((objective) => (
                  <Badge
                    key={objective}
                    variant={selected.objectives.includes(objective) ? 'default' : 'outline'}
                    className="group cursor-pointer"
                  >
                    <span onClick={() => toggleSelection('objectives', objective)}>
                      {objective}
                    </span>
                    <X 
                      size={14} 
                      className="ml-1 opacity-0 group-hover:opacity-100 hover:text-destructive"
                      onClick={() => handleRemoveItem('objectives', objective)}
                    />
                  </Badge>
                ))}
                <div className="flex gap-2 items-center">
                  <Input
                    value={newItems.objectives}
                    onChange={(e) => setNewItems(prev => ({ ...prev, objectives: e.target.value }))}
                    placeholder="Add custom objective..."
                    className="w-48"
                    size="sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddCustomItem('objectives');
                      }
                    }}
                  />
                  <AnimatedButton
                    size="sm"
                    variant="ghost"
                    onClick={() => handleAddCustomItem('objectives')}
                    icon={<PlusCircle size={16} />}
                    disabled={!newItems.objectives.trim()}
                  >
                    Add
                  </AnimatedButton>
                </div>
              </div>
            </GlassCard>
          )}
        </div>
      )}

      {/* Action Buttons */}
      {(suggestions.names || suggestions.audiences || suggestions.objectives) && (
        <div className="flex justify-end gap-3">
          <AnimatedButton
            variant="outline"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            icon={isAnalyzing ? <LoadingSpinner size="sm" /> : <Sparkles size={16} />}
            iconPosition="left"
          >
            {isAnalyzing ? 'Getting Ideas...' : 'Get More Ideas'}
          </AnimatedButton>
          <AnimatedButton
            onClick={handleComplete}
            disabled={!selected.name || selected.audiences.length === 0}
            icon={<Check size={16} />}
            iconPosition="left"
          >
            Start Building Questions
          </AnimatedButton>
        </div>
      )}
    </div>
  );
};

export default ProjectSetup;
