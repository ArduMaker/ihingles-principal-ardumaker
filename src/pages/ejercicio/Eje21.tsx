import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Volume2, CheckCircle2, XCircle } from 'lucide-react';
import { GradeModal } from '@/components/ejercicio/GradeModal';
import { useExerciseGrade } from '@/hooks/useExerciseGrade';
import DashboardLoader from '@/components/dashboard/DashboardLoader';
import { normalizeAnswer } from '@/lib/exerciseUtils';
import { useIsMobile } from '@/hooks/use-mobile';

interface Type21Exercise {
  _id: string;
  skill?: string;
  type: number;
  number?: number;
  unidad?: number;
  title?: string;
  description?: string;
  audio?: string;
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

interface Eje21Props {
  exercise: Type21Exercise | any;
}

const dividirArray = <T,>(array: T[], groupSize: number): T[][] => {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += groupSize) {
    result.push(array.slice(i, i + groupSize));
  }
  return result;
};

const checkAnswerType21 = (
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

export function Eje21({ exercise: initialExercise }: Eje21Props) {
  const { id } = useParams();
  const isMobile = useIsMobile();
  const [exercise, setExercise] = useState<Type21Exercise | null>(null);
  const [loading, setLoading] = useState(true);

  const [userResponses, setUserResponses] = useState<string[]>([]);
  const [verified, setVerified] = useState(false);
  const [responses, setResponses] = useState<(boolean | '')[]>([]);

  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

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
    let cols = isMobile ? 1 : Math.floor(width / 300);
    if (cols === 0) cols = 1;
    if (cols > (exercise.maxColumns || 4)) cols = exercise.maxColumns || 4;
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
      }
    };
  }, [initialExercise]);

  if (loading || !exercise) {
    return <DashboardLoader />;
  }

  const getIndex = (iGroup: number, i: number): number => {
    const sizes: number[] = [];
    wordGroups.slice(0, iGroup).forEach((group) => sizes.push(group.length));
    return sizes.reduce((a, b) => a + b, 0) + i;
  };

  const handleChange = (index: number, value: string) => {
    setUserResponses((old) => {
      const data = [...old];
      data[index] = value;
      return data;
    });
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

      responsesCheck.push(checkAnswerType21(userResponses[iAns], ...possibleResponses));
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
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">{exercise.title || 'Ejercicio Tipo 21'}</h1>
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

      {/* Audio Player */}
      {exercise.audio && (
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <Button
                variant={isPlaying ? 'default' : 'outline'}
                size="icon"
                onClick={toggleAudio}
                className="h-12 w-12 sm:h-14 sm:w-14 rounded-full shrink-0"
              >
                <Volume2 className={`h-6 w-6 sm:h-7 sm:w-7 ${isPlaying ? 'animate-pulse' : ''}`} />
              </Button>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">Audio del ejercicio</p>
                <p className="text-xs text-muted-foreground truncate">
                  {isPlaying ? 'Reproduciendo...' : 'Escucha el dictado de palabras'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Words Input Grid */}
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

                  return (
                    <div key={`word-${index}`} className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
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
                        <div className="flex-1 flex items-center gap-1 sm:gap-2 min-w-0">
                          <Input
                            value={userResponses[index] || ''}
                            onChange={(e) => handleChange(index, e.target.value)}
                            disabled={verified}
                            className={`text-sm ${getInputBorderColor(index)} ${getInputBgColor(index)}`}
                            placeholder="..."
                          />
                          {verified && (
                            <span className="shrink-0">
                              {isCorrect ? (
                                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                              ) : (
                                <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                      {verified && (
                        <p className={`text-xs ml-8 sm:ml-9 font-medium ${
                          isCorrect
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {word}
                        </p>
                      )}
                    </div>
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
