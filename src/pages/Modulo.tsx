import { InternalLayout } from '@/components/internal/InternalLayout';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
import EjercicioView from "@/pages/ejercicio/EjercicioView";

const Modulo = () => {
  const loc = useLocation();
  const query = new URLSearchParams(loc.search);
  const navigate = useNavigate();
  const exerciseIndex = query.get('exerciseIndex') ?? undefined;
  const { id } = useParams<{ id: string; }>();
  const [unitIndex, setUnitIndex] = useState<UnitIndex | null>(null);
  const { isLoading, executeApi } = useApiState();

  // Cargar índice de la unidad
  useEffect(() => {
    const loadUnitIndex = async () => {
      if (!id) return;
      if (exerciseIndex) return;

      const result = await executeApi(() => getUnitIndex(id));
      if (result) {
        setUnitIndex(result);
      }
    };

    loadUnitIndex();
  }, [id, exerciseIndex]);

  // Si hay un ejercicio específico cargado, mostrarlo
  if (exerciseIndex) {
    return ( <EjercicioView /> );
  }

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
            onClick={() => navigate(`/unidades`)}
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
                              onClick={() => navigate(`/modulo/${id}?exerciseIndex=${item.number}`)}
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
