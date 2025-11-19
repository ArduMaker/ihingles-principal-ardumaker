import { InternalLayout } from '@/components/internal/InternalLayout';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useApiState } from '@/hooks/useApiState';
import { getUnitIndex, getExercise, type UnitIndex, type UnitIndexItem, type Exercise as ExerciseFromAPI } from '@/data/unidades';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

  // Si hay un ejercicio específico cargado, mostrarlo
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
          
          <div className="bg-card border rounded-lg p-6 space-y-6">
            {/* Header con metadatos */}
            <div className="border-b pb-4">
              <h1 className="text-3xl font-bold mb-3">{exercise.title}</h1>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  {exercise.skill}
                </span>
                <span className="px-3 py-1 bg-secondary/10 text-secondary-foreground rounded-full text-sm">
                  Tipo: {exercise.type}
                </span>
                <span className="px-3 py-1 bg-muted rounded-full text-sm">
                  Índice: {exercise.index}
                </span>
                <span className="px-3 py-1 bg-muted rounded-full text-sm">
                  Posición: {exercise.position}
                </span>
                {exercise.completedByUser && (
                  <span className="px-3 py-1 bg-green-500/20 text-green-600 rounded-full text-sm font-medium">
                    ✓ Completado
                  </span>
                )}
              </div>
            </div>

            {/* Pregunta */}
            {exercise.question && (
              <div className="bg-accent/50 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">Pregunta:</h3>
                <p className="text-lg">{exercise.question}</p>
              </div>
            )}

            {/* Media (imágenes, audio, video) */}
            {exercise.media && (
              <div className="space-y-4">
                {exercise.media.images && exercise.media.images.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">Imágenes:</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {exercise.media.images.map((img, idx) => (
                        <div key={idx} className="border rounded-lg p-2">
                          <img src={img} alt={`Imagen ${idx + 1}`} className="w-full h-auto rounded" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {exercise.media.audio && exercise.media.audio.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">Audio:</h3>
                    <div className="space-y-2">
                      {exercise.media.audio.map((audio, idx) => (
                        <audio key={idx} controls className="w-full">
                          <source src={audio} />
                        </audio>
                      ))}
                    </div>
                  </div>
                )}

                {exercise.media.video && exercise.media.video.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">Video:</h3>
                    <div className="space-y-2">
                      {exercise.media.video.map((video, idx) => (
                        <video key={idx} controls className="w-full rounded-lg">
                          <source src={video} />
                        </video>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Opciones */}
            {exercise.options && exercise.options.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">Opciones:</h3>
                <div className="space-y-2">
                  {exercise.options.map((option) => (
                    <div key={option.id} className="border rounded-lg p-3 hover:bg-accent/50 transition-colors">
                      <span className="font-medium text-sm text-muted-foreground mr-2">{option.id}:</span>
                      <span>{option.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Metadatos adicionales */}
            {exercise.meta && (
              <div className="bg-muted/30 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">Información adicional:</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {exercise.meta.timeLimitSeconds && (
                    <div>
                      <span className="text-muted-foreground">Tiempo límite:</span>{' '}
                      <span className="font-medium">{exercise.meta.timeLimitSeconds}s</span>
                    </div>
                  )}
                  {exercise.meta.difficulty && (
                    <div>
                      <span className="text-muted-foreground">Dificultad:</span>{' '}
                      <span className="font-medium">{exercise.meta.difficulty}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* JSON completo (colapsable para debugging) */}
            <details className="bg-muted/20 rounded-lg">
              <summary className="p-4 cursor-pointer hover:bg-muted/30 rounded-lg transition-colors font-medium">
                Ver datos completos (JSON)
              </summary>
              <div className="p-4 pt-0">
                <pre className="bg-background p-4 rounded overflow-auto text-xs max-h-[400px] border">
                  {JSON.stringify(exercise, null, 2)}
                </pre>
              </div>
            </details>
          </div>
        </div>
      </InternalLayout>
    );
  }

  // Mostrar índice de la unidad
  if (unitIndex) {
    const completedCount = unitIndex.items.filter(item => item.completedByUser).length;
    const progressPercent = unitIndex.items.length > 0 
      ? Math.round((completedCount / unitIndex.items.length) * 100) 
      : 0;

    // Agrupar items por skill
    const groupedBySkill = unitIndex.items.reduce((acc, item) => {
      if (!acc[item.skill]) {
        acc[item.skill] = [];
      }
      acc[item.skill].push(item);
      return acc;
    }, {} as Record<string, UnitIndexItem[]>);

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
            <h1 className="text-3xl font-bold mb-2">Unidad {id}</h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-2">
                  <span>Progreso</span>
                  <span>{completedCount}/{unitIndex.items.length} ejercicios</span>
                </div>
                <Progress value={progressPercent} className="h-2" />
              </div>
            </div>

            <Accordion type="multiple" defaultValue={Object.keys(groupedBySkill)} className="w-full">
              {Object.entries(groupedBySkill).map(([skill, items]) => {
                const completedInSkill = items.filter(item => item.completedByUser).length;
                
                return (
                  <AccordionItem key={skill} value={skill}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3 w-full">
                        <span className="px-3 py-1 bg-primary/10 text-primary rounded text-sm font-semibold">
                          {skill}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {completedInSkill}/{items.length} completados
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pt-3">
                        {items.map((item) => {
                          const isCompleted = item.completedByUser;
                          
                          return (
                            <div
                              key={item._id}
                              className="border rounded-lg p-4 flex items-center justify-between transition-all hover:bg-accent cursor-pointer"
                              onClick={() => navigate(`/modulo/${id}/ejercicio/${item.number}`)}
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-semibold text-muted-foreground">
                                    #{item.indicePosition + 1}
                                  </span>
                                  <h3 className="font-semibold">{item.title}</h3>
                                </div>
                              </div>
                              
                              <div>
                                {isCompleted && (
                                  <span className="px-3 py-1 rounded text-xs font-medium bg-green-500/20 text-green-600">
                                    ✓ Completado
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
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
