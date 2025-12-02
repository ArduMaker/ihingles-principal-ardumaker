import { useState, useEffect, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { HelpCircle, CheckCircle2, XCircle, Volume2 } from 'lucide-react';
import { postUserGrade, postUserPosition } from '@/lib/api';
import { toast } from 'sonner';
import { Calculate_index_exercise } from '@/hooks/calculate_index.ts';
import DashboardLoader from '@/components/dashboard/DashboardLoader';

interface SentenceData {
  sentence: string;
  answers: string[];
  answers2?: string[];
  answers3?: string[];
  explanation?: string;
}

interface Type13Exercise {
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

interface Eje13Props {
  exercise: Type13Exercise | any;
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

// Get plain value from answer (handles objects with value property)
const getPlainValue = (answer: any): string => {
  if (!answer) return '';
  if (typeof answer === 'object' && answer.value) return answer.value;
  return String(answer);
};

// Check answer against multiple valid answers for type 13
const checkAnswerType13 = (
  userAnswer: string,
  correctAnswer: string,
  answer2?: string,
  answer3?: string
): boolean => {
  if (!userAnswer || userAnswer.trim() === '') return false;

  const normalizedUser = normalizeForComparison(userAnswer);

  const validAnswers = [correctAnswer, answer2, answer3].filter(Boolean);

  return validAnswers.some(answer => {
    const normalizedAnswer = normalizeForComparison(getPlainValue(answer));
    return normalizedUser === normalizedAnswer;
  });
};

export function Eje13({ exercise: initialExercise }: Eje13Props) {
  const navigate = useNavigate();
  const [exercise, setExercise] = useState<Type13Exercise | null>(null);
  const [loading, setLoading] = useState(true);

  // State for user responses and verification
  const [userResponses, setUserResponses] = useState<string[]>([]);
  const [verified, setVerified] = useState(false);
  const [responses, setResponses] = useState<(boolean | '')[]>([]);

  // Modal states
  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [grade, setGrade] = useState(0);
  const [explanationModalOpen, setExplanationModalOpen] = useState(false);
  const [currentExplanation, setCurrentExplanation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Audio state
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Initialize exercise data
  useEffect(() => {
    if (initialExercise) {
      setExercise(initialExercise);

      // Count total number of blanks across all sentences
      const initialStates: string[] = [];
      initialExercise.sentences?.forEach((sentence: SentenceData) => {
        sentence.answers?.forEach(() => initialStates.push(''));
      });

      setUserResponses(initialStates);
      setResponses(initialStates.map(() => ''));

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

  // Get linear index from sentence and answer indices
  const getIndex = (iSentence: number, iAnswer: number): number => {
    const sizes: number[] = [];
    exercise.sentences
      .slice(0, iSentence)
      .forEach((sentence) => sizes.push(sentence.answers?.length || 0));
    return sizes.reduce((a, b) => a + b, 0) + iAnswer;
  };

  // Get the correct answer at a specific index
  const getAnswer = (i: number): string => {
    const answers: string[] = [];
    exercise.sentences.forEach((sentence) =>
      sentence.answers?.forEach((answer) => answers.push(answer))
    );
    return answers[i] || '';
  };

  // Get explanation for a sentence by index
  const getExplanationForIndex = (globalIndex: number): string | undefined => {
    let count = 0;
    for (const sentence of exercise.sentences) {
      const answersLength = sentence.answers?.length || 0;
      if (globalIndex < count + answersLength) {
        return sentence.explanation;
      }
      count += answersLength;
    }
    return undefined;
  };

  // Get sentence data by global index
  const getSentenceByIndex = (globalIndex: number): SentenceData | undefined => {
    let count = 0;
    for (const sentence of exercise.sentences) {
      const answersLength = sentence.answers?.length || 0;
      if (globalIndex < count + answersLength) {
        return sentence;
      }
      count += answersLength;
    }
    return undefined;
  };

  const handleChange = (index: number, value: string) => {
    setUserResponses(prev => {
      const newResponses = [...prev];
      newResponses[index] = value;
      return newResponses;
    });
  };

  const handleVerify = () => {
    const answers: string[] = [];
    const answers2: (string | undefined)[] = [];
    const answers3: (string | undefined)[] = [];

    exercise.sentences.forEach((sentence) => {
      sentence.answers?.forEach((answer, i) => {
        answers.push(answer);
        answers2.push(sentence.answers2?.[i]);
        answers3.push(sentence.answers3?.[i]);
      });
    });

    const responsesCheck: boolean[] = [];
    answers.forEach((answer, iAns) =>
      responsesCheck.push(
        checkAnswerType13(
          userResponses[iAns],
          answer,
          answers2[iAns],
          answers3[iAns]
        )
      )
    );

    setResponses(responsesCheck.map(r => r));
    setVerified(true);

    // Calculate grade
    const total = exercise.calificationSobre ?? responsesCheck.length;
    const successes = responsesCheck.filter(x => x).length;

    let calculatedGrade = successes / total;
    if (calculatedGrade > 1) calculatedGrade = 1;

    setGrade(calculatedGrade);
    setGradeModalOpen(true);
  };

  const handleReset = () => {
    const initialStates: string[] = [];
    exercise.sentences?.forEach((sentence: SentenceData) => {
      sentence.answers?.forEach(() => initialStates.push(''));
    });

    setUserResponses(initialStates);
    setResponses(initialStates.map(() => ''));
    setVerified(false);
  };

  const showExplanation = (explanation: string | undefined) => {
    if (explanation) {
      setCurrentExplanation(explanation);
      setExplanationModalOpen(true);
    }
  };

  const shouldShowAnswer = (): boolean => {
    return verified && responses.some(x => x === false);
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

  const getInputBorderColor = (index: number): string => {
    if (!verified) return 'border-border';
    if (responses[index] === '') return 'border-border';
    return responses[index] ? 'border-green-500' : 'border-red-500';
  };

  const getInputBgColor = (index: number): string => {
    if (!verified) return '';
    if (responses[index] === '') return '';
    return responses[index] ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20';
  };

  return (
    <div className="space-y-6">
      {/* Header Image */}
      <div className="relative w-full h-48 rounded-lg overflow-hidden">
        <img
          src="/ejercicio/grammar.png"
          alt="Listening"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Title and Info */}
      <div className="space-y-2">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <h1 className="text-2xl font-bold text-foreground">{exercise.title || 'Ejercicio Tipo 13'}</h1>
          <span className="text-sm text-muted-foreground">
            Ejercicio: {exercise.number || 0}
          </span>
        </div>

        {exercise.description && (
          <div
            className="text-muted-foreground"
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
            <div key={iSentence} className="flex flex-wrap items-center gap-2 py-2 border-b border-border last:border-b-0">
              {sentence.sentence.split('___').map((part, index) => (
                <Fragment key={index}>
                  {index !== 0 && (
                    <div className="inline-flex flex-col items-center gap-1">
                      <div className="flex items-center gap-1">
                        <Input
                          value={userResponses[getIndex(iSentence, index - 1)] || ''}
                          onChange={(e) => handleChange(getIndex(iSentence, index - 1), e.target.value)}
                          disabled={verified}
                          className={`w-32 md:w-40 text-center ${getInputBorderColor(getIndex(iSentence, index - 1))} ${getInputBgColor(getIndex(iSentence, index - 1))}`}
                          placeholder="..."
                        />
                        {verified && (
                          <span className="shrink-0">
                            {responses[getIndex(iSentence, index - 1)] ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500" />
                            )}
                          </span>
                        )}
                      </div>
                      {shouldShowAnswer() && responses[getIndex(iSentence, index - 1)] === false && (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-red-500 font-medium">
                            {getPlainValue(getAnswer(getIndex(iSentence, index - 1)))}
                          </span>
                          {sentence.explanation && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => showExplanation(sentence.explanation)}
                            >
                              <HelpCircle className="h-3 w-3 text-muted-foreground" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  <span className="text-foreground">{part}</span>
                </Fragment>
              ))}
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
