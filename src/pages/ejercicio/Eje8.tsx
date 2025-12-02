import { useState, useEffect, useMemo } from 'react';
import { Exercise } from '@/data/unidades';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle2, XCircle, ChevronLeft, ChevronRight, MessageCircle, GripVertical, RotateCcw } from 'lucide-react';
import { postUserGrade, postUserPosition } from '@/lib/api';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';
import { Calculate_index_exercise } from '@/hooks/calculate_index';
import DashboardLoader from '@/components/dashboard/DashboardLoader';
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';
import { checkAnswer } from '@/lib/exerciseUtils';

interface Type8Exercise extends Exercise {
  sentence?: string;
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
  groupLength?: number;
}

interface Eje8Props {
  exercise: Type8Exercise;
}

interface DraggableItem {
  id: string;
  content: string;
}

// Función para separar la oración en grupos de palabras
const separateSentence = (sentence: string, groupLengthTemp?: number): string[] => {
  const words = sentence.split(" ");
  let groups: string[] = [];
  let currentGroup = "";

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const groupLength = groupLengthTemp
      ? groupLengthTemp + 1
      : Math.floor(Math.random() * 2) + 3;

    if (
      currentGroup.split(" ").length < groupLength - 1 ||
      i === words.length - 1
    ) {
      currentGroup += (currentGroup === "" ? "" : " ") + word;
    } else {
      groups.push(currentGroup);
      currentGroup = word;
    }
  }

  if (currentGroup !== "") {
    groups.push(currentGroup);
  }

  groups = groups.filter((x) => Boolean(x)).sort(() => Math.random() - 0.5);

  return groups;
};

// Función para reordenar elementos
const reorder = (list: DraggableItem[], startIndex: number, endIndex: number): DraggableItem[] => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

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

// Función de verificación específica para tipo 8
const checkAnswerType8 = (userAnswer: string, ...validAnswers: (string | undefined)[]): number => {
  const normalizeForComparison = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[.,!?;:'"()]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const normalizedUser = normalizeForComparison(userAnswer);
  
  for (const answer of validAnswers) {
    if (!answer) continue;
    const normalizedAnswer = normalizeForComparison(getPlainValue(answer));
    if (normalizedUser === normalizedAnswer) {
      return 1; // 100% correcto
    }
  }
  
  return 0; // Incorrecto
};

export const Eje8 = ({ exercise: initialExercise }: Eje8Props) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [exercise, setExercise] = useState<Type8Exercise>(initialExercise);
  const [loading, setLoading] = useState(false);
  
  // Crear items iniciales
  const createInitialItems = (answer?: string, groupLength?: number): DraggableItem[] => {
    if (!answer) return [];
    return separateSentence(answer, groupLength).map((fragment, i) => ({
      id: `item-${i}`,
      content: fragment,
    }));
  };

  const [items, setItems] = useState<DraggableItem[]>(() => 
    createInitialItems(initialExercise.answer, initialExercise.groupLength)
  );
  const [verified, setVerified] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [explanationModalOpen, setExplanationModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setExercise(initialExercise);
    setItems(createInitialItems(initialExercise.answer, initialExercise.groupLength));
    setVerified(false);
    setResult(null);
  }, [initialExercise]);

  const handleDragEnd = (dragResult: DropResult) => {
    if (!dragResult.destination) return;

    const orderedItems = reorder(
      items,
      dragResult.source.index,
      dragResult.destination.index
    );

    setItems(orderedItems);
  };

  const handleVerify = () => {
    const userAnswer = items.map((item) => item.content).join(" ");
    
    const grade = checkAnswerType8(
      userAnswer,
      exercise.answer,
      exercise.answer2,
      exercise.answer3,
      exercise.answer4,
      exercise.answer5,
      exercise.answer6,
      exercise.answer7,
      exercise.answer8,
      exercise.answer9,
      exercise.answer10,
      exercise.answer11,
      exercise.answer12
    );

    setResult(grade);
    setVerified(true);
    setGradeModalOpen(true);
  };

  const handleReset = () => {
    setItems(createInitialItems(exercise.answer, exercise.groupLength));
    setResult(null);
    setVerified(false);
  };

  const handleSaveGrade = async () => {
    try {
      setIsSubmitting(true);
      const grade = (result || 0) * 100;

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

  const handleNextExercise = async () => {
    try {
      setLoading(true);
      const nextIndex = await Calculate_index_exercise({
        ...exercise,
        number: exercise.number + 1
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

  const showExplanation = () => {
    setExplanationModalOpen(true);
  };

  const getItemClassName = (isDragging: boolean): string => {
    let base = "px-4 py-3 rounded-xl text-base font-semibold cursor-grab select-none transition-all flex items-center gap-2";
    
    if (result !== null) {
      if (result >= 0.99) {
        base += " bg-green-100 dark:bg-green-900/30 border-2 border-green-500 text-green-800 dark:text-green-200";
      } else {
        base += " bg-red-100 dark:bg-red-900/30 border-2 border-red-500 text-red-800 dark:text-red-200";
      }
    } else if (isDragging) {
      base += " bg-primary/10 border-2 border-primary shadow-lg";
    } else {
      base += " bg-card border-2 border-border hover:border-primary/50 shadow-md";
    }
    
    return base;
  };

  if (loading) {
    return <DashboardLoader />;
  }

  return (
    <div className="space-y-6">
      {/* Header con imagen */}
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
              <p className="text-sm text-muted-foreground">
                Ejercicio: {exercise.number}/{exercise.groupLength || 'N/A'}
              </p>
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

        <CardContent className="space-y-6">
          {/* Oración en español */}
          <div className="bg-muted/50 rounded-lg p-6 text-center">
            <p className="text-xl font-medium text-foreground">
              {exercise.sentence}
            </p>
          </div>

          {/* Área de Drag and Drop */}
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Arrastra y ordena las palabras para formar la traducción correcta
            </p>
            
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="droppable" direction="horizontal">
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`
                      min-h-[120px] p-6 rounded-xl border-2 border-dashed
                      flex flex-wrap justify-center items-center gap-3
                      transition-colors
                      ${snapshot.isDraggingOver 
                        ? 'bg-primary/10 border-primary' 
                        : 'bg-muted/30 border-border'
                      }
                    `}
                  >
                    {items.map((item, index) => (
                      <Draggable 
                        key={item.id} 
                        draggableId={item.id} 
                        index={index}
                        isDragDisabled={verified}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={getItemClassName(snapshot.isDragging)}
                          >
                            <GripVertical className="h-4 w-4 opacity-50" />
                            {item.content}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>

          {/* Mostrar respuesta correcta si se verificó y está incorrecto */}
          {verified && result !== null && result < 0.99 && (
            <div 
              className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
              onClick={showExplanation}
            >
              <div className="flex items-center gap-2 text-green-700 dark:text-green-300 mb-2">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-semibold">Respuesta correcta:</span>
                {exercise.explanation && (
                  <MessageCircle className="h-4 w-4 ml-auto" />
                )}
              </div>
              <p className="text-green-800 dark:text-green-200 font-medium">
                {getPlainValue(exercise.answer)}
              </p>
            </div>
          )}

          {/* Resultado visual */}
          {verified && (
            <div className={`flex items-center gap-2 p-3 rounded-lg ${
              result !== null && result >= 0.99 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
            }`}>
              {result !== null && result >= 0.99 ? (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">¡Correcto!</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5" />
                  <span className="font-medium">Incorrecto</span>
                </>
              )}
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleReset}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reintentar
            </Button>
            <Button
              onClick={handleVerify}
              disabled={verified}
            >
              Verificar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Calificación */}
      <Dialog open={gradeModalOpen} onOpenChange={setGradeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {result !== null && result >= 0.99 ? (
                <>
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                  ¡Excelente!
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
              result !== null && result >= 0.99 ? 'text-green-500' : 'text-red-500'
            }`}>
              {Math.round((result || 0) * 100)}%
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

      {/* Modal de Explicación */}
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
              {exercise.explanation || 'No hay explicación disponible para este ejercicio.'}
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
