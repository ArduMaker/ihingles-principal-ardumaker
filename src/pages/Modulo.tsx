import { InternalLayout } from '@/components/internal/InternalLayout';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useApiState } from '@/hooks/useApiState';
import { getUnitIndex, getExercise, type UnitIndex, type Exercise as ExerciseFromAPI } from '@/data/unidades';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, Lock } from 'lucide-react';

const Modulo = () => {
  const { id, exerciseIndex } = useParams<{ id: string; exerciseIndex?: string }>();
  const navigate = useNavigate();
  const [unitIndex, setUnitIndex] = useState<UnitIndex | null>(null);
  const [exercise, setExercise] = useState<ExerciseFromAPI | null>(null);
  const { isLoading, executeApi } = useApiState();

  // Cargar índice de la unidad
  useEffect(() => {
    const loadUnitIndex = async () => {
      if (!id || exerciseIndex) return;
      
      const result = await executeApi(() => getUnitIndex(id));
      if (result) {
        console.log('Índice de unidad cargado:', result);
        setUnitIndex(result);
      }
    };

    loadUnitIndex();
  }, [id, exerciseIndex]);

  // Cargar ejercicio específico si se proporciona exerciseIndex
  useEffect(() => {
    const loadExercise = async () => {
      if (!exerciseIndex) return;
      
      const result = await executeApi(() => getExercise(Number(exerciseIndex)));
      if (result) {
        console.log('Ejercicio cargado:', result);
        setExercise(result);
      }
    };

    loadExercise();
  }, [exerciseIndex]);

  if (isLoading) {
    return (
      <InternalLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-pulse text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando...</p>
          </div>
        </div>
      </InternalLayout>
    );
  }

  // Si hay un ejercicio específico cargado, mostrarlo con ExerciseRouter
  if (exercise) {
    return (
      <InternalLayout>
        <div className="container max-w-4xl mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
          <Button
            variant="ghost"
            onClick={() => navigate(`/modulo/${id}`)}
            className="mb-4"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Volver al índice
          </Button>
          
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Ejercicio #{exercise.position + 1}</h2>
            <div className="mb-4">
              <span className="text-sm text-muted-foreground">Tipo: {exercise.type}</span>
            </div>
            
            {/* Renderizar información básica del ejercicio */}
            <div className="space-y-4">
              <pre className="bg-muted p-4 rounded overflow-auto text-xs">
                {JSON.stringify(exercise, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </InternalLayout>
    );
  }

  // Mostrar índice de la unidad
  if (unitIndex) {
    const completedCount = unitIndex.items.filter(item => item.status === 'done').length;
    const progressPercent = unitIndex.items.length > 0 
      ? Math.round((completedCount / unitIndex.items.length) * 100) 
      : 0;

    return (
      <InternalLayout>
        <div className="container max-w-4xl mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>

          <div className="bg-card border rounded-lg p-6">
            <h1 className="text-3xl font-bold mb-2">{unitIndex.title}</h1>
            <p className="text-muted-foreground mb-4">Unidad {unitIndex.unidad}</p>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-2">
                  <span>Progreso</span>
                  <span>{completedCount}/{unitIndex.items.length} ejercicios</span>
                </div>
                <Progress value={progressPercent} className="h-2" />
              </div>
            </div>

            <div className="space-y-3">
              {unitIndex.items.map((item, idx) => {
                const isLocked = item.status === 'locked';
                // Calcular índice absoluto (necesitarías tener startIndex de la unidad)
                // Por ahora usamos position directamente
                
                return (
                  <div
                    key={idx}
                    className={`border rounded-lg p-4 flex items-center justify-between transition-all ${
                      isLocked 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:bg-accent cursor-pointer'
                    }`}
                    onClick={() => !isLocked && navigate(`/modulo/${id}/ejercicio/${unitIndex.startIndex + item.position}`)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-muted-foreground">
                          #{item.position + 1}
                        </span>
                        <h3 className="font-semibold">{item.title}</h3>
                        {isLocked && <Lock className="h-4 w-4 text-red-500" />}
                      </div>
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        <span className="px-2 py-0.5 bg-primary/10 rounded">{item.skill}</span>
                        <span>{item.type}</span>
                        {item.estimatedSeconds && <span>~{item.estimatedSeconds}s</span>}
                        {item.hasAudio && <span>🎧 Audio</span>}
                      </div>
                    </div>
                    
                    <div>
                      <span className={`px-3 py-1 rounded text-xs font-medium ${
                        item.status === 'done' 
                          ? 'bg-green-500/20 text-green-600' 
                          : item.status === 'available'
                          ? 'bg-blue-500/20 text-blue-600'
                          : 'bg-red-500/20 text-red-600'
                      }`}>
                        {item.status === 'done' ? 'Completado' : 
                         item.status === 'available' ? 'Disponible' : 
                         'Bloqueado'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </InternalLayout>
    );
  }

  return (
    <InternalLayout>
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-muted-foreground">No se encontró la unidad</p>
        </div>
      </div>
    </InternalLayout>
  );
};

export default Modulo;
