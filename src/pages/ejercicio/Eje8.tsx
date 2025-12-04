import { useState, useEffect, useMemo } from 'react';
import { Exercise } from '@/data/unidades';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, ChevronLeft, MessageCircle, GripVertical, RotateCcw } from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import DashboardLoader from '@/components/dashboard/DashboardLoader';
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';
import { useExerciseGrade } from '@/hooks/useExerciseGrade';
import { GradeModal } from '@/components/ejercicio/GradeModal';
import { ExplanationModal } from '@/components/ejercicio/ExplanationModal';

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
  const [searchParams] = useSearchParams();
  const [exercise, setExercise] = useState<Type8Exercise>(initialExercise);
  const [loading, setLoading] = useState(false);
  
  const currentExerciseIndex = parseInt(searchParams.get('exerciseIndex') || '0');
  
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
  const [explanationModalOpen, setExplanationModalOpen] = useState(false);

  // Hook modular de calificación
  const {
    grade,
    gradeModalOpen,
    saving,
    openGradeModal,
    setGradeModalOpen,
    handleClose,
    handleGoBack,
    handleNextExercise,
  } = useExerciseGrade({
    exerciseId: exercise._id || exercise.number?.toString() || '0',
    unidad: exercise.unidad || Number(id) || 1,
    exerciseNumber: exercise.number || currentExerciseIndex,
  });

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
    
    const calculatedGrade = checkAnswerType8(
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

    setResult(calculatedGrade);
    setVerified(true);
    openGradeModal(calculatedGrade); // Ya es 0-1
  };

  const handleReset = () => {
    setItems(createInitialItems(exercise.answer, exercise.groupLength));
    setResult(null);
    setVerified(false);
  };

  const showExplanation = () => {
    setExplanationModalOpen(true);
  };

  const getItemClassName = (isDragging: boolean): string => {
    let base = "px-3 py-2 sm:px-4 sm:py-3 rounded-xl text-sm sm:text-base font-semibold cursor-grab select-none transition-all flex items-center gap-1 sm:gap-2";
    
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
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Header con imagen */}
      <div className="relative h-24 sm:h-32 bg-gradient-to-r from-yellow-800/40 to-yellow-700/40 rounded-lg overflow-hidden">
        <img
          src="/ejercicio/grammar.png"
          alt="Grammar"
          className="absolute right-0 top-0 h-full w-auto object-contain opacity-80"
        />
        <div className="absolute inset-0 flex items-center px-4 sm:px-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-white drop-shadow-lg">Grammar</h1>
        </div>
      </div>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
            <div className="space-y-2 flex-1">
              <CardTitle className="text-xl sm:text-2xl">{exercise.title}</CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Ejercicio: {exercise.number}/{exercise.groupLength || 'N/A'}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate(`/modulo/${id}`)}
              className="gap-2 w-full sm:w-auto"
              size="sm"
            >
              <ChevronLeft className="h-4 w-4" />
              Atrás
            </Button>
          </div>
          {exercise.description && (
            <p className="text-muted-foreground mt-4 text-sm sm:text-base">{exercise.description}</p>
          )}
        </CardHeader>

        <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6 pt-0">
          {/* Oración en español */}
          <div className="bg-muted/50 rounded-lg p-4 sm:p-6 text-center">
            <p className="text-lg sm:text-xl font-medium text-foreground">
              {exercise.sentence}
            </p>
          </div>

          {/* Área de Drag and Drop */}
          <div className="space-y-3 sm:space-y-4">
            <p className="text-xs sm:text-sm text-muted-foreground text-center">
              Arrastra y ordena las palabras para formar la traducción correcta
            </p>
            
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="droppable" direction="horizontal">
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`
                      min-h-[100px] sm:min-h-[120px] p-4 sm:p-6 rounded-xl border-2 border-dashed
                      flex flex-wrap justify-center items-center gap-2 sm:gap-3
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
                            <GripVertical className="h-3 w-3 sm:h-4 sm:w-4 opacity-50" />
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
              className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 sm:p-4 cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
              onClick={showExplanation}
            >
              <div className="flex items-center gap-2 text-green-700 dark:text-green-300 mb-2">
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="font-semibold text-sm sm:text-base">Respuesta correcta:</span>
                {exercise.explanation && (
                  <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 ml-auto" />
                )}
              </div>
              <p className="text-green-800 dark:text-green-200 font-medium text-sm sm:text-base">
                {getPlainValue(exercise.answer)}
              </p>
            </div>
          )}

          {/* Resultado visual */}
          {verified && (
            <div className={`flex items-center gap-2 p-3 rounded-lg text-sm sm:text-base ${
              result !== null && result >= 0.99 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
            }`}>
              {result !== null && result >= 0.99 ? (
                <>
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="font-medium">¡Correcto!</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="font-medium">Incorrecto</span>
                </>
              )}
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleReset}
              className="gap-2 w-full sm:w-auto"
            >
              <RotateCcw className="h-4 w-4" />
              Reintentar
            </Button>
            <Button
              onClick={handleVerify}
              disabled={verified}
              className="w-full sm:w-auto"
            >
              Verificar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Calificación */}
      <GradeModal
        open={gradeModalOpen}
        onOpenChange={setGradeModalOpen}
        grade={grade}
        saving={saving}
        onClose={handleClose}
        onGoBack={handleGoBack}
        onNextExercise={handleNextExercise}
      />

      {/* Modal de Explicación */}
      <ExplanationModal
        open={explanationModalOpen}
        onOpenChange={setExplanationModalOpen}
        explanation={exercise.explanation}
      />
    </div>
  );
};
