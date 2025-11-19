import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { getExercise } from '@/data/unidades';
import { Exercise } from '@/data/unidades';
import { InternalLayout } from '@/components/internal/InternalLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { Eje12 } from './Eje12';
import { Eje18 } from './Eje18';
import { Eje31 } from './Eje31';
import { Eje6 } from './Eje6';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

export default function EjercicioView() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const exerciseIndex = searchParams.get('exerciseIndex');

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExercise = async () => {
      if (!exerciseIndex) {
        setError('No se especificó el índice del ejercicio');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getExercise(parseInt(exerciseIndex));
        setExercise(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar el ejercicio');
      } finally {
        setLoading(false);
      }
    };

    fetchExercise();
  }, [exerciseIndex]);

  const renderExercise = () => {
    if (!exercise) return null;

    // Router de tipos de ejercicios
    const exerciseType = typeof exercise.type === 'number' ? exercise.type : parseInt(exercise.type);

    switch (exerciseType) {
      case 6:
        return <Eje6 exercise={exercise} />;
      
      case 12:
        return <Eje12 exercise={exercise} />;
      
      case 18:
        return <Eje18 exercise={exercise} />;
      
      case 31:
        return <Eje31 exercise={exercise} />;

      // Aquí se agregarán los otros ~34 tipos de ejercicios
      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Tipo de ejercicio: {exerciseType} (No implementado aún)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Este tipo de ejercicio aún no está implementado. Mostrando datos raw:
              </p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <InternalLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {exercise && (
          <div className="space-y-6">

            <Button
              variant="ghost"
              onClick={() => window.location.href = `/modulo/${id}`}
              className="mb-4"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Volver al índice
            </Button>

            {/* JSON completo para debug */}
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-sm">Debug - JSON del ejercicio</CardTitle>
              </CardHeader>
              <CardContent>
                <details className="cursor-pointer">
                  <summary className="font-medium mb-2">Ver JSON completo</summary>
                  <pre className="bg-background p-4 rounded-lg overflow-auto text-xs border">
                    {JSON.stringify(exercise, null, 2)}
                  </pre>
                </details>
              </CardContent>
            </Card>

            {/* Ejercicio renderizado */}
            {renderExercise()}

          </div>
        )}
      </div>
    </InternalLayout>
  );
}
