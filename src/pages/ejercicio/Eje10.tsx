import { useState, useEffect } from 'react';
import { Exercise } from '@/data/unidades';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle2, XCircle, ChevronLeft, ChevronRight, MessageCircle, RotateCcw } from 'lucide-react';
import { postUserGrade, postUserPosition } from '@/lib/api';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';
import { Calculate_index_exercise } from '@/hooks/calculate_index';
import DashboardLoader from '@/components/dashboard/DashboardLoader';

const abcd = "abcdefghijklmnopqrstuvwxyz";

interface FieldData {
  shown?: boolean;
  answer?: string;
  answer2?: string;
  answer3?: string;
  answer4?: string;
  answer5?: string;
  answer6?: string;
  answer7?: string;
  answer8?: string;
  answer9?: string;
  answer10?: string;
  answer11?: string;
  answer12?: string;
  explanation?: string;
  options?: string[];
}

interface RowData {
  fields?: FieldData[];
}

type Type10Exercise = Exercise & {
  heads?: string[];
  rows?: RowData[];
  includeNumeration?: boolean;
};

interface Eje10Props {
  exercise: Type10Exercise;
}

// Helper para obtener valor plano
const getPlainValue = (value: any): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') {
    if (value.value !== undefined) return String(value.value);
    if (value.text !== undefined) return String(value.text);
    return JSON.stringify(value);
  }
  return String(value);
};

// Función de verificación con soporte para múltiples respuestas
const checkAnswerType10 = (
  userAnswer: string,
  answer?: string,
  answer2?: string,
  answer3?: string,
  answer4?: string,
  answer5?: string,
  answer6?: string,
  answer7?: string,
  answer8?: string,
  answer9?: string,
  answer10?: string,
  answer11?: string,
  answer12?: string
): boolean => {
  const normalizeForComparison = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  };

  const normalizedUser = normalizeForComparison(userAnswer);
  if (!normalizedUser) return false;

  const validAnswers = [
    answer, answer2, answer3, answer4, answer5, answer6,
    answer7, answer8, answer9, answer10, answer11, answer12
  ].filter(Boolean);

  for (const ans of validAnswers) {
    if (normalizeForComparison(getPlainValue(ans)) === normalizedUser) {
      return true;
    }
  }

  return false;
};

export const Eje10 = ({ exercise: initialExercise }: Eje10Props) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [exercise, setExercise] = useState<Type10Exercise>(initialExercise);
  const [loading, setLoading] = useState(false);

  // Get rows (either from rows or rowsType10)
  const rows = exercise.rows || (exercise as any).rowsType10 || [];

  // Calculate initial states count
  const getInitialStates = (): string[] => {
    const states: string[] = [];
    rows.forEach((row) => {
      row.fields?.forEach(() => states.push(""));
    });
    return states;
  };

  const [verified, setVerified] = useState(false);
  const [responses, setResponses] = useState<(boolean | string)[]>(() => getInitialStates());
  const [userResponses, setUserResponses] = useState<string[]>(() => getInitialStates());
  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [grade, setGrade] = useState(0);
  const [explanationModalOpen, setExplanationModalOpen] = useState(false);
  const [currentExplanation, setCurrentExplanation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setExercise(initialExercise);
    const newRows = initialExercise.rows || (initialExercise as any).rowsType10 || [];
    const states: string[] = [];
    newRows.forEach((row: RowData) => {
      row.fields?.forEach(() => states.push(""));
    });
    setUserResponses(states);
    setResponses(states);
    setVerified(false);
    setGrade(0);
  }, [initialExercise]);

  // Get flat index from row and field indices
  const getIndex = (iRow: number, iField: number): number => {
    const sizes: number[] = [];
    rows.slice(0, iRow).forEach((row) => sizes.push(row.fields?.length || 0));
    return sizes.reduce((a, b) => a + b, 0) + iField;
  };

  // Check if a field is shown (static)
  const isShown = (generalIndex: number): boolean => {
    let current = 0;
    for (const row of rows) {
      for (const field of (row.fields || [])) {
        if (current === generalIndex) return field.shown || false;
        else current++;
      }
    }
    return false;
  };

  // Should show correct answers
  const shouldShowAnswer = (): boolean => {
    return verified && responses.some((x) => x === false);
  };

  const handleChange = (index: number, value: string) => {
    setUserResponses((old) => {
      const data = [...old];
      data[index] = value;
      return data;
    });
  };

  const handleReset = () => {
    setUserResponses(getInitialStates());
    setVerified(false);
    setResponses(getInitialStates());
  };

  const handleVerify = () => {
    // Get all fields flattened
    const fields: FieldData[] = [];
    rows.forEach((row) => {
      row.fields?.forEach((field) => fields.push(field));
    });

    // Check each answer
    const responsesCheck: boolean[] = fields.map((field, index) => {
      return checkAnswerType10(
        userResponses[index],
        field.answer,
        field.answer2,
        field.answer3,
        field.answer4,
        field.answer5,
        field.answer6,
        field.answer7,
        field.answer8,
        field.answer9,
        field.answer10,
        field.answer11,
        field.answer12
      );
    });

    setResponses(responsesCheck);
    setVerified(true);

    // Calculate grade (only for non-shown fields)
    const computableResults = responsesCheck.filter((_, i) => !isShown(i));
    const total = computableResults.length;
    const successes = computableResults.filter((x) => x === true).length;
    const calculatedGrade = total > 0 ? (successes / total) * 100 : 0;
    
    setGrade(calculatedGrade);
    setGradeModalOpen(true);
  };

  const showExplanation = (text?: string) => {
    if (text) {
      setCurrentExplanation(text);
      setExplanationModalOpen(true);
    }
  };

  const handleSaveGrade = async () => {
    try {
      setIsSubmitting(true);

      await postUserGrade(
        exercise.number?.toString() || '0',
        Math.round(grade),
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

  const handleNextExercise = async () => {
    try {
      setLoading(true);
      const nextIndex = await Calculate_index_exercise({
        ...exercise,
        number: (exercise.number || 0) + 1
      });
      setGradeModalOpen(false);
      navigate(`/modulo/${id}/ejercicio?exerciseIndex=${nextIndex}`);
    } catch (error) {
      console.error('Error navigating to next exercise:', error);
      toast.error('Error al cargar el siguiente ejercicio');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    setGradeModalOpen(false);
    navigate(`/modulo/${id}`);
  };

  const getInputClassName = (index: number): string => {
    const response = responses[index];
    const baseClasses = "w-full";
    if (response === "") return baseClasses;
    if (response === true) return `${baseClasses} border-green-500 bg-green-50 dark:bg-green-900/20`;
    if (response === false) return `${baseClasses} border-red-500 bg-red-50 dark:bg-red-900/20`;
    return baseClasses;
  };

  if (loading) {
    return <DashboardLoader />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative h-32 bg-gradient-to-r from-yellow-800/40 to-yellow-700/40 rounded-lg overflow-hidden">
        <img
          src="/ejercicio/grammar.png"
          alt="Grammar"
          className="absolute right-0 top-0 h-full w-auto object-contain opacity-80"
        />
        <div className="absolute inset-0 flex items-center px-8">
          <h1 className="text-4xl font-bold text-white drop-shadow-lg">Grammar</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <CardTitle className="text-2xl">{exercise.title}</CardTitle>
              {exercise.number && (
                <p className="text-sm text-muted-foreground">
                  Ejercicio: {exercise.number}/{exercise.groupLength || 'N/A'}
                </p>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => navigate(`/modulo/${id}`)}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Atrás
            </Button>
          </div>
          {exercise.description && (
            <p className="text-muted-foreground mt-4">{exercise.description}</p>
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
                {rows.map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
                    className={rowIdx % 2 === 0 ? 'bg-muted/20' : 'bg-background'}
                  >
                    {/* Numeration column */}
                    {exercise.includeNumeration && (
                      <td className="border border-border p-3 text-center font-semibold text-primary">
                        {abcd[rowIdx]})
                      </td>
                    )}

                    {/* Field columns */}
                    {row.fields?.map((field, fieldIdx) => {
                      const index = getIndex(rowIdx, fieldIdx);
                      const response = responses[index];

                      return (
                        <td key={fieldIdx} className="border border-border p-3">
                          {field.shown ? (
                            // Static field - show numeration if first field
                            <div className="text-center font-medium">
                              {exercise.includeNumeration && fieldIdx === 0 
                                ? `${abcd[rowIdx]}) ${getPlainValue(field.answer)}`
                                : getPlainValue(field.answer)
                              }
                            </div>
                          ) : field.options ? (
                            // Select field
                            <div className="space-y-2">
                              <Select
                                value={userResponses[index] || ''}
                                onValueChange={(value) => handleChange(index, value)}
                                disabled={verified}
                              >
                                <SelectTrigger className={getInputClassName(index)}>
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

                              {/* Show correct answer when verified and incorrect */}
                              {shouldShowAnswer() && (
                                <p
                                  className={`text-xs cursor-pointer flex items-center gap-1 ${
                                    response === false ? 'text-red-600' : 'text-green-600'
                                  }`}
                                  onClick={() => showExplanation(field.explanation)}
                                >
                                  {getPlainValue(field.answer)}
                                  {field.explanation && <MessageCircle className="h-3 w-3" />}
                                </p>
                              )}
                            </div>
                          ) : (
                            // Input field
                            <div className="space-y-2">
                              <Input
                                value={userResponses[index] || ''}
                                onChange={(e) => handleChange(index, e.target.value)}
                                className={getInputClassName(index)}
                                placeholder="..."
                                disabled={verified}
                              />

                              {/* Show correct answer when verified and incorrect */}
                              {shouldShowAnswer() && (
                                <p
                                  className={`text-xs cursor-pointer flex items-center gap-1 ${
                                    response === false ? 'text-red-600' : 'text-green-600'
                                  }`}
                                  onClick={() => showExplanation(field.explanation)}
                                >
                                  {getPlainValue(field.answer)}
                                  {field.explanation && <MessageCircle className="h-3 w-3" />}
                                </p>
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
            <Button variant="outline" onClick={handleReset} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Reintentar
            </Button>
            <Button onClick={handleVerify} disabled={verified}>
              Verificar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Grade Modal */}
      <Dialog open={gradeModalOpen} onOpenChange={setGradeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {grade >= 70 ? (
                <>
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                  ¡Buen trabajo!
                </>
              ) : (
                <>
                  <XCircle className="h-6 w-6 text-red-500" />
                  Resultado
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              Tu calificación en este ejercicio es:
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-6">
            <div className={`text-6xl font-bold ${
              grade >= 70 ? 'text-green-500' : grade >= 50 ? 'text-yellow-500' : 'text-red-500'
            }`}>
              {Math.round(grade)}%
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setGradeModalOpen(false)}>
              Cerrar
            </Button>
            <Button variant="outline" onClick={handleGoBack}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Volver al Menú
            </Button>
            <Button onClick={handleNextExercise} disabled={loading}>
              Siguiente Ejercicio
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Explanation Modal */}
      <Dialog open={explanationModalOpen} onOpenChange={setExplanationModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              Explicación
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              {currentExplanation || 'No hay explicación disponible.'}
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setExplanationModalOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
