import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Volume2, HelpCircle, CheckCircle2, XCircle } from 'lucide-react';
import { postUserGrade, postUserPosition } from '@/lib/api';
import { toast } from 'sonner';
import { Calculate_index_exercise } from '@/hooks/calculate_index.ts';
import DashboardLoader from '@/components/dashboard/DashboardLoader';
import { normalizeAnswer } from '@/lib/exerciseUtils';

interface Answer {
  answer: string;
  shown?: boolean;
  isText?: boolean;
  options?: string[];
  explanation?: string;
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
}

interface Sentence {
  sentence: string;
  answers: Answer[];
}

interface Type27Exercise {
  _id: string;
  skill?: string;
  type: number;
  number?: number;
  unidad?: number;
  title?: string;
  description?: string;
  audio?: string;
  imagen?: string;
  options?: string[];
  adjustToSize?: boolean;
  reverted?: boolean;
  sentences: Sentence[];
}

interface Eje27Props {
  exercise: Type27Exercise | any;
}

// Check answer against multiple valid answers
const checkAnswerType27 = (
  userAnswer: string,
  ...correctAnswers: (string | undefined)[]
): boolean => {
  if (!userAnswer || userAnswer.trim() === '' || userAnswer === 'Seleccionar') return false;
  const normalizedUser = normalizeAnswer(userAnswer);
  
  return correctAnswers.some(answer => {
    if (!answer) return false;
    return normalizeAnswer(answer) === normalizedUser;
  });
};

export function Eje27({ exercise: initialExercise }: Eje27Props) {
  const navigate = useNavigate();
  const [exercise, setExercise] = useState<Type27Exercise | null>(null);
  const [loading, setLoading] = useState(true);

  // State for user responses and verification
  const [responses, setResponses] = useState<{ [key: number]: string }>({});
  const [selectState, setSelectState] = useState<(boolean | null)[]>([]);
  const [verified, setVerified] = useState(false);

  // Audio state
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Modal states
  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [grade, setGrade] = useState(0);
  const [explanationModalOpen, setExplanationModalOpen] = useState(false);
  const [currentExplanation, setCurrentExplanation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize exercise data
  useEffect(() => {
    if (initialExercise) {
      setExercise(initialExercise);

      const initialStates: (boolean | null)[] = [];
      const initialResponses: { [key: number]: string } = {};
      
      initialExercise.sentences?.forEach((sentence: Sentence) =>
        sentence.answers.forEach((_, i: number) => {
          initialStates.push(null);
          initialResponses[i] = '';
        })
      );

      setSelectState(initialStates);
      setResponses(initialResponses);

      // Setup audio if available
      if (initialExercise.audio) {
        const audio = new Audio(`/audios/${initialExercise.audio}.mp3`);
        audio.addEventListener('ended', () => setIsPlaying(false));
        setAudioElement(audio);
      }

      setLoading(false);
    }
  }, [initialExercise]);

  if (loading || !exercise) {
    return <DashboardLoader />;
  }

  // Get linear index from sentence and answer indices
  const getIndex = (iSentence: number, i: number): number => {
    const sizes: number[] = [];
    exercise.sentences
      .slice(0, iSentence)
      .forEach((sentence) => sizes.push(sentence.answers.length));
    return sizes.reduce((a, b) => a + b, 0) + i;
  };

  // Check if field at index is shown
  const isShown = (generalIndex: number): boolean => {
    let current = 0;
    for (const sentence of exercise.sentences) {
      for (const answer of sentence.answers) {
        if (current === generalIndex) return answer.shown || false;
        current++;
      }
    }
    return false;
  };

  const handleChange = (index: number, value: string) => {
    setResponses((old) => ({ ...old, [index]: value }));
  };

  const handleVerify = () => {
    const results: boolean[] = [];
    
    exercise.sentences.forEach((sentence, iSentence) =>
      sentence.answers.forEach((answer, i) => {
        if (answer.shown) return results.push(true);
        results.push(
          checkAnswerType27(
            responses[getIndex(iSentence, i)],
            answer.answer,
            answer.answer2,
            answer.answer3,
            answer.answer4,
            answer.answer5,
            answer.answer6,
            answer.answer7,
            answer.answer8,
            answer.answer9,
            answer.answer10,
            answer.answer11,
            answer.answer12
          )
        );
      })
    );

    setSelectState(results);
    setVerified(true);

    // Calculate grade (excluding shown fields)
    const computableResults = results.filter((_, i) => !isShown(i));
    const total = computableResults.length;
    const successes = computableResults.filter((x) => x).length;
    const calculatedGrade = total > 0 ? successes / total : 1;

    setGrade(calculatedGrade);
    setGradeModalOpen(true);
  };

  const handleReset = () => {
    const initialStates: (boolean | null)[] = [];
    const initialResponses: { [key: number]: string } = {};
    
    exercise.sentences?.forEach((sentence: Sentence) =>
      sentence.answers.forEach((_, i: number) => {
        initialStates.push(null);
        initialResponses[i] = '';
      })
    );

    setSelectState(initialStates);
    setResponses(initialResponses);
    setVerified(false);
  };

  const shouldShowAnswer = (): boolean => {
    return verified && Object.values(selectState).some((x) => !x);
  };

  const showExplanation = (text?: string) => {
    if (text) {
      setCurrentExplanation(text);
      setExplanationModalOpen(true);
    }
  };

  const toggleAudio = () => {
    if (!audioElement) return;

    if (isPlaying) {
      audioElement.pause();
      setIsPlaying(false);
    } else {
      audioElement.currentTime = 0;
      audioElement.play();
      setIsPlaying(true);
    }
  };

  const handleSaveGrade = async () => {
    setIsSubmitting(true);
    try {
      await postUserGrade(
        exercise._id,
        grade,
        exercise.unidad?.toString() || '0'
      );

      await postUserPosition({
        unidad: exercise.unidad || 0,
        position: await Calculate_index_exercise(exercise)
      });

      toast.success('Progreso guardado correctamente');
      setGradeModalOpen(false);
    } catch (error) {
      toast.error('Error al guardar el progreso');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextExercise = async () => {
    await handleSaveGrade();
    const nextNumber = (exercise.number || 0) + 1;
    navigate(`/ejercicio/${nextNumber}`);
  };

  const handleGoBack = () => {
    setGradeModalOpen(false);
    navigate(-1);
  };

  const getBorderColor = (index: number): string => {
    if (selectState[index] === null) return 'border-border';
    return selectState[index] ? 'border-green-500' : 'border-red-500';
  };

  const getBgColor = (index: number): string => {
    if (selectState[index] === null) return '';
    return selectState[index] ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20';
  };

  return (
    <div className="space-y-6">
      {/* Header Image */}
      <div className="relative w-full h-48 rounded-lg overflow-hidden">
        <img
          src="/ejercicio/grammar.png"
          alt="Grammar"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Title and Info */}
      <div className="space-y-2">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <h1 className="text-2xl font-bold text-foreground">{exercise.title || 'Ejercicio Tipo 27'}</h1>
          <span className="text-sm text-muted-foreground">
            Ejercicio: {exercise.number || 0}
          </span>
        </div>

        {exercise.skill && (
          <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm capitalize">
            {exercise.skill}
          </span>
        )}

        {exercise.description && (
          <div
            className="text-muted-foreground mt-2"
            dangerouslySetInnerHTML={{ __html: exercise.description }}
          />
        )}
      </div>

      {/* Audio Player */}
      {exercise.audio && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Button
                variant={isPlaying ? 'default' : 'outline'}
                size="icon"
                onClick={toggleAudio}
                className="h-12 w-12 rounded-full"
              >
                <Volume2 className={`h-6 w-6 ${isPlaying ? 'animate-pulse' : ''}`} />
              </Button>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Audio del ejercicio</p>
                <p className="text-xs text-muted-foreground">
                  {isPlaying ? 'Reproduciendo...' : 'Haz clic para escuchar'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sentences */}
      <Card>
        <CardContent className="p-4 md:p-6 space-y-4">
          {exercise.sentences.map((sentence, iSentence) => (
            <div
              key={iSentence}
              className={`flex gap-4 py-4 border-b border-border last:border-b-0 ${
                exercise.reverted ? 'flex-row-reverse' : 'flex-row'
              } flex-wrap md:flex-nowrap`}
            >
              {/* Sentence text */}
              <p className="flex-1 min-w-[200px] text-foreground">{sentence.sentence}</p>

              {/* Answer inputs */}
              <div className="flex flex-wrap gap-2 items-start">
                {sentence.answers.map((answer, i) => {
                  const index = getIndex(iSentence, i);
                  const isCorrect = selectState[index];

                  return (
                    <div key={`ans-${index}`} className="flex flex-col gap-1">
                      {answer.isText ? (
                        // Text input
                        answer.shown ? (
                          <div className={`px-3 py-2 rounded-md border-2 border-green-500 bg-green-50 dark:bg-green-900/20 min-w-[200px]`}>
                            {answer.answer}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Input
                              value={responses[index] || ''}
                              onChange={(e) => handleChange(index, e.target.value)}
                              disabled={verified}
                              className={`min-w-[200px] ${getBorderColor(index)} ${getBgColor(index)}`}
                              placeholder="Escribe tu respuesta"
                            />
                            {verified && (
                              isCorrect ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                              )
                            )}
                          </div>
                        )
                      ) : (
                        // Select dropdown
                        <div className="flex items-center gap-2">
                          <Select
                            value={answer.shown ? answer.answer : (responses[index] || '')}
                            onValueChange={(value) => handleChange(index, value)}
                            disabled={verified || answer.shown}
                          >
                            <SelectTrigger 
                              className={`min-w-[120px] ${
                                exercise.adjustToSize ? 'w-auto' : 'w-[180px]'
                              } ${getBorderColor(index)} ${getBgColor(index)}`}
                            >
                              <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                            <SelectContent>
                              {(answer.options || exercise.options || []).map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {verified && !answer.shown && (
                            isCorrect ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                            )
                          )}
                        </div>
                      )}

                      {/* Show correct answer */}
                      {shouldShowAnswer() && !answer.shown && (
                        <div 
                          className={`flex items-center gap-1 text-xs font-semibold cursor-pointer ${
                            isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                          }`}
                          onClick={() => showExplanation(answer.explanation)}
                        >
                          <span>{answer.answer}</span>
                          {answer.explanation && (
                            <HelpCircle className="h-3 w-3" />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        {verified && (
          <Button variant="outline" onClick={handleReset}>
            Reintentar
          </Button>
        )}
        <Button onClick={verified ? () => setGradeModalOpen(true) : handleVerify} size="lg">
          {verified ? 'Ver Calificación' : 'Verificar'}
        </Button>
      </div>

      {/* Grade Modal */}
      <Dialog open={gradeModalOpen} onOpenChange={setGradeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Calificación</DialogTitle>
            <DialogDescription>
              Resultado de tu ejercicio
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 text-center">
            <div className="text-6xl font-bold text-primary mb-4">
              {Math.round(grade * 100)}%
            </div>
            <p className="text-muted-foreground">
              {grade >= 0.8 ? '¡Excelente trabajo!' : grade >= 0.6 ? '¡Bien hecho!' : 'Sigue practicando'}
            </p>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setGradeModalOpen(false)}
              className="w-full sm:w-auto"
            >
              Cerrar
            </Button>
            <Button
              variant="outline"
              onClick={handleGoBack}
              className="w-full sm:w-auto"
            >
              Volver al Menú
            </Button>
            <Button
              onClick={handleNextExercise}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? 'Guardando...' : 'Siguiente Ejercicio'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Explanation Modal */}
      <Dialog open={explanationModalOpen} onOpenChange={setExplanationModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Explicación</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-foreground">{currentExplanation}</p>
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
}
