import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Exercise, getVideoCredentials } from '@/data/unidades';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Loader2, Play, CheckCircle2, Mic, MicOff, RefreshCw, Volume2 } from 'lucide-react';
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

// Calculate similarity between two strings (Levenshtein-based)
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

// Check answer against all possible responses
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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isMobile = useIsMobile();
  
  const [exercise, setExercise] = useState<InteractiveVideoExercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [videoData, setVideoData] = useState<{ otp: string; playbackInfo: string } | null>(null);
  const [error, setError] = useState(false);
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Modal states
  const [speakModalOpen, setSpeakModalOpen] = useState(false);
  const [currentAnswerIndex, setCurrentAnswerIndex] = useState<number | undefined>(undefined);
  const [userResponse, setUserResponse] = useState('');
  const [result, setResult] = useState<number | undefined>(undefined);
  const [isRecording, setIsRecording] = useState(false);
  
  // Completion modal
  const [completionModalOpen, setCompletionModalOpen] = useState(false);
  
  const playerRef = useRef<any>(null);
  const timeCheckInterval = useRef<NodeJS.Timeout | null>(null);
  const completionInterval = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize exercise
  useEffect(() => {
    if (initialExercise) {
      setExercise(initialExercise);
      setVideoCompleted(initialExercise.completedByUser || false);
      setLoading(false);
    }
  }, [initialExercise]);

  // Get color based on result
  const getResultColor = (value: number | undefined) => {
    if (value === undefined) return '';
    return value >= 0.6 ? 'text-green-500' : 'text-red-500';
  };

  const getResultBgColor = (value: number | undefined) => {
    if (value === undefined) return 'border-border';
    return value >= 0.6 ? 'border-green-500' : 'border-red-500';
  };

  // Video time listener
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

  // Completion listener
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
          setCompletionModalOpen(true);
        }
      } catch (err) {
        console.error('Error checking completion:', err);
      }
    };

    completionInterval.current = setInterval(listener, 1000);
  };

  // Fetch video credentials
  const fetchVideoData = async () => {
    if (!exercise?.videoID) {
      setError(true);
      return;
    }

    // If videoID is a URL, open in new tab
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

      // Wait for iframe to load, then setup player
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

  // Calculate result from user response
  const getResult = (currentUserAnswer: string) => {
    if (!currentUserAnswer || currentUserAnswer.trim() === '' || currentAnswerIndex === undefined) return;

    const answer = exercise?.answers?.[currentAnswerIndex];
    if (!answer) return;

    const similarity = checkAnswerSimilarity(currentUserAnswer, answer);
    setResult(similarity);
  };

  // Speech recognition via MediaRecorder + Web Speech API
  const startRecording = async () => {
    try {
      // Use Web Speech API for recognition
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
        // Fallback to MediaRecorder
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        const mediaRecorder = new MediaRecorder(stream);
        
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          toast.info('Audio grabado. Escribe tu respuesta para verificar.');
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
        toast.info('Grabando...');
      }
    } catch (err) {
      console.error('Error accessing microphone:', err);
      toast.error('No se pudo acceder al micrófono');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
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
    
    // Resume video
    if (playerRef.current?.video) {
      playerRef.current.video.play();
    }
  };

  const markExerciseCompleted = async () => {
    if (progressSaved || !exercise) return;

    try {
      const unidad = Number(exercise.unidad);

      await postUserPosition({
        unidad: unidad || 0,
        position: await Calculate_index_exercise(exercise)
      });

      await postUserGrade(exercise._id, 1, String(unidad || 0));

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
      const nextIndex = Number(searchParams.get('exerciseIndex') || 0) + 1;
      navigate(`/ejercicio/${exercise?.unidad}?exerciseIndex=${nextIndex}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    setCompletionModalOpen(false);
    navigate(-1);
  };

  if (!exercise) {
    return <DashboardLoader />;
  }

  const videoUrl = videoData
    ? `https://player.vdocipher.com/v2/?otp=${videoData.otp}&playbackInfo=${videoData.playbackInfo}`
    : null;

  const currentAnswer = currentAnswerIndex !== undefined ? exercise.answers?.[currentAnswerIndex] : undefined;

  return (
    <div className="space-y-6">
      {/* Header Image */}
      <div className="relative w-full h-48 rounded-lg overflow-hidden">
        <img
          src="/ejercicio/grammar.png"
          alt="Video Interactivo"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <Play className="h-16 w-16 text-white" />
        </div>
      </div>

      {/* Title and Info */}
      <div className="space-y-2">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <h1 className="text-2xl font-bold text-foreground">{exercise.title || 'Video Interactivo'}</h1>
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
          <p className="text-muted-foreground mt-2">{exercise.description}</p>
        )}
      </div>

      {/* Video Player */}
      <Card>
        <CardContent className="p-4">
          {loading && !videoData && (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-destructive mb-4">No se pudo cargar el video.</p>
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
                style={{ height: isMobile ? '40vh' : '70vh' }}
              >
                <iframe
                  id="vdocipher-iframe-31"
                  src={videoUrl}
                  className="absolute inset-0 w-full h-full"
                  allow="encrypted-media; fullscreen"
                  allowFullScreen
                  title={exercise.title || 'Video'}
                  style={{ border: 0 }}
                />
              </div>

              {/* Progress info */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="text-sm text-muted-foreground">
                  {videoCompleted
                    ? '✓ Has completado este video'
                    : `Interacciones: ${exercise.answers?.length || 0} pausas`
                  }
                </p>

                {videoCompleted && (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">Completado</span>
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
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <span className="text-green-700 dark:text-green-300">
              Ya completaste este ejercicio anteriormente
            </span>
          </CardContent>
        </Card>
      )}

      {/* Navigation buttons */}
      {videoCompleted && (
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={handleGoBack}>
            Volver al Menú
          </Button>
          <Button onClick={handleNextExercise} disabled={isSubmitting}>
            {isSubmitting ? 'Cargando...' : 'Siguiente Ejercicio'}
          </Button>
        </div>
      )}

      {/* Speak Modal */}
      <Dialog open={speakModalOpen} onOpenChange={(open) => { if (!open) handleCloseModal(); }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">¡Es tu turno de hablar!</DialogTitle>
            <DialogDescription className="text-center">
              Graba tu respuesta o escríbela
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Input with recording */}
            <div className="flex flex-col items-center gap-4">
              <Input
                value={userResponse}
                onChange={(e) => {
                  setUserResponse(e.target.value);
                  getResult(e.target.value);
                }}
                placeholder="Escribe tu respuesta..."
                className={`w-full text-center border-2 ${getResultBgColor(result)}`}
              />

              <Button
                variant={isRecording ? 'destructive' : 'outline'}
                size="lg"
                onClick={isRecording ? stopRecording : startRecording}
                className="flex items-center gap-2"
              >
                {isRecording ? (
                  <>
                    <MicOff className="h-5 w-5" />
                    Detener
                  </>
                ) : (
                  <>
                    <Mic className="h-5 w-5" />
                    Grabar
                  </>
                )}
              </Button>

              {isRecording && (
                <span className="text-sm text-primary animate-pulse">
                  Escuchando...
                </span>
              )}
            </div>

            {/* Show result */}
            {result !== undefined && currentAnswer && (
              <div className="text-center space-y-2">
                <p className="text-muted-foreground text-sm">Respuesta esperada:</p>
                <p className="font-medium">{currentAnswer.answer}</p>
                
                <p className="text-muted-foreground text-sm mt-4">Coincidencia:</p>
                <p className={`text-6xl font-bold ${getResultColor(result)}`}>
                  {Math.round(result * 100)}%
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={handleCloseModal} className="w-full">
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Completion Modal */}
      <Dialog open={completionModalOpen} onOpenChange={setCompletionModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¡Ejercicio Completado!</DialogTitle>
            <DialogDescription>
              Has completado el video interactivo
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
            <p className="text-muted-foreground">
              {progressSaved
                ? 'Tu progreso ha sido guardado correctamente.'
                : 'Guardando tu progreso...'
              }
            </p>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setCompletionModalOpen(false)}
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
              {isSubmitting ? 'Cargando...' : 'Siguiente Ejercicio'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
