import { useState } from 'react';
import { Exercise } from '@/data/unidades';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { postUserGrade, postUserPosition } from '@/lib/api';
import { toast } from 'sonner';
import { AlertCircle, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Eje4Props {
  exercise: Exercise;
}

interface FieldItem {
  answer: string;
  shown?: boolean;
  color?: string;
  options?: string[];
  tachado?: boolean;
  answer2?: string;
  answer3?: string;
  explanation?: string;
}

type Type4Exercise = Exercise & {
  left: FieldItem[];
  right: FieldItem[][];
  Description?: string;
  Description2?: string;
};

const isType4Exercise = (exercise: Exercise): exercise is Type4Exercise => {
  return 'left' in exercise && 'right' in exercise;
};

export const Eje4 = ({ exercise: initialExercise }: Eje4Props) => {
  const [userAnswers, setUserAnswers] = useState<{
    left: { [index: number]: string };
    right: { [rowIndex: number]: { [colIndex: number]: string } };
  }>({ left: {}, right: {} });

  const [validationErrors, setValidationErrors] = useState<{
    left: { [index: number]: boolean };
    right: { [rowIndex: number]: { [colIndex: number]: boolean } };
  }>({ left: {}, right: {} });

  const [showGradeModal, setShowGradeModal] = useState(false);
  const [gradeInfo, setGradeInfo] = useState<{ grade: number; total: number; percentage: number } | null>(null);

  if (!isType4Exercise(initialExercise)) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Estructura de ejercicio tipo 4 no válida</p>
      </div>
    );
  }

  const exercise = initialExercise;

  const handleLeftChange = (index: number, value: string) => {
    setUserAnswers(prev => ({
      ...prev,
      left: { ...prev.left, [index]: value }
    }));

    setValidationErrors(prev => ({
      ...prev,
      left: { ...prev.left, [index]: false }
    }));
  };

  const handleRightChange = (rowIndex: number, colIndex: number, value: string) => {
    setUserAnswers(prev => ({
      ...prev,
      right: {
        ...prev.right,
        [rowIndex]: {
          ...(prev.right[rowIndex] || {}),
          [colIndex]: value
        }
      }
    }));

    setValidationErrors(prev => ({
      ...prev,
      right: {
        ...prev.right,
        [rowIndex]: {
          ...(prev.right[rowIndex] || {}),
          [colIndex]: false
        }
      }
    }));
  };

  const handleVerify = () => {
    let correctCount = 0;
    let totalCount = 0;
    const errors: {
      left: { [index: number]: boolean };
      right: { [rowIndex: number]: { [colIndex: number]: boolean } };
    } = { left: {}, right: {} };

    // Validate left column
    exercise.left.forEach((field, index) => {
      if (!field.shown && field.options) {
        totalCount++;
        const userAnswer = userAnswers.left[index]?.trim().toLowerCase() || '';
        const correctAnswers = [
          field.answer.trim().toLowerCase(),
          field.answer2?.trim().toLowerCase(),
          field.answer3?.trim().toLowerCase()
        ].filter(Boolean);

        if (correctAnswers.includes(userAnswer)) {
          correctCount++;
        } else {
          errors.left[index] = true;
        }
      }
    });

    // Validate right columns
    exercise.right.forEach((row, rowIndex) => {
      row.forEach((field, colIndex) => {
        if (!field.shown && field.options) {
          totalCount++;
          const userAnswer = userAnswers.right[rowIndex]?.[colIndex]?.trim().toLowerCase() || '';
          const correctAnswers = [
            field.answer.trim().toLowerCase(),
            field.answer2?.trim().toLowerCase(),
            field.answer3?.trim().toLowerCase()
          ].filter(Boolean);

          if (correctAnswers.includes(userAnswer)) {
            correctCount++;
          } else {
            if (!errors.right[rowIndex]) errors.right[rowIndex] = {};
            errors.right[rowIndex][colIndex] = true;
          }
        }
      });
    });

    setValidationErrors(errors);

    const percentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
    setGradeInfo({ grade: correctCount, total: totalCount, percentage });

    if (Object.keys(errors.left).length === 0 && Object.keys(errors.right).length === 0) {
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
      case 'azul':
      case 'blue': return 'text-blue-600';
      case 'orange': return 'text-orange-600';
      case 'red': return 'text-red-600';
      case 'green': return 'text-green-600';
      default: return 'text-foreground';
    }
  };

  const renderField = (
    field: FieldItem,
    index: number,
    section: 'left' | 'right',
    rowIndex?: number
  ) => {
    const isRight = section === 'right' && rowIndex !== undefined;
    const hasError = isRight 
      ? validationErrors.right[rowIndex!]?.[index]
      : validationErrors.left[index];
    const userAnswer = isRight
      ? userAnswers.right[rowIndex!]?.[index]
      : userAnswers.left[index];

    return (
      <div key={index} className="flex flex-col gap-1">
        {field.shown ? (
          <div className={`px-4 py-3 rounded-md font-medium bg-green-100 text-green-800 ${
            field.tachado ? 'line-through' : ''
          }`}>
            <span className={getColorClass(field.color)}>{field.answer}</span>
          </div>
        ) : (
          <>
            <Select
              value={userAnswer || ''}
              onValueChange={(value) => {
                if (isRight && rowIndex !== undefined) {
                  handleRightChange(rowIndex, index, value);
                } else {
                  handleLeftChange(index, value);
                }
              }}
            >
              <SelectTrigger className={`w-full ${hasError ? 'border-red-500 bg-red-50' : ''}`}>
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                {field.options?.map((option, optionIndex) => (
                  <SelectItem key={optionIndex} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasError && (
              <div className="flex items-center gap-1 mt-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1 text-red-500 cursor-help text-xs">
                        <AlertCircle className="h-3 w-3" />
                        <span className="font-medium">Validar</span>
                        {field.explanation && <Info className="h-3 w-3" />}
                      </div>
                    </TooltipTrigger>
                    {field.explanation && (
                      <TooltipContent className="max-w-sm bg-background border border-border z-50">
                        <p className="text-sm">{field.explanation}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">{exercise.title}</h1>
        {exercise.Description && (
          <p className="text-muted-foreground whitespace-pre-wrap">{exercise.Description}</p>
        )}
        {exercise.Description2 && (
          <p className="text-muted-foreground text-sm whitespace-pre-wrap italic">
            {exercise.Description2}
          </p>
        )}
      </div>

      {/* Main Content: Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="border border-border rounded-lg p-6 bg-card space-y-3">
          <h2 className="text-lg font-semibold text-foreground mb-4">Columna Principal</h2>
          {exercise.left.map((field, index) => renderField(field, index, 'left'))}
        </div>

        {/* Right Column (Multiple Rows) */}
        <div className="space-y-6">
          {exercise.right.map((row, rowIndex) => (
            <div key={rowIndex} className="border border-border rounded-lg p-6 bg-card space-y-3">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Alternativa {rowIndex + 1}
              </h3>
              {row.map((field, colIndex) => renderField(field, colIndex, 'right', rowIndex))}
            </div>
          ))}
        </div>
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
