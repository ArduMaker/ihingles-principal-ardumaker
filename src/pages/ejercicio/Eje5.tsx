import { useState } from 'react';
import { Exercise } from '@/data/unidades';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { postUserGrade, postUserPosition } from '@/lib/api';
import { toast } from 'sonner';
import { AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Eje5Props {
  exercise: Exercise;
}

interface SentenceData {
  sentence: string;
  answers: (string | [string, string[]])[];
  answers2?: (string | null)[];
  answers3?: (string | null)[];
  explanation?: string;
  textToConjugate?: string;
}

type Type5Exercise = Exercise & {
  sentences: SentenceData[];
};

const isType5Exercise = (exercise: Exercise): exercise is Type5Exercise => {
  return 'sentences' in exercise && Array.isArray(exercise.sentences);
};

export const Eje5 = ({ exercise: initialExercise }: Eje5Props) => {
  const [userAnswers, setUserAnswers] = useState<{ [sentenceIndex: number]: { [blankIndex: number]: string } }>({});
  const [validationState, setValidationState] = useState<{ 
    [sentenceIndex: number]: { [blankIndex: number]: 'correct' | 'incorrect' | null } 
  }>({});
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [gradeInfo, setGradeInfo] = useState<{ grade: number; total: number; percentage: number } | null>(null);

  if (!isType5Exercise(initialExercise)) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Estructura de ejercicio tipo 5 no válida</p>
      </div>
    );
  }

  const exercise = initialExercise;

  // Parse sentence to identify blanks
  const parseSentence = (sentence: string) => {
    const parts: Array<{ type: 'text' | 'blank'; content: string }> = [];
    let current = '';
    let i = 0;

    while (i < sentence.length) {
      if (sentence[i] === '_') {
        // Found blank
        if (current) {
          parts.push({ type: 'text', content: current });
          current = '';
        }
        // Count consecutive underscores
        let underscoreCount = 0;
        while (i < sentence.length && sentence[i] === '_') {
          underscoreCount++;
          i++;
        }
        parts.push({ type: 'blank', content: '_'.repeat(underscoreCount) });
      } else {
        current += sentence[i];
        i++;
      }
    }

    if (current) {
      parts.push({ type: 'text', content: current });
    }

    return parts;
  };

  const handleInputChange = (sentenceIndex: number, blankIndex: number, value: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [sentenceIndex]: {
        ...(prev[sentenceIndex] || {}),
        [blankIndex]: value
      }
    }));

    // Clear validation when user types
    setValidationState(prev => ({
      ...prev,
      [sentenceIndex]: {
        ...(prev[sentenceIndex] || {}),
        [blankIndex]: null
      }
    }));
  };

  const normalizeAnswer = (answer: string) => {
    return answer.trim().toLowerCase().replace(/\s+/g, ' ');
  };

  const checkAnswer = (
    userAnswer: string,
    correctAnswers: (string | [string, string[]])[],
    blankIndex: number,
    answers2?: (string | null)[],
    answers3?: (string | null)[]
  ): boolean => {
    const normalized = normalizeAnswer(userAnswer);

    // Get the correct answer for this blank
    const answerData = correctAnswers[blankIndex];

    // Build list of valid answers
    const validAnswers: string[] = [];

    if (typeof answerData === 'string') {
      validAnswers.push(normalizeAnswer(answerData));
    } else if (Array.isArray(answerData)) {
      // Handle [string, string[]] format with permutables
      const [base, permutables] = answerData;
      validAnswers.push(normalizeAnswer(base));
      permutables.forEach(perm => validAnswers.push(normalizeAnswer(perm)));
    }

    // Add alternative answers
    if (answers2 && answers2[blankIndex]) {
      validAnswers.push(normalizeAnswer(answers2[blankIndex] as string));
    }
    if (answers3 && answers3[blankIndex]) {
      validAnswers.push(normalizeAnswer(answers3[blankIndex] as string));
    }

    return validAnswers.includes(normalized);
  };

  const handleVerify = () => {
    let correctCount = 0;
    let totalCount = 0;
    const newValidationState: { 
      [sentenceIndex: number]: { [blankIndex: number]: 'correct' | 'incorrect' } 
    } = {};

    exercise.sentences.forEach((sentenceData, sentenceIndex) => {
      const parts = parseSentence(sentenceData.sentence);
      const blanks = parts.filter(p => p.type === 'blank');

      blanks.forEach((_, blankIndex) => {
        totalCount++;
        const userAnswer = userAnswers[sentenceIndex]?.[blankIndex] || '';
        
        const isCorrect = checkAnswer(
          userAnswer,
          sentenceData.answers,
          blankIndex,
          sentenceData.answers2,
          sentenceData.answers3
        );

        if (!newValidationState[sentenceIndex]) {
          newValidationState[sentenceIndex] = {};
        }

        newValidationState[sentenceIndex][blankIndex] = isCorrect ? 'correct' : 'incorrect';

        if (isCorrect) {
          correctCount++;
        }
      });
    });

    setValidationState(newValidationState);

    const percentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
    setGradeInfo({ grade: correctCount, total: totalCount, percentage });

    if (correctCount === totalCount) {
      toast.success('¡Perfecto! Todas las respuestas son correctas');
      setShowGradeModal(true);
    } else {
      toast.error(`${correctCount}/${totalCount} respuestas correctas`);
    }
  };

  const handleSaveGrade = async () => {
    if (!gradeInfo) return;

    try {
      await postUserGrade(
        (exercise.number || 0).toString(),
        gradeInfo.percentage,
        (exercise.unidad || 0).toString()
      );

      if (exercise.number && exercise.unidad) {
        await postUserPosition({
          unidad: exercise.unidad,
          position: exercise.number
        });
      }

      toast.success('Progreso guardado correctamente');
      setShowGradeModal(false);
    } catch (error) {
      console.error('Error saving grade:', error);
      toast.error('Error al guardar el progreso');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">{exercise.title}</h1>
        {exercise.description && (
          <p className="text-muted-foreground whitespace-pre-wrap">{exercise.description}</p>
        )}
      </div>

      {/* Sentences */}
      <div className="space-y-6">
        {exercise.sentences.map((sentenceData, sentenceIndex) => {
          const parts = parseSentence(sentenceData.sentence);
          let blankCounter = 0;

          return (
            <div key={sentenceIndex} className="border border-border rounded-lg p-6 bg-card space-y-3">
              {/* Sentence with blanks */}
              <div className="flex flex-wrap items-center gap-2 text-lg">
                <span className="font-medium text-muted-foreground mr-2">
                  {String.fromCharCode(97 + sentenceIndex)})
                </span>
                {parts.map((part, partIndex) => {
                  if (part.type === 'text') {
                    return <span key={partIndex} className="text-foreground">{part.content}</span>;
                  } else {
                    const blankIndex = blankCounter++;
                    const validationStatus = validationState[sentenceIndex]?.[blankIndex];
                    const userAnswer = userAnswers[sentenceIndex]?.[blankIndex] || '';

                    return (
                      <div key={partIndex} className="relative inline-flex items-center">
                        <Input
                          value={userAnswer}
                          onChange={(e) => handleInputChange(sentenceIndex, blankIndex, e.target.value)}
                          className={`w-32 h-10 ${
                            validationStatus === 'correct' 
                              ? 'border-green-500 bg-green-50' 
                              : validationStatus === 'incorrect'
                              ? 'border-red-500 bg-red-50'
                              : ''
                          }`}
                          placeholder="..."
                        />
                        {validationStatus === 'correct' && (
                          <CheckCircle2 className="h-4 w-4 text-green-500 absolute -right-6" />
                        )}
                        {validationStatus === 'incorrect' && (
                          <AlertCircle className="h-4 w-4 text-red-500 absolute -right-6" />
                        )}
                      </div>
                    );
                  }
                })}
              </div>

              {/* Text to conjugate */}
              {sentenceData.textToConjugate && (
                <div className="text-sm text-muted-foreground italic bg-muted px-3 py-2 rounded">
                  {sentenceData.textToConjugate}
                </div>
              )}

              {/* Explanation tooltip */}
              {sentenceData.explanation && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 text-sm text-blue-600 cursor-help">
                        <Info className="h-4 w-4" />
                        <span>Ver explicación</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-md bg-background border border-border z-50">
                      <p className="text-sm">{sentenceData.explanation}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 pt-6">
        <Button onClick={handleVerify} size="lg">
          Verificar
        </Button>
      </div>

      {/* Grade Modal */}
      <Dialog open={showGradeModal} onOpenChange={setShowGradeModal}>
        <DialogContent className="bg-background">
          <DialogHeader>
            <DialogTitle>Resultado del Ejercicio</DialogTitle>
          </DialogHeader>
          {gradeInfo && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">{gradeInfo.percentage}%</p>
                <p className="text-muted-foreground mt-2">
                  {gradeInfo.grade} de {gradeInfo.total} respuestas correctas
                </p>
              </div>
              <div className="flex justify-center gap-4">
                <Button onClick={handleSaveGrade}>Guardar Progreso</Button>
                <Button variant="outline" onClick={() => setShowGradeModal(false)}>
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
