import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { getVideoCredentials } from '@/data/unidades';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Loader2, Play, CheckCircle2, Mic, MicOff, RefreshCw, ArrowRight } from 'lucide-react';
import { postUserPosition, postUserGrade } from '@/lib/api';
import { toast } from 'sonner';
import { Calculate_index_exercise } from '@/hooks/calculate_index.ts';
import DashboardLoader from '@/components/dashboard/DashboardLoader';
import { useIsMobile } from '@/hooks/use-mobile';
import { normalizeAnswer } from '@/lib/exerciseUtils';

interface Answer {
  timeInSeconds: number;
  answer: string;
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

interface InteractiveVideoExercise {
  _id: string;
  skill?: string;
  type: number;
  number?: number;
  unidad?: number;
  title?: string;
  description?: string;
  videoID?: string;
  answers?: Answer[];
  completedByUser?: boolean;
}

interface Eje31Props {
  exercise: InteractiveVideoExercise | any;
}

const calculateSimilarity = (str1: string, str2: string): number => {
  const s1 = normalizeAnswer(str1);
  const s2 = normalizeAnswer(str2);
  
  if (s1 === s2) return 1;
  if (s1.length === 0 || s2.length === 0) return 0;

  const matrix: number[][] = [];
  
  for (let i = 0; i <= s1.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= s2.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  
  const distance = matrix[s1.length][s2.length];
  const maxLength = Math.max(s1.length, s2.length);
  return 1 - distance / maxLength;
};

const checkAnswerSimilarity = (userAnswer: string, answer: Answer): number => {
  const possibleResponses = [
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
    answer.answer12,
  ].filter(Boolean) as string[];

  let maxSimilarity = 0;
  for (const response of possibleResponses) {
    const similarity = calculateSimilarity(userAnswer, response);
    if (similarity > maxSimilarity) {
      maxSimilarity = similarity;
    }
  }
  
  return maxSimilarity;
};

declare global {
  interface Window {
    VdoPlayer?: any;
  }
}

let lastSeenTime = 0;

export const Eje31 = ({ exercise: initialExercise }: Eje31Props) => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const [exercise, setExercise] = useState<InteractiveVideoExercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [videoData, setVideoData] = useState<{ otp: string; playbackInfo: string } | null>(null);
  const [error, setError] = useState(false);
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [speakModalOpen, setSpeakModalOpen] = useState(false);
  const [currentAnswerIndex, setCurrentAnswerIndex] = useState<number | undefined>(undefined);
  const [userResponse, setUserResponse] = useState('');
  const [result, setResult] = useState<number | undefined>(undefined);
  const [isRecording, setIsRecording] = useState(false);
  
  const playerRef = useRef<any>(null);
  const timeCheckInterval = useRef<NodeJS.Timeout | null>(null);
  const completionInterval = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const currentExerciseIndex = parseInt(searchParams.get('exerciseIndex') || '0');

  useEffect(() => {
    if (initialExercise) {
      setExercise(initialExercise);
      setVideoCompleted(initialExercise.completedByUser || false);
      setLoading(false);
    }
  }, [initialExercise]);

  const getResultColor = (value: number | undefined) => {
    if (value === undefined) return '';
    return value >= 0.6 ? 'text-green-500' : 'text-red-500';
  };

  const getResultBgColor = (value: number | undefined) => {
    if (value === undefined) return 'border-border';
    return value >= 0.6 ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-red-500 bg-red-50 dark:bg-red-900/20';
  };

  const setupTimeListener = () => {
    if (!playerRef.current || !exercise?.answers) return;

    const listener = () => {
      if (!playerRef.current?.video) return;
      
      const currentTime = playerRef.current.video.currentTime;
      const answers = exercise.answers || [];

      for (let index = 0; index < answers.length; index++) {
        const answer = answers[index];

        if (
          answer.timeInSeconds >= currentTime - 0.25 &&
          answer.timeInSeconds < currentTime &&
          (lastSeenTime === 0 || lastSeenTime + 1000 < Date.now())
        ) {
          playerRef.current.video.pause();
          setCurrentAnswerIndex(index);
          setSpeakModalOpen(true);
          break;
        }
      }
    };

    timeCheckInterval.current = setInterval(listener, 250);
  };

  const setupCompletionListener = () => {
    if (!playerRef.current) return;

    const listener = async () => {
      if (!playerRef.current?.api || !playerRef.current?.video) return;

      try {
        const totalPlayed = await playerRef.current.api.getTotalPlayed();
        const duration = playerRef.current.video.duration;

        if (!totalPlayed || !duration) return;

        if (totalPlayed >= duration * 0.75 && !videoCompleted) {
          if (completionInterval.current) {
            clearInterval(completionInterval.current);
          }
          setVideoCompleted(true);
          await markExerciseCompleted();
        }
      } catch (err) {
        console.error('Error checking completion:', err);
      }
    };

    completionInterval.current = setInterval(listener, 1000);
  };

  const fetchVideoData = async () => {
    if (!exercise?.videoID) {
      setError(true);
      return;
    }

    if (exercise.videoID.startsWith('http://') || exercise.videoID.startsWith('https://')) {
      window.open(exercise.videoID, '_blank');
      return;
    }

    setLoading(true);
    setError(false);

    try {
      const credentials = await getVideoCredentials(exercise.videoID);

      if (credentials === 'fallo' || typeof credentials === 'string') {
        setError(true);
        return;
      }

      setVideoData(credentials);

      setTimeout(() => {
        playerRef.current = window.VdoPlayer?.getInstance(
          document.getElementById('vdocipher-iframe-31')
        );

        if (playerRef.current) {
          setupTimeListener();
          if (!exercise.completedByUser && !videoCompleted) {
            setupCompletionListener();
          }
        }
      }, 1500);
    } catch (err) {
      console.error('Error fetching video:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (exercise?.videoID) {
      fetchVideoData();
    }

    return () => {
      if (timeCheckInterval.current) {
        clearInterval(timeCheckInterval.current);
      }
      if (completionInterval.current) {
        clearInterval(completionInterval.current);
      }
      stopRecording();
    };
  }, [exercise?.videoID]);

  const getResult = (currentUserAnswer: string) => {
    if (!currentUserAnswer || currentUserAnswer.trim() === '' || currentAnswerIndex === undefined) return;

    const answer = exercise?.answers?.[currentAnswerIndex];
    if (!answer) return;

    const similarity = checkAnswerSimilarity(currentUserAnswer, answer);
    setResult(similarity);
  };

  const startRecording = async () => {
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setUserResponse(transcript);
          getResult(transcript);
          setIsRecording(false);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          toast.error('Error en el reconocimiento de voz');
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognition.start();
        setIsRecording(true);
        toast.info('Habla ahora...');
      } else {
        toast.error('Tu navegador no soporta reconocimiento de voz');
      }
    } catch (err) {
      console.error('Error accessing microphone:', err);
      toast.error('No se pudo acceder al micrófono');
    }
  };

  const stopRecording = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsRecording(false);
  };

  const handleCloseModal = () => {
    lastSeenTime = Date.now();
    setSpeakModalOpen(false);
    setCurrentAnswerIndex(undefined);
    setResult(undefined);
    setUserResponse('');
    stopRecording();
    
    if (playerRef.current?.video) {
      playerRef.current.video.play();
    }
  };

  const markExerciseCompleted = async () => {
    if (progressSaved || !exercise) return;

    try {
      const unidad = Number(exercise.unidad) || Number(id) || 0;

      await postUserPosition({
        unidad: unidad,
        position: await Calculate_index_exercise(exercise)
      });

      await postUserGrade(exercise._id, 1, String(unidad));

      setProgressSaved(true);
      toast.success('¡Ejercicio completado! Progreso guardado.');
    } catch (err) {
      console.error('Error saving progress:', err);
      toast.error('Error al guardar el progreso');
    }
  };

  const handleNextExercise = async () => {
    setIsSubmitting(true);
    try {
      if (!progressSaved && videoCompleted) {
        await markExerciseCompleted();
      }
      const nextExerciseIndex = currentExerciseIndex + 1;
      navigate(`/modulo/${id || exercise?.unidad}?exerciseIndex=${nextExerciseIndex}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    navigate(`/modulo/${id || exercise?.unidad}`);
  };

  const handleSkipVideo = async () => {
    setIsSubmitting(true);
    try {
      if (!progressSaved && exercise) {
        const unidad = Number(exercise.unidad) || Number(id) || 0;
        await postUserPosition({
          unidad: unidad,
          position: await Calculate_index_exercise(exercise)
        });
        await postUserGrade(exercise._id, 1, String(unidad));
        setProgressSaved(true);
      }
      const nextExerciseIndex = currentExerciseIndex + 1;
      navigate(`/modulo/${id || exercise?.unidad}?exerciseIndex=${nextExerciseIndex}`);
    } catch (err) {
      toast.error('Error al avanzar');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!exercise) {
    return <DashboardLoader />;
  }

  const videoUrl = videoData
    ? `https://player.vdocipher.com/v2/?otp=${videoData.otp}&playbackInfo=${videoData.playbackInfo}`
    : null;

  const currentAnswer = currentAnswerIndex !== undefined ? exercise.answers?.[currentAnswerIndex] : undefined;

  return (
    <div className="space-y-4 md:space-y-6">

      {/* Header Image */}
      <div className="relative w-full h-32 sm:h-40 md:h-48 rounded-lg overflow-hidden">
        <img
          src="/ejercicio/grammar.png"
          alt="Video Interactivo"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <Play className="h-12 w-12 sm:h-16 sm:w-16 text-white" />
        </div>
      </div>


      {/* Botón de siguiente ejercicio en la parte superior */}
      <div className="flex justify-end">
        <Button
          onClick={handleSkipVideo}
          disabled={isSubmitting}
          variant="outline"
          className="gap-2"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
          Siguiente Ejercicio
        </Button>
      </div>
      

      {/* Title and Info */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">{exercise.title || 'Video Interactivo'}</h1>
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
          <p className="text-sm sm:text-base text-muted-foreground mt-2">{exercise.description}</p>
        )}
      </div>

      {/* Video Player */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          {loading && !videoData && (
            <div className="flex items-center justify-center py-16 sm:py-24">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {error && (
            <div className="text-center py-8 sm:py-12">
              <p className="text-destructive mb-4 text-sm sm:text-base">No se pudo cargar el video.</p>
              <Button variant="outline" onClick={fetchVideoData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reintentar
              </Button>
            </div>
          )}

          {videoUrl && (
            <div className="space-y-4">
              <div
                className="relative w-full bg-black rounded-lg overflow-hidden"
                style={{ height: isMobile ? '45vh' : '60vh', maxHeight: '500px' }}
              >
                <iframe
                  id="vdocipher-iframe-31"
                  src={videoUrl}
                  className="absolute inset-0 w-full h-full"
                  allow="encrypted-media; fullscreen"
                  allowFullScreen
                  title={exercise.title || 'Video Interactivo'}
                  style={{ border: 0 }}
                />
              </div>

              {/* Progress info */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {videoCompleted
                    ? '✓ Has completado este video'
                    : 'Mira el video y responde a las preguntas que aparecen'
                  }
                </p>

                {videoCompleted && (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium text-sm">Completado</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Already completed notice */}
      {exercise.completedByUser && (
        <Card className="border-green-500/50 bg-green-500/10">
          <CardContent className="p-3 sm:p-4 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
            <span className="text-green-700 dark:text-green-300 text-sm sm:text-base">
              Ya completaste este ejercicio anteriormente
            </span>
          </CardContent>
        </Card>
      )}

      {/* Navigation buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
        <Button variant="outline" onClick={handleGoBack} className="w-full sm:w-auto">
          Volver al Menú
        </Button>
        <Button
          onClick={handleNextExercise}
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Cargando...
            </>
          ) : (
            'Siguiente Ejercicio'
          )}
        </Button>
      </div>

      {/* Speaking Modal */}
      <Dialog open={speakModalOpen} onOpenChange={(open) => !open && handleCloseModal()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Repite la frase</DialogTitle>
            <DialogDescription>
              Escucha y repite lo que escuchaste en el video
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {currentAnswer && (
              <p className="text-center text-lg font-medium text-foreground">
                "{currentAnswer.answer}"
              </p>
            )}

            {/* Recording button */}
            <div className="flex justify-center">
              <Button
                variant={isRecording ? 'destructive' : 'outline'}
                size="lg"
                className={`rounded-full h-16 w-16 ${isRecording ? 'animate-pulse' : ''}`}
                onClick={() => isRecording ? stopRecording() : startRecording()}
              >
                {isRecording ? (
                  <MicOff className="h-6 w-6" />
                ) : (
                  <Mic className="h-6 w-6" />
                )}
              </Button>
            </div>

            {/* Text input fallback */}
            <div className="space-y-2">
              <p className="text-xs text-center text-muted-foreground">O escribe tu respuesta:</p>
              <Input
                value={userResponse}
                onChange={(e) => {
                  setUserResponse(e.target.value);
                  getResult(e.target.value);
                }}
                placeholder="Escribe aquí..."
                className={result !== undefined ? getResultBgColor(result) : ''}
              />
            </div>

            {/* Result */}
            {result !== undefined && (
              <div className={`text-center p-3 rounded-lg ${
                result >= 0.6 
                  ? 'bg-green-100 dark:bg-green-900/30' 
                  : 'bg-red-100 dark:bg-red-900/30'
              }`}>
                <p className={`text-lg font-bold ${getResultColor(result)}`}>
                  {Math.round(result * 100)}%
                </p>
                <p className={`text-sm ${getResultColor(result)}`}>
                  {result >= 0.9 ? '¡Excelente!' : result >= 0.6 ? '¡Bien hecho!' : 'Sigue practicando'}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={handleCloseModal} className="w-full">
              Continuar Video
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
