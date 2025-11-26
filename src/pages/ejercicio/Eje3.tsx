import { useState, useEffect } from 'react';
import { Exercise } from '@/data/unidades';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { postUserGrade, postUserPosition } from '@/lib/api';
import { toast } from 'sonner';
import { AlertCircle, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Eje3Props {
  exercise: Exercise;
}

interface Answer {
  value: string;
  shown?: boolean;
  color?: string;
  black?: string;
  parentesis?: boolean;
  asterisco?: boolean;
  answer2?: string;
  answer3?: string;
  explanation?: string;
}

interface Formula {
  name: string;
  textoAuxiliar?: string;
  options: string[];
  answers: Answer[];
}

type Type3Exercise = Exercise & {
  formulas: Formula[];
};

const isType3Exercise = (exercise: Exercise): exercise is Type3Exercise => {
  return 'formulas' in exercise && Array.isArray(exercise.formulas);
};

export const Eje3 = ({ exercise: initialExercise }: Eje3Props) => {
  const [exercise] = useState<Exercise>(initialExercise);
  const [userAnswers, setUserAnswers] = useState<{ [formulaIndex: number]: { [answerIndex: number]: string } }>({});
  const [validationErrors, setValidationErrors] = useState<{ [formulaIndex: number]: { [answerIndex: number]: boolean } }>({});
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [gradeInfo, setGradeInfo] = useState<{ grade: number; total: number; percentage: number } | null>(null);

  if (!isType3Exercise(exercise)) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Estructura de ejercicio tipo 3 no válida</p>
      </div>
    );
  }

  const handleSelectChange = (formulaIndex: number, answerIndex: number, value: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [formulaIndex]: {
        ...(prev[formulaIndex] || {}),
        [answerIndex]: value
      }
    }));

    // Clear error when user changes answer
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      if (newErrors[formulaIndex]) {
        delete newErrors[formulaIndex][answerIndex];
      }
      return newErrors;
    });
  };

  const handleVerify = () => {
    if (!exercise.formulas) return;

    let correctCount = 0;
    let totalCount = 0;
    const errors: { [formulaIndex: number]: { [answerIndex: number]: boolean } } = {};

    exercise.formulas.forEach((formula, formulaIndex) => {
      formula.answers.forEach((answer, answerIndex) => {
        if (!answer.shown) {
          totalCount++;
          const userAnswer = userAnswers[formulaIndex]?.[answerIndex]?.trim().toLowerCase() || '';
          const correctAnswers = [
            answer.value.trim().toLowerCase(),
            answer.answer2?.trim().toLowerCase(),
            answer.answer3?.trim().toLowerCase()
          ].filter(Boolean);

          if (correctAnswers.includes(userAnswer)) {
            correctCount++;
          } else {
            if (!errors[formulaIndex]) errors[formulaIndex] = {};
            errors[formulaIndex][answerIndex] = true;
          }
        }
      });
    });

    setValidationErrors(errors);

    const percentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
    setGradeInfo({ grade: correctCount, total: totalCount, percentage });

    if (Object.keys(errors).length === 0) {
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

  const getColorClass = (color?: string) => {
    switch (color?.toLowerCase()) {
      case 'blue': return 'text-blue-600';
      case 'orange': return 'text-orange-600';
      case 'red': return 'text-red-600';
      case 'green': return 'text-green-600';
      default: return 'text-foreground';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">{exercise.title}</h1>
        {exercise.description && (
          <p className="text-muted-foreground whitespace-pre-wrap">{exercise.description}</p>
        )}
      </div>

      {/* Formulas */}
      <div className="space-y-8">
        {exercise.formulas.map((formula, formulaIndex) => (
          <div key={formulaIndex} className="border border-border rounded-lg p-6 bg-card space-y-4">
            {/* Formula Name */}
            <h2 className="text-xl font-semibold text-foreground">{formula.name}</h2>

            {/* Texto Auxiliar */}
            {formula.textoAuxiliar && (
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                {formula.textoAuxiliar}
              </p>
            )}

            {/* Answers Grid */}
            <div className="space-y-3">
              {formula.answers.map((answer, answerIndex) => {
                const hasError = validationErrors[formulaIndex]?.[answerIndex];
                const userAnswer = userAnswers[formulaIndex]?.[answerIndex];

                return (
                  <div key={answerIndex} className="flex items-center gap-4">
                    {/* Label */}
                    <div className={`min-w-[140px] px-4 py-2 rounded-md font-medium ${
                      answer.shown ? 'bg-green-100 text-green-800' : 'bg-green-50 text-green-700'
                    }`}>
                      {answer.parentesis && '('}
                      <span className={getColorClass(answer.color)}>
                        {answer.value}
                        {answer.black && <span className="text-foreground">{answer.black}</span>}
                      </span>
                      {answer.parentesis && ')'}
                      {answer.asterisco && <span className="text-red-500">*</span>}
                    </div>

                    {/* Input/Select or Shown Value */}
                    <div className="flex-1 flex items-center gap-2">
                      {answer.shown ? (
                        <div className="px-4 py-2 bg-muted rounded-md text-muted-foreground">
                          {answer.value}
                        </div>
                      ) : (
                        <>
                          <Select
                            value={userAnswer || ''}
                            onValueChange={(value) => handleSelectChange(formulaIndex, answerIndex, value)}
                          >
                            <SelectTrigger className={`w-full ${hasError ? 'border-red-500' : ''}`}>
                              <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                            <SelectContent className="bg-background z-50">
                              {formula.options.map((option, optionIndex) => (
                                <SelectItem key={optionIndex} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {hasError && (
                            <div className="flex items-center gap-1">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center gap-1 text-red-500 cursor-help">
                                      <AlertCircle className="h-4 w-4" />
                                      <span className="text-xs font-medium">Validar</span>
                                      {answer.explanation && <Info className="h-3 w-3" />}
                                    </div>
                                  </TooltipTrigger>
                                  {answer.explanation && (
                                    <TooltipContent className="max-w-sm bg-background border border-border z-50">
                                      <p className="text-sm">{answer.explanation}</p>
                                    </TooltipContent>
                                  )}
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
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
