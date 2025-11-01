import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MultipleChoiceExercise, ExerciseAnswer } from '@/types/ejercicio';
import { ChevronRight, AlertCircle, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface MultipleChoiceExerciseProps {
  exercise: MultipleChoiceExercise;
}

export const MultipleChoiceExerciseComponent = ({ exercise }: MultipleChoiceExerciseProps) => {
  const [answers, setAnswers] = useState<Record<string, ExerciseAnswer>>({});
  const [showFeedback, setShowFeedback] = useState<Record<string, boolean>>({});
  const [isVerified, setIsVerified] = useState(false);

  const handleSelectOption = (optionId: string) => {
    if (isVerified) return;
    
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

  const handleVerify = () => {
    const answeredCount = Object.keys(answers).length;
    
    if (answeredCount === 0) {
      toast.error('Por favor selecciona al menos una opción');
      return;
    }

    setIsVerified(true);
    
    const correctCount = Object.values(answers).filter(a => a.isCorrect).length;
    toast.success(`Verificado: ${correctCount}/${answeredCount} respuestas correctas`);
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
                  disabled={isAnswered || isVerified}
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

      {/* Verify Button */}
      {!isVerified && (
        <div className="flex justify-center pt-6">
          <Button 
            onClick={handleVerify}
            className="bg-[#2C5F3C] hover:bg-[#234A2F] text-white px-8 py-6 text-lg font-semibold"
            size="lg"
          >
            Verificar ✓
          </Button>
        </div>
      )}
    </div>
  );
};
