import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle, CheckCircle2, XCircle, Volume2, GripVertical, ChevronLeft, RotateCcw } from 'lucide-react';
import DashboardLoader from '@/components/dashboard/DashboardLoader';
import { useExerciseGrade } from '@/hooks/useExerciseGrade';
import { GradeModal } from '@/components/ejercicio/GradeModal';
import { ExplanationModal } from '@/components/ejercicio/ExplanationModal';

interface SentenceData {
  sentence: string;
  answer: string;
  answer2?: string;
  answer3?: string;
  explanation?: string;
  shown?: boolean;
}

interface Type14Exercise {
  _id: string;
  type: number;
  number?: number;
  unidad?: number;
  title?: string;
  description?: string;
  audio?: string;
  calificationSobre?: number;
  sentences: SentenceData[];
}

interface Eje14Props {
  exercise: Type14Exercise | any;
}

interface DraggableItem {
  id: string;
  index: number;
  content: string;
  droppableId: number | null;
}

// Normalize text for comparison
const normalizeForComparison = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
};

// Check answer for type 14
const checkAnswerType14 = (userAnswer: string | null, correctAnswer: string): boolean => {
  if (!userAnswer) return false;
  return normalizeForComparison(userAnswer) === normalizeForComparison(correctAnswer);
};

// Shuffle array
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
};

export function Eje14({ exercise: initialExercise }: Eje14Props) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [exercise, setExercise] = useState<Type14Exercise | null>(null);
  const [loading, setLoading] = useState(true);

  const currentExerciseIndex = parseInt(searchParams.get('exerciseIndex') || '0');

  // Drag and drop state
  const [items, setItems] = useState<DraggableItem[]>([]);
  const [verified, setVerified] = useState(false);
  const [responses, setResponses] = useState<(boolean | '')[]>([]);

  // Modal states
  const [explanationModalOpen, setExplanationModalOpen] = useState(false);
  const [currentExplanation, setCurrentExplanation] = useState('');

  // Audio state
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

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
    exerciseId: initialExercise?._id || initialExercise?.number?.toString() || '0',
    unidad: initialExercise?.unidad || Number(id) || 1,
    exerciseNumber: initialExercise?.number || currentExerciseIndex,
  });

  // Shuffled items for display in source area
  const shuffledSourceItems = useMemo(() => {
    return shuffleArray(items.filter(item => item.droppableId === null));
  }, [items]);

  // Initialize exercise data
  useEffect(() => {
    if (initialExercise) {
      setExercise(initialExercise);

      // Initialize draggable items
      const initItems: DraggableItem[] = initialExercise.sentences?.map((sentence: SentenceData, i: number) => ({
        id: `item-${i}`,
        index: i,
        content: sentence.answer,
        droppableId: null,
      })) || [];

      setItems(initItems);
      setResponses(initItems.map(() => ''));

      // Setup audio if available
      if (initialExercise.audio) {
        const audio = new Audio(`/audios/${initialExercise.audio}.mp3`);
        audio.addEventListener('ended', () => setIsPlaying(false));
        setAudioElement(audio);
      }

      setLoading(false);
    }

    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.removeEventListener('ended', () => setIsPlaying(false));
      }
    };
  }, [initialExercise]);

  if (loading || !exercise) {
    return <DashboardLoader />;
  }

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const movedItemIndex = Number(result.draggableId.substring(5));
    const itemsCopy = [...items];

    // If dropping back to source
    if (result.destination.droppableId === 'droppable-items') {
      itemsCopy[movedItemIndex] = { ...itemsCopy[movedItemIndex], droppableId: null };
      setItems(itemsCopy);
      return;
    }

    // If dropping to a sentence slot
    const droppableId = Number(result.destination.droppableId.substring(10));
    const itemInTargetPosition = itemsCopy.findIndex(x => x.droppableId === droppableId);
    
    itemsCopy[movedItemIndex] = { ...itemsCopy[movedItemIndex], droppableId };
    
    // If there's already an item in target, move it back to source
    if (itemInTargetPosition !== -1) {
      itemsCopy[itemInTargetPosition] = {
        ...itemsCopy[itemInTargetPosition],
        droppableId: null,
      };
    }
    
    setItems(itemsCopy);
  };

  const handleVerify = () => {
    const userResponses: (string | null)[] = exercise.sentences.map(() => null);

    items.forEach((item) => {
      if (item.droppableId !== null) {
        userResponses[item.droppableId] = item.content;
      }
    });

    const resultResponses: boolean[] = [];
    exercise.sentences.forEach((sentence, i) => {
      resultResponses.push(checkAnswerType14(userResponses[i], sentence.answer));
    });

    setResponses(resultResponses);
    setVerified(true);

    // Calculate grade
    const total = exercise.calificationSobre ?? resultResponses.length;
    const successes = resultResponses.filter(x => x).length;

    let calculatedGrade = total > 0 ? successes / total : 0;
    if (calculatedGrade > 1) calculatedGrade = 1;

    openGradeModal(calculatedGrade);
  };

  const handleReset = () => {
    const initItems: DraggableItem[] = exercise.sentences.map((sentence: SentenceData, i: number) => ({
      id: `item-${i}`,
      index: i,
      content: sentence.answer,
      droppableId: null,
    }));

    setItems(initItems);
    setResponses(initItems.map(() => ''));
    setVerified(false);
  };

  const showExplanation = (explanation: string | undefined) => {
    if (explanation) {
      setCurrentExplanation(explanation);
      setExplanationModalOpen(true);
    }
  };

  const toggleAudio = () => {
    if (!audioElement) return;

    if (isPlaying) {
      audioElement.pause();
      setIsPlaying(false);
    } else {
      audioElement.play();
      setIsPlaying(true);
    }
  };

  const getDropZoneClassName = (index: number, isDraggingOver: boolean): string => {
    const baseClass = 'min-h-[40px] sm:min-h-[50px] min-w-[100px] sm:min-w-[120px] rounded-lg flex items-center justify-center p-2 transition-colors';
    
    if (isDraggingOver) {
      return `${baseClass} bg-primary/20 border-2 border-dashed border-primary`;
    }
    
    if (!verified) {
      return `${baseClass} bg-muted/50 border-2 border-dashed border-border`;
    }
    
    if (responses[index] === '') {
      return `${baseClass} bg-muted/50 border-2 border-dashed border-border`;
    }
    
    return responses[index] 
      ? `${baseClass} bg-green-100 dark:bg-green-900/30 border-2 border-green-500`
      : `${baseClass} bg-red-100 dark:bg-red-900/30 border-2 border-red-500`;
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Header Image */}
      <div className="relative w-full h-32 sm:h-48 rounded-lg overflow-hidden">
        <img
          src="/ejercicio/grammar.png"
          alt="Drag and Drop"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Title and Info */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
            <div className="space-y-2 flex-1">
              <CardTitle className="text-xl sm:text-2xl">{exercise.title || 'Ejercicio Tipo 14'}</CardTitle>
              <span className="text-xs sm:text-sm text-muted-foreground">
                Ejercicio: {exercise.number || 0}
              </span>
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
            <div
              className="text-muted-foreground mt-4 text-sm sm:text-base"
              dangerouslySetInnerHTML={{ __html: exercise.description }}
            />
          )}
        </CardHeader>

        <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
          {/* Audio Player */}
          {exercise.audio && (
            <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-muted/30 rounded-lg">
              <Button
                variant={isPlaying ? 'default' : 'outline'}
                size="icon"
                onClick={toggleAudio}
                className="h-10 w-10 sm:h-12 sm:w-12 rounded-full shrink-0"
              >
                <Volume2 className={`h-5 w-5 sm:h-6 sm:w-6 ${isPlaying ? 'animate-pulse' : ''}`} />
              </Button>
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium text-foreground">Audio del ejercicio</p>
                <p className="text-xs text-muted-foreground">
                  {isPlaying ? 'Reproduciendo...' : 'Haz clic para escuchar'}
                </p>
              </div>
            </div>
          )}

          {/* Drag and Drop Area */}
          <DragDropContext onDragEnd={onDragEnd}>
            {/* Source Items */}
            <div className="mb-4 sm:mb-6">
              <p className="text-xs sm:text-sm text-muted-foreground mb-3">Arrastra las respuestas a las preguntas correspondientes:</p>
              <Droppable droppableId="droppable-items" direction="horizontal">
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`flex flex-wrap gap-2 min-h-[50px] sm:min-h-[60px] p-3 sm:p-4 rounded-lg transition-colors ${
                      snapshot.isDraggingOver ? 'bg-primary/10' : 'bg-muted/30'
                    }`}
                  >
                    {shuffledSourceItems.map((item, index) => (
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
                            className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-medium text-xs sm:text-sm transition-all ${
                              snapshot.isDragging
                                ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                                : 'bg-primary/80 text-primary-foreground hover:bg-primary'
                            } ${verified ? 'opacity-50 cursor-not-allowed' : 'cursor-grab'}`}
                          >
                            <GripVertical className="h-3 w-3 sm:h-4 sm:w-4 opacity-70" />
                            {item.content}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>

            {/* Sentence Drop Zones */}
            <div className="space-y-3 sm:space-y-4">
              {exercise.sentences.map((sentence, iDrop) => (
                <div key={`drop-${iDrop}`} className="p-3 sm:p-4 bg-muted/20 rounded-lg">
                  <div className="flex flex-col md:flex-row md:items-center gap-3 sm:gap-4">
                    {/* Sentence */}
                    <div className="flex-1">
                      <p className="text-foreground font-medium text-sm sm:text-base">{sentence.sentence}</p>
                    </div>

                    {/* Drop Zone */}
                    <div className="flex flex-col items-center gap-2">
                      <Droppable droppableId={`droppable-${iDrop}`}>
                        {(provided, snapshot) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className={getDropZoneClassName(iDrop, snapshot.isDraggingOver)}
                          >
                            {items
                              .filter(x => x.droppableId === iDrop)
                              .map((item) => (
                                <Draggable
                                  key={item.id}
                                  draggableId={item.id}
                                  index={item.index}
                                  isDragDisabled={verified}
                                >
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full font-medium text-xs sm:text-sm ${
                                        snapshot.isDragging
                                          ? 'bg-primary text-primary-foreground shadow-lg'
                                          : verified
                                            ? responses[iDrop]
                                              ? 'bg-green-500 text-white'
                                              : 'bg-red-500 text-white'
                                            : 'bg-primary/80 text-primary-foreground'
                                      } ${verified ? 'cursor-not-allowed' : 'cursor-grab'}`}
                                    >
                                      {item.content}
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                            {items.filter(x => x.droppableId === iDrop).length === 0 && (
                              <span className="text-muted-foreground text-xs sm:text-sm">Soltar aquí</span>
                            )}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>

                      {/* Show correct answer and verification icon */}
                      {verified && (
                        <div className="flex items-center gap-2">
                          {responses[iDrop] ? (
                            <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                              <span className="text-xs sm:text-sm text-red-500 font-medium">
                                {sentence.answer}
                              </span>
                              {sentence.explanation && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5 sm:h-6 sm:w-6"
                                  onClick={() => showExplanation(sentence.explanation)}
                                >
                                  <HelpCircle className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </DragDropContext>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 pt-4">
            {verified && (
              <Button variant="outline" onClick={handleReset} className="gap-2 w-full sm:w-auto">
                <RotateCcw className="h-4 w-4" />
                Reintentar
              </Button>
            )}
            <Button onClick={verified ? () => setGradeModalOpen(true) : handleVerify} className="w-full sm:w-auto">
              {verified ? 'Ver Calificación' : 'Verificar'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Grade Modal */}
      <GradeModal
        open={gradeModalOpen}
        onOpenChange={setGradeModalOpen}
        grade={grade}
        saving={saving}
        onClose={handleClose}
        onGoBack={handleGoBack}
        onNextExercise={handleNextExercise}
      />

      {/* Explanation Modal */}
      <ExplanationModal
        open={explanationModalOpen}
        onOpenChange={setExplanationModalOpen}
        explanation={currentExplanation}
      />
    </div>
  );
}
