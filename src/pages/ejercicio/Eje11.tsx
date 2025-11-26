import { useState } from 'react';
import { Exercise } from '@/data/unidades';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronLeft, HelpCircle } from 'lucide-react';
import { postUserGrade, postUserPosition } from '@/lib/api';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface Eje11Props {
  exercise: Exercise;
}

interface SentenceState {
  selectedValue: boolean | null;
  validationState: 'idle' | 'correct' | 'incorrect';
  showExplanation: boolean;
}

export const Eje11 = ({ exercise }: Eje11Props) => {
  const [sentencesState, setSentencesState] = useState<Record<number, SentenceState>>(() => {
    const initial: Record<number, SentenceState> = {};
    exercise.sentences?.forEach((item, idx) => {
      if (item.sentence) {
        initial[idx] = {
          selectedValue: null,
          validationState: 'idle',
          showExplanation: false,
        };
      }
    });
    return initial;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateSentenceState = (idx: number, updates: Partial<SentenceState>) => {
    setSentencesState(prev => ({
      ...prev,
      [idx]: { ...prev[idx], ...updates },
    }));
  };

  const handleOptionChange = (idx: number, value: boolean) => {
    const currentValue = sentencesState[idx]?.selectedValue;
    // Toggle: if clicking the same value, deselect it; otherwise select new value
    const newValue = currentValue === value ? null : value;
    
    updateSentenceState(idx, {
      selectedValue: newValue,
      validationState: 'idle',
      showExplanation: false,
    });
  };

  const handleVerify = () => {
    let allCorrect = true;
    let hasUnanswered = false;

    exercise.sentences?.forEach((item, idx) => {
      if (!item.sentence) return; // Skip description items

      const state = sentencesState[idx];
      if (state.selectedValue === null) {
        hasUnanswered = true;
        return;
      }

      const isCorrect = state.selectedValue === item.answer;
      
      updateSentenceState(idx, {
        validationState: isCorrect ? 'correct' : 'incorrect',
        showExplanation: !isCorrect && !!item.explanation,
      });

      if (!isCorrect) allCorrect = false;
    });

    if (hasUnanswered) {
      toast.error('Por favor responde todas las preguntas');
      return;
    }

    if (allCorrect) {
      toast.success('¡Todas las respuestas son correctas!');
    } else {
      toast.error('Algunas respuestas son incorrectas. Revisa los campos marcados.');
    }
  };

  const handleSaveGrade = async () => {
    // Calculate grade
    let totalQuestions = 0;
    let correctAnswers = 0;

    exercise.sentences?.forEach((item, idx) => {
      if (!item.sentence) return;
      totalQuestions++;
      if (sentencesState[idx]?.validationState === 'correct') {
        correctAnswers++;
      }
    });

    if (totalQuestions === 0) {
      toast.error('No hay preguntas para evaluar');
      return;
    }

    if (correctAnswers !== totalQuestions) {
      toast.error('Debes completar correctamente todas las preguntas antes de guardar');
      return;
    }

    try {
      setIsSubmitting(true);
      const grade = Math.round((correctAnswers / totalQuestions) * 100);

      await postUserGrade(
        exercise.number?.toString() || '0',
        grade,
        exercise.unidad?.toString() || '0'
      );

      await postUserPosition({
        unidad: exercise.unidad,
        position: exercise.number,
      });

      toast.success('Progreso guardado correctamente');
    } catch (error) {
      console.error('Error saving grade:', error);
      toast.error('Error al guardar el progreso');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getLetter = (index: number) => {
    return String.fromCharCode(97 + index); // a, b, c, d, ...
  };

  const getRowClassName = (idx: number, validationState: 'idle' | 'correct' | 'incorrect') => {
    if (validationState === 'correct') {
      return 'bg-green-50 dark:bg-green-950/20 border-l-4 border-green-500';
    }
    if (validationState === 'incorrect') {
      return 'bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500';
    }
    return idx % 2 === 0 ? 'bg-muted/30' : 'bg-muted/10';
  };

  // Count only actual questions (not description items)
  let questionCounter = 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative h-32 bg-gradient-to-r from-yellow-800/40 to-yellow-700/40 rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-end px-8">
          <h1 className="text-4xl font-bold text-white">Grammar</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <CardTitle className="text-2xl">{exercise.title}</CardTitle>
              {exercise.number && (
                <p className="text-sm text-muted-foreground">
                  Ejercicios: {exercise.number}
                </p>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Atrás
            </Button>
          </div>
          {exercise.description && (
            <p className="text-muted-foreground mt-4">{exercise.description}</p>
          )}
          {exercise.audio && (
            <div className="mt-2 text-sm text-muted-foreground">
              Audio: {exercise.audio}
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-3">
          {exercise.sentences?.map((item, idx) => {
            // If it's a description block (no sentence)
            if (!item.sentence) {
              return (
                <div
                  key={idx}
                  className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg space-y-2 border-l-4 border-blue-500"
                >
                  {item.description && (
                    <p className="text-sm font-medium">{item.description}</p>
                  )}
                  {item.description2 && (
                    <p className="text-sm text-muted-foreground">{item.description2}</p>
                  )}
                </div>
              );
            }

            // It's a question
            const state = sentencesState[idx];
            const letter = getLetter(questionCounter);
            questionCounter++;

            return (
              <div
                key={idx}
                className={`p-4 rounded-lg transition-colors ${getRowClassName(idx, state?.validationState || 'idle')}`}
              >
                <div className="flex items-start gap-3">
                  {/* Letter label */}
                  <span className="font-semibold text-lg min-w-[2rem]">
                    {letter})
                  </span>

                  {/* Sentence */}
                  <p className="flex-1 text-base">{item.sentence}</p>

                  {/* True/False options */}
                  <div className="flex items-center gap-4">
                    {/* True option */}
                    <div
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={() => handleOptionChange(idx, true)}
                    >
                      <Checkbox
                        checked={state?.selectedValue === true}
                        className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                      />
                      <span className="text-sm font-medium">True</span>
                    </div>

                    {/* False option */}
                    <div
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={() => handleOptionChange(idx, false)}
                    >
                      <Checkbox
                        checked={state?.selectedValue === false}
                        className="data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                      />
                      <span className="text-sm font-medium">False</span>
                    </div>

                    {/* Help button */}
                    {state?.showExplanation && item.explanation && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full bg-muted"
                            >
                              <HelpCircle className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-sm">
                            <p>{item.explanation}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </div>

                {/* Explanation text (shown below) */}
                {state?.showExplanation && item.explanation && (
                  <div className="mt-3 ml-9 p-3 bg-background/50 rounded-md border">
                    <p className="text-sm text-muted-foreground">
                      {item.explanation}
                    </p>
                  </div>
                )}
              </div>
            );
          })}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleVerify} variant="outline">
              Verificar
            </Button>
            <Button onClick={handleSaveGrade} disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar Progreso'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
