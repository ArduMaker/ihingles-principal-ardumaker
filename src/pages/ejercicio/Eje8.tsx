import { useState } from 'react';
import { Exercise } from '@/data/unidades';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle2, XCircle, ChevronLeft } from 'lucide-react';
import { postUserGrade, postUserPosition } from '@/lib/api';
import { toast } from 'sonner';

interface Eje8Props {
  exercise: Exercise;
}

export const Eje8 = ({ exercise }: Eje8Props) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [validationState, setValidationState] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [showExplanation, setShowExplanation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCheck = () => {
    const normalizedUserAnswer = userAnswer.trim().toLowerCase();
    const normalizedCorrectAnswer = exercise.answer?.toLowerCase() || '';

    if (normalizedUserAnswer === normalizedCorrectAnswer) {
      setValidationState('correct');
      setShowExplanation(false);
    } else {
      setValidationState('incorrect');
      setShowExplanation(true);
    }
  };

  const handleSaveGrade = async () => {
    if (validationState !== 'correct') {
      toast.error('Debes completar correctamente el ejercicio antes de guardar');
      return;
    }

    try {
      setIsSubmitting(true);
      const grade = 100; // Si está correcto, es 100%
      
      await postUserGrade(
        exercise.number.toString(),
        grade,
        exercise.unidad.toString()
      );

      await postUserPosition({
        unidad: exercise.unidad,
        position: exercise.number
      });

      toast.success('Progreso guardado correctamente');
    } catch (error) {
      console.error('Error saving grade:', error);
      toast.error('Error al guardar el progreso');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputClassName = () => {
    const baseClasses = "w-full text-base";
    if (validationState === 'correct') {
      return `${baseClasses} border-green-500 bg-green-50 dark:bg-green-950/20`;
    }
    if (validationState === 'incorrect') {
      return `${baseClasses} border-red-500 bg-red-50 dark:bg-red-950/20`;
    }
    return baseClasses;
  };

  return (
    <div className="space-y-6">
      {/* Header con imagen */}
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
              <p className="text-sm text-muted-foreground">
                Ejercicios: {exercise.number}/{exercise.groupLength || 'N/A'}
              </p>
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
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Sentencia a traducir */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="font-semibold text-lg">a)</span>
              <p className="text-lg flex-1">{exercise.sentence}</p>
            </div>

            {/* Campo de respuesta */}
            <div className="pl-8 space-y-2">
              <Input
                placeholder="Traducción"
                value={userAnswer}
                onChange={(e) => {
                  setUserAnswer(e.target.value);
                  setValidationState('idle');
                  setShowExplanation(false);
                }}
                className={getInputClassName()}
              />

              {/* Mensaje de validación */}
              {validationState === 'correct' && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm">Correcto</span>
                </div>
              )}

              {validationState === 'incorrect' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-red-600">
                    <XCircle className="h-4 w-4" />
                    <span className="text-sm">Mensaje</span>
                  </div>
                  {showExplanation && exercise.explanation && (
                    <p className="text-sm text-muted-foreground pl-6">
                      {exercise.explanation}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleCheck}
              variant="outline"
              disabled={!userAnswer.trim()}
            >
              Verificar
            </Button>
            <Button
              onClick={handleSaveGrade}
              disabled={validationState !== 'correct' || isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Progreso'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
