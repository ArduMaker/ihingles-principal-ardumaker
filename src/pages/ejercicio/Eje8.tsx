import { useState } from 'react';
import { Exercise } from '@/data/unidades';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { postUserGrade, postUserPosition } from '@/lib/api';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Eje8Props {
  exercise: Exercise;
}

type Type8Exercise = Exercise & {
  sentence: string;
  answer: string;
  groupLength?: number;
  explanation?: string;
};

const isType8Exercise = (exercise: Exercise): exercise is Type8Exercise => {
  return 'sentence' in exercise && typeof exercise.sentence === 'string';
};

export const Eje8 = ({ exercise: initialExercise }: Eje8Props) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [gradeInfo, setGradeInfo] = useState<{ grade: number; total: number; percentage: number } | null>(null);

  if (!isType8Exercise(initialExercise)) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Estructura de ejercicio tipo 8 no válida</p>
      </div>
    );
  }

  const exercise = initialExercise;

  const normalizeText = (text: string) => {
    return text
      .trim()
      .toLowerCase()
      .replace(/[.,!?;:]/g, '')
      .replace(/\s+/g, ' ');
  };

  const handleVerify = () => {
    const normalized = normalizeText(userAnswer);
    const correctNormalized = normalizeText(exercise.answer);
    
    const correct = normalized === correctNormalized;
    setIsCorrect(correct);
    setIsVerified(true);

    const percentage = correct ? 100 : 0;
    setGradeInfo({ grade: correct ? 1 : 0, total: 1, percentage });

    if (correct) {
      toast.success('¡Correcto! Tu traducción es perfecta');
      setShowGradeModal(true);
    } else {
      toast.error('La traducción no es correcta. Intenta de nuevo');
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

  const handleReset = () => {
    setIsVerified(false);
    setIsCorrect(false);
    setUserAnswer('');
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">{exercise.title}</h1>
        {exercise.description && (
          <p className="text-muted-foreground whitespace-pre-wrap">{exercise.description}</p>
        )}
        {exercise.groupLength && (
          <p className="text-sm text-muted-foreground">
            Ejercicios en grupo: {exercise.groupLength}
          </p>
        )}
      </div>

      {/* Translation Exercise */}
      <div className="border border-border rounded-lg p-6 bg-card space-y-6">
        {/* Spanish Sentence */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Oración en español:</h3>
          <p className="text-lg font-medium text-foreground bg-muted p-4 rounded-md">
            {exercise.sentence}
          </p>
        </div>

        {/* Translation Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Tu traducción en inglés:
          </label>
          <Textarea
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Escribe tu traducción aquí..."
            className={`min-h-[100px] ${
              isVerified
                ? isCorrect
                  ? 'border-green-500 bg-green-50'
                  : 'border-red-500 bg-red-50'
                : ''
            }`}
            disabled={isVerified && isCorrect}
          />
        </div>

        {/* Verification Result */}
        {isVerified && (
          <div className={`flex items-start gap-3 p-4 rounded-md ${
            isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            {isCorrect ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium text-green-800">¡Correcto!</p>
                  <p className="text-sm text-green-700">Tu traducción es perfecta.</p>
                </div>
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-2 flex-1">
                  <p className="font-medium text-red-800">Incorrecto</p>
                  <div className="space-y-1">
                    <p className="text-sm text-red-700">Respuesta correcta:</p>
                    <p className="text-sm font-medium text-red-900 bg-white p-3 rounded border border-red-200">
                      {exercise.answer}
                    </p>
                  </div>
                  {exercise.explanation && (
                    <div className="space-y-1 mt-3">
                      <p className="text-sm font-medium text-red-800">Explicación:</p>
                      <p className="text-sm text-red-700 bg-white p-3 rounded border border-red-200">
                        {exercise.explanation}
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Explanation Button (if available and not verified) */}
        {!isVerified && exercise.explanation && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 text-sm text-blue-600 cursor-help">
                  <Info className="h-4 w-4" />
                  <span>Información adicional disponible</span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-md bg-background border border-border z-50">
                <p className="text-sm">{exercise.explanation}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 pt-6">
        {!isVerified ? (
          <Button onClick={handleVerify} size="lg" disabled={!userAnswer.trim()}>
            Verificar
          </Button>
        ) : (
          <>
            {!isCorrect && (
              <Button onClick={handleReset} variant="outline" size="lg">
                Intentar de nuevo
              </Button>
            )}
            {isCorrect && (
              <Button onClick={() => setShowGradeModal(true)} size="lg">
                Continuar
              </Button>
            )}
          </>
        )}
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
