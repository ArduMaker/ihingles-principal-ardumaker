import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, MicOff, CheckCircle2, XCircle, Volume2 } from 'lucide-react';
import { GradeModal } from '@/components/ejercicio/GradeModal';
import { useExerciseGrade } from '@/hooks/useExerciseGrade';
import DashboardLoader from '@/components/dashboard/DashboardLoader';
import { normalizeAnswer } from '@/lib/exerciseUtils';
import { useIsMobile } from '@/hooks/use-mobile';

interface Type22Exercise {
  _id: string;
  skill?: string;
  type: number;
  number?: number;
  unidad?: number;
  title?: string;
  description?: string;
  maxColumns?: number;
  words: string[];
  words2?: string[];
  words3?: string[];
  words4?: string[];
  words5?: string[];
  words6?: string[];
  words7?: string[];
  words8?: string[];
  words9?: string[];
  words10?: string[];
  words11?: string[];
  words12?: string[];
}

interface Eje22Props {
  exercise: Type22Exercise | any;
}

const dividirArray = <T,>(array: T[], groupSize: number): T[][] => {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += groupSize) {
    result.push(array.slice(i, i + groupSize));
  }
  return result;
};

const checkAnswerType22 = (
  userAnswer: string,
  ...correctAnswers: (string | undefined)[]
): boolean => {
  if (!userAnswer || userAnswer.trim() === '') return false;
  const normalizedUser = normalizeAnswer(userAnswer);
  
  return correctAnswers.some(answer => {
    if (!answer) return false;
    return normalizeAnswer(answer) === normalizedUser;
  });
};

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

export function Eje22({ exercise: initialExercise }: Eje22Props) {
  const { id } = useParams();
  const isMobile = useIsMobile();
  const [exercise, setExercise] = useState<Type22Exercise | null>(null);
  const [loading, setLoading] = useState(true);

  const [userResponses, setUserResponses] = useState<string[]>([]);
  const [verified, setVerified] = useState(false);
  const [responses, setResponses] = useState<(boolean | '')[]>([]);
  
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

  const columns = useMemo(() => {
    if (!exercise) return 1;
    const width = window.innerWidth;
    let cols = isMobile ? 1 : Math.floor(width / 360);
    if (cols === 0) cols = 1;
    if (cols > (exercise.maxColumns || 3)) cols = exercise.maxColumns || 3;
    return cols;
  }, [exercise, isMobile]);

  const wordGroups = useMemo(() => {
    if (!exercise?.words) return [];
    return dividirArray(exercise.words, columns * 3);
  }, [exercise?.words, columns]);

  useEffect(() => {
    if (initialExercise) {
      setExercise(initialExercise);

      const initialStates: string[] = initialExercise.words?.map(() => '') || [];
      setUserResponses(initialStates);
      setResponses(initialStates.map(() => ''));
      setLoading(false);
    }
  }, [initialExercise]);

  if (loading || !exercise) {
    return <DashboardLoader />;
  }

  const getIndex = (iGroup: number, i: number): number => {
    const sizes: number[] = [];
    wordGroups.slice(0, iGroup).forEach((group) => sizes.push(group.length));
    return sizes.reduce((a, b) => a + b, 0) + i;
  };

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
    const answers = [...exercise.words];
    const responsesCheck: boolean[] = [];

    answers.forEach((answer, iAns) => {
      const possibleResponses: (string | undefined)[] = [answer];

      if (exercise.words2) possibleResponses.push(exercise.words2[iAns]);
      if (exercise.words3) possibleResponses.push(exercise.words3[iAns]);
      if (exercise.words4) possibleResponses.push(exercise.words4[iAns]);
      if (exercise.words5) possibleResponses.push(exercise.words5[iAns]);
      if (exercise.words6) possibleResponses.push(exercise.words6[iAns]);
      if (exercise.words7) possibleResponses.push(exercise.words7[iAns]);
      if (exercise.words8) possibleResponses.push(exercise.words8[iAns]);
      if (exercise.words9) possibleResponses.push(exercise.words9[iAns]);
      if (exercise.words10) possibleResponses.push(exercise.words10[iAns]);
      if (exercise.words11) possibleResponses.push(exercise.words11[iAns]);
      if (exercise.words12) possibleResponses.push(exercise.words12[iAns]);

      responsesCheck.push(checkAnswerType22(userResponses[iAns], ...possibleResponses));
    });

    setResponses(responsesCheck);
    setVerified(true);

    const total = responsesCheck.length;
    const successes = responsesCheck.filter((x) => x).length;
    const calculatedGrade = total > 0 ? successes / total : 1;

    openGradeModal(calculatedGrade);
  };

  const handleReset = () => {
    const initialStates: string[] = exercise.words?.map(() => '') || [];
    setUserResponses(initialStates);
    setResponses(initialStates.map(() => ''));
    setVerified(false);
  };

  const speakWord = (word: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
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
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">{exercise.title || 'Ejercicio Tipo 22'}</h1>
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

      {/* Words Grid */}
      <Card>
        <CardContent className="p-3 sm:p-4 md:p-6">
          <div className="space-y-4 sm:space-y-6">
            {wordGroups.map((group, iGroup) => (
              <div
                key={`group-${iGroup}`}
                className="grid gap-3 sm:gap-4"
                style={{
                  gridTemplateColumns: `repeat(${Math.min(columns, group.length)}, 1fr)`,
                  gridAutoFlow: 'row'
                }}
              >
                {group.map((word, i) => {
                  const index = getIndex(iGroup, i);
                  const isCorrect = responses[index];
                  const isRecording = recordingIndex === index;

                  return (
                    <Card key={`word-${index}`} className={`${
                      verified
                        ? isCorrect
                          ? 'border-green-500 bg-green-50/50 dark:bg-green-900/10'
                          : isCorrect === false
                            ? 'border-red-500 bg-red-50/50 dark:bg-red-900/10'
                            : ''
                        : ''
                    }`}>
                      <CardContent className="p-3 sm:p-4">
                        {/* Word number and text */}
                        <div className="flex items-center justify-between mb-2 sm:mb-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full text-xs sm:text-sm font-bold shrink-0 ${
                              verified
                                ? isCorrect
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                  : isCorrect === false
                                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                    : 'bg-muted text-muted-foreground'
                                : 'bg-muted text-muted-foreground'
                            }`}>
                              {index + 1}
                            </span>
                            <span className="font-semibold text-base sm:text-lg text-foreground truncate">{word}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 sm:h-8 sm:w-8 shrink-0"
                            onClick={() => speakWord(word)}
                          >
                            <Volume2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>

                        {/* Recording button and result */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant={isRecording ? 'destructive' : 'outline'}
                            size="sm"
                            className={`flex-1 text-xs sm:text-sm ${isRecording ? 'animate-pulse' : ''}`}
                            onClick={() => isRecording ? handleRecordStop() : handleRecordStart(index)}
                            disabled={!isSupported || verified || (recordingIndex !== null && !isRecording)}
                          >
                            {isRecording ? (
                              <>
                                <MicOff className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                <span className="hidden sm:inline">Detener</span>
                                <span className="sm:hidden">Stop</span>
                              </>
                            ) : (
                              <>
                                <Mic className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                <span className="truncate">
                                  {userResponses[index] ? 'Grabar' : 'Grabar'}
                                </span>
                              </>
                            )}
                          </Button>
                          
                          {verified && (
                            isCorrect ? (
                              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 shrink-0" />
                            ) : (
                              <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 shrink-0" />
                            )
                          )}
                        </div>

                        {/* User's recorded text */}
                        {userResponses[index] && (
                          <div className={`mt-2 p-2 rounded-lg text-xs sm:text-sm ${
                            verified
                              ? isCorrect
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            <span className="font-medium">Tu pronunciación:</span> {userResponses[index]}
                          </div>
                        )}

                        {/* Correct answer if wrong */}
                        {verified && !isCorrect && (
                          <p className="text-[10px] sm:text-xs text-red-500 mt-2 font-medium">
                            Correcto: {word}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
