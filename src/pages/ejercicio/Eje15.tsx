import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, Volume2, ChevronLeft, RotateCcw } from 'lucide-react';
import DashboardLoader from '@/components/dashboard/DashboardLoader';
import { useExerciseGrade } from '@/hooks/useExerciseGrade';
import { GradeModal } from '@/components/ejercicio/GradeModal';

const defaultDescription = `Reproduce el audio para escuchar las instrucciones. Te indican que oirás cada oración dos veces seguidas. Tienes que poner las comas (,) exclamaciones (!) e interrogaciones (?) cuando el audio te lo indique. Por comodidad para el alumno, no poner los puntos (.) nunca al final de cada oración. Solo cuando lo escuches en el audio (seguramente entre dos oraciones).`;

interface Type15Exercise {
  _id: string;
  type: number;
  number?: number;
  unidad?: number;
  title?: string;
  description?: string;
  audio?: string;
  imagen?: string;
  calificationSobre?: number;
  answers: string[];
  answers2?: string[];
  answers3?: string[];
  answers4?: string[];
  answers5?: string[];
  answers6?: string[];
  answers7?: string[];
  answers8?: string[];
  answers9?: string[];
  answers10?: string[];
  answers11?: string[];
  answers12?: string[];
}

interface Eje15Props {
  exercise: Type15Exercise | any;
}

// Normalize text for comparison
const normalizeForComparison = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s,!?]/g, '')
    .trim();
};

// Check answer against multiple valid answers - returns a score (0 to 1)
const checkAnswerType15 = (userAnswer: string, ...validAnswers: (string | undefined)[]): number => {
  if (!userAnswer || userAnswer.trim() === '') return 0;

  const normalizedUser = normalizeForComparison(userAnswer);

  // Check for exact match first
  for (const answer of validAnswers) {
    if (answer && normalizeForComparison(answer) === normalizedUser) {
      return 1;
    }
  }

  // Calculate similarity score with the best matching answer
  let bestScore = 0;
  for (const answer of validAnswers) {
    if (answer) {
      const normalizedAnswer = normalizeForComparison(answer);
      const score = calculateSimilarity(normalizedUser, normalizedAnswer);
      if (score > bestScore) {
        bestScore = score;
      }
    }
  }

  return bestScore;
};

// Calculate similarity between two strings (simple Levenshtein-based)
const calculateSimilarity = (str1: string, str2: string): number => {
  if (str1 === str2) return 1;
  if (str1.length === 0 || str2.length === 0) return 0;

  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  const distance = matrix[len1][len2];
  const maxLen = Math.max(len1, len2);
  return 1 - distance / maxLen;
};

export function Eje15({ exercise: initialExercise }: Eje15Props) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [exercise, setExercise] = useState<Type15Exercise | null>(null);
  const [loading, setLoading] = useState(true);

  const currentExerciseIndex = parseInt(searchParams.get('exerciseIndex') || '0');

  // State for user responses and verification
  const [userResponses, setUserResponses] = useState<string[]>([]);
  const [verified, setVerified] = useState(false);
  const [responses, setResponses] = useState<(number | '')[]>([]);

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

      // Initialize empty responses
      const initialStates: string[] = initialExercise.answers?.map(() => '') || [];
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

  const handleChange = (index: number, value: string) => {
    setUserResponses(prev => {
      const newResponses = [...prev];
      newResponses[index] = value;
      return newResponses;
    });
  };

  const handleVerify = () => {
    const responsesCheck: number[] = [];

    exercise.answers.forEach((answer, iAns) => {
      const validAnswers = [
        answer,
        exercise.answers2?.[iAns],
        exercise.answers3?.[iAns],
        exercise.answers4?.[iAns],
        exercise.answers5?.[iAns],
        exercise.answers6?.[iAns],
        exercise.answers7?.[iAns],
        exercise.answers8?.[iAns],
        exercise.answers9?.[iAns],
        exercise.answers10?.[iAns],
        exercise.answers11?.[iAns],
        exercise.answers12?.[iAns],
      ];

      responsesCheck.push(
        checkAnswerType15(userResponses[iAns], ...validAnswers)
      );
    });

    setResponses(responsesCheck);
    setVerified(true);

    // Calculate grade as average of scores
    const total = responsesCheck.length;
    let calculatedGrade = total > 0 ? responsesCheck.reduce((a, b) => a + b, 0) / total : 0;
    if (calculatedGrade > 1) calculatedGrade = 1;

    openGradeModal(calculatedGrade);
  };

  const handleReset = () => {
    const initialStates: string[] = exercise.answers.map(() => '');
    setUserResponses(initialStates);
    setResponses(initialStates.map(() => ''));
    setVerified(false);
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

  const getScoreColor = (score: number | ''): string => {
    if (score === '') return 'bg-muted';
    if (score >= 0.8) return 'bg-green-500';
    if (score >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getInputClassName = (index: number): string => {
    if (!verified) return '';
    const score = responses[index];
    if (score === '') return '';
    if (typeof score === 'number') {
      if (score >= 0.8) return 'border-green-500 bg-green-50 dark:bg-green-900/20';
      if (score >= 0.6) return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      return 'border-red-500 bg-red-50 dark:bg-red-900/20';
    }
    return '';
  };

  const description = exercise.description || (exercise.imagen ? exercise.description : defaultDescription);

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Header Image */}
      <div className="relative w-full h-32 sm:h-48 rounded-lg overflow-hidden">
        <img
          src="/ejercicio/grammar.png"
          alt="Dictation"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Title and Info */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
            <div className="space-y-2 flex-1">
              <CardTitle className="text-xl sm:text-2xl">{exercise.title || 'Ejercicio Tipo 15 - Dictado'}</CardTitle>
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

          {description && (
            <div
              className="text-muted-foreground text-xs sm:text-sm mt-4"
              dangerouslySetInnerHTML={{ __html: description }}
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
                <p className="text-xs sm:text-sm font-medium text-foreground">Audio del dictado</p>
                <p className="text-xs text-muted-foreground">
                  {isPlaying ? 'Reproduciendo...' : 'Haz clic para escuchar'}
                </p>
              </div>
            </div>
          )}

          {/* Sentences Input */}
          <div className="space-y-3 sm:space-y-4">
            {exercise.answers.map((answer, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-start gap-2 sm:gap-3">
                  {/* Number indicator */}
                  <div 
                    className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full text-white font-semibold text-xs sm:text-sm shrink-0 ${getScoreColor(responses[index])}`}
                  >
                    {index + 1}
                  </div>

                  {/* Input field */}
                  <div className="flex-1 space-y-1">
                    <Input
                      value={userResponses[index] || ''}
                      onChange={(e) => handleChange(index, e.target.value)}
                      disabled={verified}
                      placeholder={`Ingrese oración ${index + 1}`}
                      className={`w-full text-sm sm:text-base ${getInputClassName(index)}`}
                    />

                    {/* Show result after verification */}
                    {verified && (
                      <div className="flex items-center gap-2 flex-wrap">
                        {typeof responses[index] === 'number' && responses[index] >= 0.8 ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                        )}
                        <span className={`text-xs sm:text-sm ${
                          typeof responses[index] === 'number' && responses[index] >= 0.8
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {answer}
                        </span>
                        {typeof responses[index] === 'number' && (
                          <span className="text-xs text-muted-foreground ml-2">
                            ({Math.round(responses[index] * 100)}% coincidencia)
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
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
    </div>
  );
}
