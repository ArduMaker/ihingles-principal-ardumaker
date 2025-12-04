import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, MicOff, CheckCircle2, XCircle, Volume2 } from 'lucide-react';
import { GradeModal } from '@/components/ejercicio/GradeModal';
import { useExerciseGrade } from '@/hooks/useExerciseGrade';
import DashboardLoader from '@/components/dashboard/DashboardLoader';
import { useIsMobile } from '@/hooks/use-mobile';

interface Type23Exercise {
  _id: string;
  skill?: string;
  type: number;
  number?: number;
  unidad?: number;
  title?: string;
  description?: string;
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

interface Eje23Props {
  exercise: Type23Exercise | any;
}

// Calculate similarity between two strings (returns 0-1)
const calculateSimilarity = (str1: string, str2: string): number => {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return 1;
  if (!s1 || !s2) return 0;

  const words1 = s1.split(/\s+/);
  const words2 = s2.split(/\s+/);
  
  let matchedWords = 0;
  words2.forEach(word => {
    if (words1.some(w => w === word || levenshteinDistance(w, word) <= 1)) {
      matchedWords++;
    }
  });

  return matchedWords / Math.max(words1.length, words2.length);
};

// Levenshtein distance for fuzzy matching
const levenshteinDistance = (str1: string, str2: string): number => {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]) + 1;
      }
    }
  }

  return dp[m][n];
};

// Check answer and return similarity score (0-1)
const checkAnswerType23 = (
  userAnswer: string,
  ...correctAnswers: (string | undefined)[]
): number => {
  if (!userAnswer || userAnswer.trim() === '') return 0;

  let maxSimilarity = 0;
  
  correctAnswers.forEach(answer => {
    if (!answer) return;
    const similarity = calculateSimilarity(userAnswer, answer);
    if (similarity > maxSimilarity) {
      maxSimilarity = similarity;
    }
  });

  return maxSimilarity;
};

// Speech Recognition hook
const useSpeechRecognition = () => {
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
    }
  }, []);

  const startRecognition = (onResult: (text: string) => void, onEnd: () => void) => {
    if (!recognitionRef.current) return;

    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    recognitionRef.current.onend = onEnd;
    recognitionRef.current.onerror = onEnd;

    recognitionRef.current.start();
  };

  const stopRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  return { isSupported, startRecognition, stopRecognition };
};

export function Eje23({ exercise: initialExercise }: Eje23Props) {
  const { id } = useParams();
  const isMobile = useIsMobile();
  const [exercise, setExercise] = useState<Type23Exercise | null>(null);
  const [loading, setLoading] = useState(true);

  const [userResponses, setUserResponses] = useState<string[]>([]);
  const [verified, setVerified] = useState(false);
  const [responses, setResponses] = useState<(number | '')[]>([]);
  
  const [recordingIndex, setRecordingIndex] = useState<number | null>(null);
  const { isSupported, startRecognition, stopRecognition } = useSpeechRecognition();

  const {
    grade,
    gradeModalOpen,
    saving,
    setGradeModalOpen,
    openGradeModal,
    handleClose,
    handleGoBack,
    handleNextExercise,
  } = useExerciseGrade({
    exerciseId: exercise?._id || '',
    unidad: exercise?.unidad || Number(id) || 0,
    exerciseNumber: exercise?.number || 0,
  });

  useEffect(() => {
    if (initialExercise) {
      setExercise(initialExercise);

      const initialStates: string[] = initialExercise.answers?.map(() => '') || [];
      setUserResponses(initialStates);
      setResponses(initialStates.map(() => ''));
      setLoading(false);
    }
  }, [initialExercise]);

  if (loading || !exercise) {
    return <DashboardLoader />;
  }

  const handleRecordStart = (index: number) => {
    if (!isSupported || verified || recordingIndex !== null) return;

    setRecordingIndex(index);
    
    startRecognition(
      (text) => {
        setUserResponses((old) => {
          const data = [...old];
          data[index] = text;
          return data;
        });
      },
      () => {
        setRecordingIndex(null);
      }
    );
  };

  const handleRecordStop = () => {
    stopRecognition();
    setRecordingIndex(null);
  };

  const handleVerify = () => {
    const answers = [...exercise.answers];
    const responsesCheck: number[] = [];

    answers.forEach((answer, iAns) => {
      const possibleResponses: (string | undefined)[] = [answer];

      if (exercise.answers2) possibleResponses.push(exercise.answers2[iAns]);
      if (exercise.answers3) possibleResponses.push(exercise.answers3[iAns]);
      if (exercise.answers4) possibleResponses.push(exercise.answers4[iAns]);
      if (exercise.answers5) possibleResponses.push(exercise.answers5[iAns]);
      if (exercise.answers6) possibleResponses.push(exercise.answers6[iAns]);
      if (exercise.answers7) possibleResponses.push(exercise.answers7[iAns]);
      if (exercise.answers8) possibleResponses.push(exercise.answers8[iAns]);
      if (exercise.answers9) possibleResponses.push(exercise.answers9[iAns]);
      if (exercise.answers10) possibleResponses.push(exercise.answers10[iAns]);
      if (exercise.answers11) possibleResponses.push(exercise.answers11[iAns]);
      if (exercise.answers12) possibleResponses.push(exercise.answers12[iAns]);

      responsesCheck.push(checkAnswerType23(userResponses[iAns], ...possibleResponses));
    });

    setResponses(responsesCheck);
    setVerified(true);

    // Calculate grade as average of similarity scores (0-1)
    const total = responsesCheck.length;
    const calculatedGrade = total > 0 ? responsesCheck.reduce((a, b) => a + b, 0) / total : 0;

    openGradeModal(calculatedGrade);
  };

  const handleReset = () => {
    const initialStates: string[] = exercise.answers?.map(() => '') || [];
    setUserResponses(initialStates);
    setResponses(initialStates.map(() => ''));
    setVerified(false);
  };

  const speakSentence = (sentence: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(sentence);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const getScoreColor = (score: number | ''): string => {
    if (score === '') return '';
    if (score > 0.6) return 'green';
    return 'red';
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 0.9) return 'Excelente';
    if (score >= 0.7) return 'Bien';
    if (score >= 0.5) return 'Regular';
    return 'Mejorable';
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header Image */}
      <div className="relative w-full h-32 sm:h-40 md:h-48 rounded-lg overflow-hidden">
        <img
          src="/ejercicio/principal3.png"
          alt="Pronunciation"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Title and Info */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">{exercise.title || 'Ejercicio Tipo 23'}</h1>
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
            className="text-sm sm:text-base text-muted-foreground mt-2"
            dangerouslySetInnerHTML={{ __html: exercise.description }}
          />
        )}
      </div>

      {/* Speech Recognition Support Warning */}
      {!isSupported && (
        <Card className="border-amber-500/50 bg-amber-500/10">
          <CardContent className="p-3 sm:p-4">
            <p className="text-amber-700 dark:text-amber-300 text-xs sm:text-sm">
              Tu navegador no soporta reconocimiento de voz. Prueba con Chrome o Edge.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Sentences */}
      <div className="space-y-3 sm:space-y-4">
        {exercise.answers.map((sentence, i) => {
          const score = responses[i];
          const isRecording = recordingIndex === i;
          const color = getScoreColor(score);

          return (
            <Card 
              key={i} 
              className={`${
                verified && color === 'green'
                  ? 'border-green-500 bg-green-50/50 dark:bg-green-900/10'
                  : verified && color === 'red'
                    ? 'border-red-500 bg-red-50/50 dark:bg-red-900/10'
                    : ''
              }`}
            >
              <CardContent className="p-3 sm:p-4">
                {/* Sentence with number */}
                <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <span className={`flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full text-xs sm:text-sm font-bold shrink-0 ${
                    verified && color === 'green'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : verified && color === 'red'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-muted text-muted-foreground'
                  }`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground text-base sm:text-lg break-words">{sentence}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-1 h-6 sm:h-7 px-2 text-xs sm:text-sm"
                      onClick={() => speakSentence(sentence)}
                    >
                      <Volume2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Escuchar
                    </Button>
                  </div>
                </div>

                {/* Recording controls */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <Button
                    variant={isRecording ? 'destructive' : 'outline'}
                    size={isMobile ? 'sm' : 'default'}
                    className={`flex-1 text-xs sm:text-sm ${isRecording ? 'animate-pulse' : ''}`}
                    onClick={() => isRecording ? handleRecordStop() : handleRecordStart(i)}
                    disabled={!isSupported || verified || (recordingIndex !== null && !isRecording)}
                  >
                    {isRecording ? (
                      <>
                        <MicOff className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Detener grabación</span>
                        <span className="sm:hidden">Detener</span>
                      </>
                    ) : (
                      <>
                        <Mic className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        <span className="truncate">
                          {userResponses[i] ? 'Grabar de nuevo' : 'Grabar'}
                        </span>
                      </>
                    )}
                  </Button>
                  
                  {verified && (
                    score !== '' && score > 0.6 ? (
                      <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-500 shrink-0" />
                    )
                  )}
                </div>

                {/* User's recorded text */}
                {userResponses[i] && (
                  <div className={`mt-2 sm:mt-3 p-2 sm:p-3 rounded-lg ${
                    verified && color === 'green'
                      ? 'bg-green-100 dark:bg-green-900/30'
                      : verified && color === 'red'
                        ? 'bg-red-100 dark:bg-red-900/30'
                        : 'bg-muted'
                  }`}>
                    <p className="text-xs sm:text-sm">
                      <span className="font-medium">Tu pronunciación:</span>{' '}
                      <span className={
                        verified && color === 'green'
                          ? 'text-green-700 dark:text-green-400'
                          : verified && color === 'red'
                            ? 'text-red-700 dark:text-red-400'
                            : 'text-muted-foreground'
                      }>
                        {userResponses[i]}
                      </span>
                    </p>
                    {verified && score !== '' && (
                      <p className={`text-[10px] sm:text-xs mt-1 ${
                        color === 'green' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        Similitud: {Math.round(score * 100)}% - {getScoreLabel(score)}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
        {verified && (
          <Button variant="outline" onClick={handleReset} className="w-full sm:w-auto">
            Reintentar
          </Button>
        )}
        <Button 
          onClick={verified ? () => setGradeModalOpen(true) : handleVerify} 
          size="lg"
          className="w-full sm:w-auto"
        >
          {verified ? 'Ver Calificación' : 'Verificar'}
        </Button>
      </div>

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
