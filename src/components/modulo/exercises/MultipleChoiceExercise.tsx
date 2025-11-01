import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MultipleChoiceExercise, ExerciseAnswer } from '@/types/ejercicio';
import { ChevronRight, AlertCircle, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MultipleChoiceExerciseProps {
  exercise: MultipleChoiceExercise;
}

export const MultipleChoiceExerciseComponent = ({ exercise }: MultipleChoiceExerciseProps) => {
  const [answers, setAnswers] = useState<Record<string, ExerciseAnswer>>({});
  const [showFeedback, setShowFeedback] = useState<Record<string, boolean>>({});

  const handleSelectOption = (optionId: string) => {
    const option = exercise.options.find(opt => opt.id === optionId);
    if (!option) return;

    // Check if already answered
    if (answers[optionId]) return;

    // Set answer
    const isCorrect = option.isCorrect;
    setAnswers(prev => ({
      ...prev,
      [optionId]: {
        optionId,
        isCorrect,
        feedback: isCorrect ? 'Correcto' : 'Incorrecto, intenta de nuevo'
      }
    }));

    // Show feedback for incorrect answers
    if (!isCorrect) {
      setShowFeedback(prev => ({ ...prev, [optionId]: true }));
    }
  };

  const getOptionStyle = (optionId: string) => {
    const answer = answers[optionId];
    if (!answer) return 'bg-card border border-border';
    
    return answer.isCorrect 
      ? 'bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800' 
      : 'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800';
  };

  return (
    <div className="space-y-3">
      {exercise.options.map((option) => {
        const answer = answers[option.id];
        const isAnswered = !!answer;
        const isCorrect = answer?.isCorrect;
        const showMessage = showFeedback[option.id];

        return (
          <div 
            key={option.id}
            className={cn(
              'rounded-lg p-4 transition-colors',
              getOptionStyle(option.id)
            )}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <span className="text-foreground font-medium">
                  {option.label} {option.text}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {isAnswered && !isCorrect && (
                  <AlertCircle className="h-5 w-5 text-destructive" />
                )}
                
                <Button
                  variant={isAnswered && !isCorrect ? 'destructive' : 'outline'}
                  size="sm"
                  onClick={() => handleSelectOption(option.id)}
                  disabled={isAnswered}
                  className={cn(
                    'min-w-[120px]',
                    isAnswered && isCorrect && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  Seleccionar
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {isAnswered && !isCorrect && showMessage && (
              <div className="mt-3 pt-3 border-t border-red-200 dark:border-red-800">
                <button 
                  className="flex items-center gap-2 text-sm text-destructive hover:text-destructive/80"
                  onClick={() => setShowFeedback(prev => ({ ...prev, [option.id]: false }))}
                >
                  <MessageCircle className="h-4 w-4" />
                  Mensaje
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
