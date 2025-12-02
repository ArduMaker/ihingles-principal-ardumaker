import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { getExercise } from '@/data/unidades';
import { Exercise } from '@/data/unidades';
import { InternalLayout } from '@/components/internal/InternalLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import Eje1 from './Eje1';
import Eje2 from './Eje2';
import Eje3 from './Eje3';
import { Eje4 } from './Eje4';
import { Eje5 } from './Eje5';
import { Eje6 } from './Eje6';
import { Eje7 } from './Eje7';
import { Eje12 } from './Eje12';
import { Eje18 } from './Eje18';
import { Eje31 } from './Eje31';
import { Eje8 } from './Eje8';
import { Eje10 } from './Eje10';
import { Eje11 } from './Eje11';
import { Eje13 } from './Eje13';
import { Eje14 } from './Eje14';
import { Eje15 } from './Eje15';
import { Eje16 } from './Eje16';
import { Eje17 } from './Eje17';
import { Eje21 } from './Eje21';
import { Eje22 } from './Eje22';
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
      case 1:
        return <Eje1 exercise={exercise} />;
      
      case 2:
        return <Eje2 exercise={exercise} />;
      
      case 3:
        return <Eje3 exercise={exercise} />;
      
      case 4:
        return <Eje4 exercise={exercise} />;
      
      case 5:
        return <Eje5 exercise={exercise} />;
      
      case 6:
        return <Eje6 exercise={exercise} />;
      
      case 7:
        return <Eje7 exercise={exercise} />;
      
      case 8:
        return <Eje8 exercise={exercise} />;
      
      case 10:
        return <Eje10 exercise={exercise} />;
      
      case 11:
        return <Eje11 exercise={exercise} />;
      
      case 12:
        return <Eje12 exercise={exercise} />;
      
      case 13:
        return <Eje13 exercise={exercise} />;
      
      case 14:
        return <Eje14 exercise={exercise} />;
      
      case 15:
        return <Eje15 exercise={exercise} />;
      
      case 16:
        return <Eje16 exercise={exercise} />;
      
      case 17:
        return <Eje17 exercise={exercise} />;
      
      case 18:
        return <Eje18 exercise={exercise} />;
      
      case 21:
        return <Eje21 exercise={exercise} />;
      
      case 22:
        return <Eje22 exercise={exercise} />;
      
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

  const navigate = useNavigate();

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
              onClick={() => navigate(`/modulo/${id}`)}
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
