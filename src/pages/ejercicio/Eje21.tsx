import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Volume2, CheckCircle2, XCircle } from 'lucide-react';
import { postUserGrade, postUserPosition } from '@/lib/api';
import { toast } from 'sonner';
import { Calculate_index_exercise } from '@/hooks/calculate_index.ts';
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

// Divide array into groups
const dividirArray = <T,>(array: T[], groupSize: number): T[][] => {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += groupSize) {
    result.push(array.slice(i, i + groupSize));
  }
  return result;
};

// Check answer against multiple valid answers
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
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [exercise, setExercise] = useState<Type21Exercise | null>(null);
  const [loading, setLoading] = useState(true);

  // State for user responses and verification
  const [userResponses, setUserResponses] = useState<string[]>([]);
  const [verified, setVerified] = useState(false);
  const [responses, setResponses] = useState<(boolean | '')[]>([]);

  // Audio state
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Modal states
  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [grade, setGrade] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate columns based on screen width
  const columns = useMemo(() => {
    if (!exercise) return 1;
    const width = window.innerWidth;
    let cols = Math.floor(width / 300);
    if (cols === 0) cols = 1;
    if (cols > (exercise.maxColumns || 4)) cols = exercise.maxColumns || 4;
    return cols;
  }, [exercise]);

  // Group words for display
  const wordGroups = useMemo(() => {
    if (!exercise?.words) return [];
    return dividirArray(exercise.words, columns * 3);
  }, [exercise?.words, columns]);

  // Initialize exercise data
  useEffect(() => {
    if (initialExercise) {
      setExercise(initialExercise);

      const initialStates: string[] = initialExercise.words?.map(() => '') || [];
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
      }
    };
  }, [initialExercise]);

  if (loading || !exercise) {
    return <DashboardLoader />;
  }

  // Get index from group and position
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

      // Add alternative answers
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

    // Calculate grade
    const total = responsesCheck.length;
    const successes = responsesCheck.filter((x) => x).length;
    const calculatedGrade = total > 0 ? successes / total : 1;

    setGrade(calculatedGrade);
    setGradeModalOpen(true);
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
          src="/ejercicio/principal3.png"
          alt="Pronunciation"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Title and Info */}
      <div className="space-y-2">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <h1 className="text-2xl font-bold text-foreground">{exercise.title || 'Ejercicio Tipo 21'}</h1>
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
                className="h-14 w-14 rounded-full"
              >
                <Volume2 className={`h-7 w-7 ${isPlaying ? 'animate-pulse' : ''}`} />
              </Button>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Audio del ejercicio</p>
                <p className="text-xs text-muted-foreground">
                  {isPlaying ? 'Reproduciendo...' : 'Escucha el dictado de palabras'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Words Input Grid */}
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="space-y-6">
            {wordGroups.map((group, iGroup) => (
              <div
                key={`group-${iGroup}`}
                className="grid gap-4"
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
                        <span className={`flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold ${
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
                        <div className="flex-1 flex items-center gap-2">
                          <Input
                            value={userResponses[index] || ''}
                            onChange={(e) => handleChange(index, e.target.value)}
                            disabled={verified}
                            className={`${getInputBorderColor(index)} ${getInputBgColor(index)}`}
                            placeholder="..."
                          />
                          {verified && (
                            <span className="shrink-0">
                              {isCorrect ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-500" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                      {verified && (
                        <p className={`text-xs ml-9 font-medium ${
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
    </div>
  );
}
