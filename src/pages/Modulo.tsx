import { InternalLayout } from '@/components/internal/InternalLayout';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useApiState } from '@/hooks/useApiState';
import { get_exercise } from '@/data/ejercicios';
import { Exercise } from '@/types/ejercicio';
import { ModuloHeader } from '@/components/modulo/ModuloHeader';
import { ExerciseRouter } from '@/components/modulo/ExerciseRouter';

const Modulo = () => {
  const { id } = useParams<{ id: string }>();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const { isLoading, executeApi } = useApiState();

  useEffect(() => {
    const loadExercise = async () => {
      if (!id) return;
      
      const result = await executeApi(() => get_exercise(id));
      if (result) {
        setExercise(result);
      }
    };

    loadExercise();
  }, [id, executeApi]);

  if (isLoading) {
    return (
      <InternalLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-pulse text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando ejercicio...</p>
          </div>
        </div>
      </InternalLayout>
    );
  }

  if (!exercise) {
    return (
      <InternalLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-muted-foreground">Ejercicio no encontrado</p>
          </div>
        </div>
      </InternalLayout>
    );
  }

  return (
    <InternalLayout>
      <div className="container max-w-4xl mx-auto p-6 space-y-6">
        <ModuloHeader
          title={exercise.title}
          heroImage={exercise.heroImage}
          totalExercises={exercise.totalExercises}
          currentExercise={exercise.currentExercise}
          category={exercise.category}
          categoryProgress={exercise.categoryProgress}
          instructions={exercise.instructions}
        />
        
        <ExerciseRouter exercise={exercise} />
      </div>
    </InternalLayout>
  );
};

export default Modulo;
