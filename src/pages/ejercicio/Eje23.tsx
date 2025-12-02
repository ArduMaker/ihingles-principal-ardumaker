import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Mic, MicOff, CheckCircle2, XCircle, Volume2 } from 'lucide-react';
import { postUserGrade, postUserPosition } from '@/lib/api';
import { toast } from 'sonner';
import { Calculate_index_exercise } from '@/hooks/calculate_index.ts';
import DashboardLoader from '@/components/dashboard/DashboardLoader';

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
  const navigate = useNavigate();
  const [exercise, setExercise] = useState<Type23Exercise | null>(null);
  const [loading, setLoading] = useState(true);

  // State for user responses and verification
  const [userResponses, setUserResponses] = useState<string[]>([]);
  const [verified, setVerified] = useState(false);
  const [responses, setResponses] = useState<(number | '')[]>([]);
  
  // Recording state
  const [recordingIndex, setRecordingIndex] = useState<number | null>(null);
  const { isSupported, startRecognition, stopRecognition } = useSpeechRecognition();

  // Modal states
  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [grade, setGrade] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize exercise data
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

      // Add alternative answers
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

    // Calculate grade as average of similarity scores
    const total = responsesCheck.length;
    const calculatedGrade = total > 0 ? responsesCheck.reduce((a, b) => a + b, 0) / total : 0;

    setGrade(calculatedGrade);
    setGradeModalOpen(true);
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
          <h1 className="text-2xl font-bold text-foreground">{exercise.title || 'Ejercicio Tipo 23'}</h1>
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

      {/* Speech Recognition Support Warning */}
      {!isSupported && (
        <Card className="border-amber-500/50 bg-amber-500/10">
          <CardContent className="p-4">
            <p className="text-amber-700 dark:text-amber-300 text-sm">
              Tu navegador no soporta reconocimiento de voz. Prueba con Chrome o Edge.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Sentences */}
      <div className="space-y-4">
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
              <CardContent className="p-4">
                {/* Sentence with number */}
                <div className="flex items-start gap-3 mb-4">
                  <span className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold shrink-0 ${
                    verified && color === 'green'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : verified && color === 'red'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-muted text-muted-foreground'
                  }`}>
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-foreground text-lg">{sentence}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-1 h-7 px-2"
                      onClick={() => speakSentence(sentence)}
                    >
                      <Volume2 className="h-4 w-4 mr-1" />
                      Escuchar
                    </Button>
                  </div>
                </div>

                {/* Recording controls */}
                <div className="flex items-center gap-3">
                  <Button
                    variant={isRecording ? 'destructive' : 'outline'}
                    className={`flex-1 ${isRecording ? 'animate-pulse' : ''}`}
                    onClick={() => isRecording ? handleRecordStop() : handleRecordStart(i)}
                    disabled={!isSupported || verified || (recordingIndex !== null && !isRecording)}
                  >
                    {isRecording ? (
                      <>
                        <MicOff className="h-4 w-4 mr-2" />
                        Detener grabación
                      </>
                    ) : (
                      <>
                        <Mic className="h-4 w-4 mr-2" />
                        {userResponses[i] ? 'Grabar de nuevo' : 'Grabar pronunciación'}
                      </>
                    )}
                  </Button>
                  
                  {verified && (
                    score !== '' && score > 0.6 ? (
                      <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-500 shrink-0" />
                    )
                  )}
                </div>

                {/* User's recorded text */}
                {userResponses[i] && (
                  <div className={`mt-3 p-3 rounded-lg ${
                    verified && color === 'green'
                      ? 'bg-green-100 dark:bg-green-900/30'
                      : verified && color === 'red'
                        ? 'bg-red-100 dark:bg-red-900/30'
                        : 'bg-muted'
                  }`}>
                    <p className="text-sm">
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
                      <p className={`text-xs mt-1 ${
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
