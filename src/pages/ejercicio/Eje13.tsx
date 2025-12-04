import { useState, useEffect, Fragment } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle, CheckCircle2, XCircle, Volume2, ChevronLeft, RotateCcw } from 'lucide-react';
import DashboardLoader from '@/components/dashboard/DashboardLoader';
import { useExerciseGrade } from '@/hooks/useExerciseGrade';
import { GradeModal } from '@/components/ejercicio/GradeModal';
import { ExplanationModal } from '@/components/ejercicio/ExplanationModal';

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
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [exercise, setExercise] = useState<Type13Exercise | null>(null);
  const [loading, setLoading] = useState(true);

  const currentExerciseIndex = parseInt(searchParams.get('exerciseIndex') || '0');

  // State for user responses and verification
  const [userResponses, setUserResponses] = useState<string[]>([]);
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

    let calculatedGrade = total > 0 ? successes / total : 0;
    if (calculatedGrade > 1) calculatedGrade = 1;

    openGradeModal(calculatedGrade);
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
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Header Image */}
      <div className="relative w-full h-32 sm:h-48 rounded-lg overflow-hidden">
        <img
          src="/ejercicio/grammar.png"
          alt="Listening"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Title and Info */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
            <div className="space-y-2 flex-1">
              <CardTitle className="text-xl sm:text-2xl">{exercise.title || 'Ejercicio Tipo 13'}</CardTitle>
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

          {/* Sentences */}
          <div className="space-y-3 sm:space-y-4">
            {exercise.sentences.map((sentence, iSentence) => (
              <div key={iSentence} className="flex flex-wrap items-center gap-1 sm:gap-2 py-2 border-b border-border last:border-b-0">
                {sentence.sentence.split('___').map((part, index) => (
                  <Fragment key={index}>
                    {index !== 0 && (
                      <div className="inline-flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1">
                          <Input
                            value={userResponses[getIndex(iSentence, index - 1)] || ''}
                            onChange={(e) => handleChange(getIndex(iSentence, index - 1), e.target.value)}
                            disabled={verified}
                            className={`w-24 sm:w-32 md:w-40 text-center text-sm ${getInputBorderColor(getIndex(iSentence, index - 1))} ${getInputBgColor(getIndex(iSentence, index - 1))}`}
                            placeholder="..."
                          />
                          {verified && (
                            <span className="shrink-0">
                              {responses[getIndex(iSentence, index - 1)] ? (
                                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                              ) : (
                                <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
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
                                className="h-5 w-5 sm:h-6 sm:w-6"
                                onClick={() => showExplanation(sentence.explanation)}
                              >
                                <HelpCircle className="h-3 w-3 text-muted-foreground" />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    <span className="text-foreground text-sm sm:text-base">{part}</span>
                  </Fragment>
                ))}
              </div>
            ))}
          </div>

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
