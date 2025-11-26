import { useState } from 'react';
import { Exercise } from '@/data/unidades';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, XCircle, ChevronLeft } from 'lucide-react';
import { postUserGrade, postUserPosition } from '@/lib/api';
import { toast } from 'sonner';

interface Eje10Props {
  exercise: Exercise;
}

interface FieldState {
  value: string;
  validationState: 'idle' | 'correct' | 'incorrect';
  showExplanation: boolean;
}

export const Eje10 = ({ exercise }: Eje10Props) => {
  const [fieldsState, setFieldsState] = useState<Record<string, FieldState>>(() => {
    const initial: Record<string, FieldState> = {};
    exercise.rowsType10?.forEach((row, rowIdx) => {
      row.fields?.forEach((field, fieldIdx) => {
        if (!field.shown) {
          initial[`${rowIdx}-${fieldIdx}`] = {
            value: '',
            validationState: 'idle',
            showExplanation: false,
          };
        }
      });
    });
    return initial;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateFieldState = (rowIdx: number, fieldIdx: number, updates: Partial<FieldState>) => {
    const key = `${rowIdx}-${fieldIdx}`;
    setFieldsState(prev => ({
      ...prev,
      [key]: { ...prev[key], ...updates },
    }));
  };

  const handleInputChange = (rowIdx: number, fieldIdx: number, value: string) => {
    updateFieldState(rowIdx, fieldIdx, {
      value,
      validationState: 'idle',
      showExplanation: false,
    });
  };

  const normalizeAnswer = (answer: string) => {
    return answer.trim().toLowerCase();
  };

  const checkAnswer = (rowIdx: number, fieldIdx: number, field: any) => {
    const key = `${rowIdx}-${fieldIdx}`;
    const userAnswer = normalizeAnswer(fieldsState[key]?.value || '');
    
    const correctAnswers = [
      field.answer,
      field.answer2,
      field.answer3,
    ].filter(Boolean).map(normalizeAnswer);

    const isCorrect = correctAnswers.includes(userAnswer);

    updateFieldState(rowIdx, fieldIdx, {
      validationState: isCorrect ? 'correct' : 'incorrect',
      showExplanation: !isCorrect && !!field.explanation,
    });

    return isCorrect;
  };

  const handleVerify = () => {
    let allCorrect = true;

    exercise.rowsType10?.forEach((row, rowIdx) => {
      row.fields?.forEach((field, fieldIdx) => {
        if (!field.shown) {
          const isCorrect = checkAnswer(rowIdx, fieldIdx, field);
          if (!isCorrect) allCorrect = false;
        }
      });
    });

    if (allCorrect) {
      toast.success('¡Todas las respuestas son correctas!');
    } else {
      toast.error('Algunas respuestas son incorrectas. Revisa los campos marcados.');
    }
  };

  const handleSaveGrade = async () => {
    // Calculate grade
    let totalFields = 0;
    let correctFields = 0;

    exercise.rowsType10?.forEach((row) => {
      row.fields?.forEach((field) => {
        if (!field.shown) {
          totalFields++;
        }
      });
    });

    Object.values(fieldsState).forEach((state) => {
      if (state.validationState === 'correct') {
        correctFields++;
      }
    });

    if (totalFields === 0) {
      toast.error('No hay campos para evaluar');
      return;
    }

    if (correctFields !== totalFields) {
      toast.error('Debes completar correctamente todos los campos antes de guardar');
      return;
    }

    try {
      setIsSubmitting(true);
      const grade = Math.round((correctFields / totalFields) * 100);

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

  const getInputClassName = (validationState: 'idle' | 'correct' | 'incorrect') => {
    const baseClasses = "w-full";
    if (validationState === 'correct') {
      return `${baseClasses} border-green-500 bg-green-50 dark:bg-green-950/20`;
    }
    if (validationState === 'incorrect') {
      return `${baseClasses} border-red-500 bg-red-50 dark:bg-red-950/20`;
    }
    return baseClasses;
  };

  const getLetter = (index: number) => {
    return String.fromCharCode(97 + index); // a, b, c, d, ...
  };

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
                  Ejercicio: {exercise.number}
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
            <div className="mt-4 p-4 bg-muted/50 rounded-lg flex items-start gap-3">
              <span className="text-2xl">🎯</span>
              <p className="text-muted-foreground flex-1">{exercise.description}</p>
            </div>
          )}
        </CardHeader>

        <CardContent>
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              {/* Table Header */}
              <thead>
                <tr className="bg-gradient-to-r from-purple-600 to-purple-700">
                  {exercise.includeNumeration && (
                    <th className="border border-purple-500 p-3 text-left text-white font-semibold"></th>
                  )}
                  {exercise.heads?.map((head, idx) => (
                    <th
                      key={idx}
                      className="border border-purple-500 p-3 text-center text-white font-semibold uppercase"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                {exercise.rowsType10?.map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
                    className={rowIdx % 2 === 0 ? 'bg-muted/20' : 'bg-background'}
                  >
                    {/* Numeration column */}
                    {exercise.includeNumeration && (
                      <td className="border border-border p-3 text-center font-semibold text-primary">
                        {getLetter(rowIdx)})
                      </td>
                    )}

                    {/* Field columns */}
                    {row.fields?.map((field, fieldIdx) => {
                      const key = `${rowIdx}-${fieldIdx}`;
                      const state = fieldsState[key];

                      return (
                        <td key={fieldIdx} className="border border-border p-3">
                          {field.shown ? (
                            // Static field
                            <div className="text-center font-medium">
                              {field.answer}
                            </div>
                          ) : field.options ? (
                            // Select field
                            <div className="space-y-2">
                              <Select
                                value={state?.value || ''}
                                onValueChange={(value) => handleInputChange(rowIdx, fieldIdx, value)}
                              >
                                <SelectTrigger
                                  className={getInputClassName(state?.validationState || 'idle')}
                                >
                                  <SelectValue placeholder="Seleccionar" />
                                </SelectTrigger>
                                <SelectContent className="bg-background z-50">
                                  {field.options.map((option, optIdx) => (
                                    <SelectItem key={optIdx} value={option}>
                                      {option}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>

                              {/* Validation feedback */}
                              {state?.validationState === 'correct' && (
                                <div className="flex items-center gap-1 text-green-600 text-xs">
                                  <CheckCircle2 className="h-3 w-3" />
                                  <span>Correcto</span>
                                </div>
                              )}
                              {state?.validationState === 'incorrect' && (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1 text-red-600 text-xs">
                                    <XCircle className="h-3 w-3" />
                                    <span>Incorrecto</span>
                                  </div>
                                  {state.showExplanation && field.explanation && (
                                    <p className="text-xs text-muted-foreground">
                                      {field.explanation}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          ) : (
                            // Input field
                            <div className="space-y-2">
                              <Input
                                value={state?.value || ''}
                                onChange={(e) => handleInputChange(rowIdx, fieldIdx, e.target.value)}
                                className={getInputClassName(state?.validationState || 'idle')}
                                placeholder="..."
                              />

                              {/* Validation feedback */}
                              {state?.validationState === 'correct' && (
                                <div className="flex items-center gap-1 text-green-600 text-xs">
                                  <CheckCircle2 className="h-3 w-3" />
                                  <span>Correcto</span>
                                </div>
                              )}
                              {state?.validationState === 'incorrect' && (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1 text-red-600 text-xs">
                                    <XCircle className="h-3 w-3" />
                                    <span>Incorrecto</span>
                                  </div>
                                  {state.showExplanation && field.explanation && (
                                    <p className="text-xs text-muted-foreground">
                                      {field.explanation}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
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
