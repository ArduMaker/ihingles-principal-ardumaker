import { useEffect, useState, useRef } from 'react';
import { Exercise, getVideoCredentials } from '@/data/unidades';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Play, CheckCircle, Mic, MicOff } from 'lucide-react';
import { postUserPosition, postUserGrade } from '@/lib/api';
import { toast } from 'sonner';

interface InteractiveVideoExerciseProps {
  exercise: Exercise;
}

interface Answer {
  timeInSeconds: number;
  answer: string;
}

interface UserAnswer {
  timeInSeconds: number;
  userResponse: string;
  timestamp: Date;
}

export const Eje31 = ({ exercise }: InteractiveVideoExerciseProps) => {
  const [videoCredentials, setVideoCredentials] = useState<{
    otp: string;
    playbackInfo: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);
  
  // Dialog & answer states
  const [showDialog, setShowDialog] = useState(false);
  const [currentAnswerIndex, setCurrentAnswerIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [currentResponse, setCurrentResponse] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  
  const playerRef = useRef<any>(null);
  const timeCheckInterval = useRef<NodeJS.Timeout | null>(null);
  const processedTimestamps = useRef<Set<number>>(new Set());
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const videoId = (exercise as any).videoID;
  const answers: Answer[] = (exercise as any).answers || [];

  const loadVideoCredentials = async () => {
    if (!videoId) {
      setError('No se encontró videoID en el ejercicio');
      return;
    }

    if (videoId.startsWith('http://') || videoId.startsWith('https://')) {
      window.open(videoId, '_blank');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const credentials = await getVideoCredentials(videoId);
      
      if (credentials === 'fallo' || typeof credentials === 'string') {
        setError('No se pudieron obtener las credenciales del video');
        return;
      }

      setVideoCredentials(credentials);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el video');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVideoCredentials();
    
    return () => {
      if (timeCheckInterval.current) {
        clearInterval(timeCheckInterval.current);
      }
      stopRecording();
    };
  }, [videoId]);

  // Monitor video time for pauses
  useEffect(() => {
    if (!videoCredentials || videoCompleted || answers.length === 0) return;

    const checkVideoTime = () => {
      if (typeof window !== 'undefined' && (window as any).VdoPlayer) {
        const player = (window as any).VdoPlayer.getInstance();
        if (player && player.video) {
          playerRef.current = player;
          
          const currentTime = player.video.currentTime || 0;
          
          // Check if we need to pause for an answer
          answers.forEach((answer, index) => {
            const timeDiff = Math.abs(currentTime - answer.timeInSeconds);
            
            if (
              timeDiff < 0.5 && 
              !processedTimestamps.current.has(answer.timeInSeconds) &&
              !showDialog
            ) {
              // Pause video and show dialog
              player.video.pause();
              processedTimestamps.current.add(answer.timeInSeconds);
              setCurrentAnswerIndex(index);
              setShowDialog(true);
            }
          });

          // Check if all answers processed and video mostly watched
          const totalPlayed = player.video.totalPlayed || 0;
          const duration = player.video.duration || 0;
          
          if (
            duration > 0 && 
            totalPlayed >= duration * 0.75 &&
            processedTimestamps.current.size === answers.length &&
            !videoCompleted
          ) {
            setVideoCompleted(true);
            markExerciseCompleted();
          }
        }
      }
    };

    timeCheckInterval.current = setInterval(checkVideoTime, 500);
    
    return () => {
      if (timeCheckInterval.current) {
        clearInterval(timeCheckInterval.current);
      }
    };
  }, [videoCredentials, videoCompleted, answers, showDialog]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Convert audio to text (placeholder - would need speech-to-text service)
        // For now, just indicate that audio was recorded
        const transcription = '[Audio grabado - transcripción pendiente]';
        setCurrentResponse(transcription);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.info('Grabando audio...');
    } catch (err) {
      console.error('Error accessing microphone:', err);
      toast.error('No se pudo acceder al micrófono');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSubmitAnswer = () => {
    if (!currentResponse.trim()) {
      toast.error('Por favor proporciona una respuesta');
      return;
    }

    const userAnswer: UserAnswer = {
      timeInSeconds: answers[currentAnswerIndex].timeInSeconds,
      userResponse: currentResponse,
      timestamp: new Date(),
    };

    setUserAnswers([...userAnswers, userAnswer]);
    setCurrentResponse('');
    setShowDialog(false);

    // Resume video
    if (playerRef.current) {
      playerRef.current.video.play();
    }

    toast.success('Respuesta guardada');
  };

  const markExerciseCompleted = async () => {
    if (progressSaved) return;

    try {
      const exerciseId = (exercise as any)._id;
      const unidad = String((exercise as any).displayUnidad || (exercise as any).unidad);
      const position = (exercise as any).position;

      if (position !== undefined && unidad) {
        await postUserPosition({ unidad, position });
      }

      if (exerciseId && unidad) {
        await postUserGrade(exerciseId, 1, unidad);
      }

      setProgressSaved(true);
      toast.success('¡Ejercicio completado! Progreso guardado.');
    } catch (err) {
      console.error('Error saving progress:', err);
      toast.error('Error al guardar el progreso. Por favor intenta de nuevo.');
    }
  };

  const handleRetry = () => {
    loadVideoCredentials();
  };

  const videoUrl = videoCredentials
    ? `https://player.vdocipher.com/v2/?otp=${videoCredentials.otp}&playbackInfo=${videoCredentials.playbackInfo}`
    : null;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            {exercise.title || 'Video Interactivo'}
          </CardTitle>
          {exercise.skill && (
            <p className="text-sm text-muted-foreground capitalize">{exercise.skill}</p>
          )}
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription className="flex items-center justify-between">
                <span>{error}</span>
                <Button variant="outline" size="sm" onClick={handleRetry}>
                  Reintentar
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {videoUrl && (
            <div className="space-y-4">
              <div className="relative aspect-video w-full bg-black rounded-lg overflow-hidden">
                <iframe
                  src={videoUrl}
                  className="absolute inset-0 w-full h-full"
                  allow="encrypted-media; fullscreen"
                  allowFullScreen
                  title={exercise.title || 'Video'}
                />
              </div>

              {(exercise as any).description && (
                <Alert>
                  <AlertDescription>{(exercise as any).description}</AlertDescription>
                </Alert>
              )}

              {/* Progress info */}
              <div className="text-sm text-muted-foreground">
                <p>Respuestas completadas: {userAnswers.length} / {answers.length}</p>
              </div>

              {videoCompleted && (
                <Alert className="border-green-500/50 bg-green-500/10">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertDescription className="text-green-700 dark:text-green-300">
                    ✓ Ejercicio completado. {progressSaved ? 'Progreso guardado.' : 'Guardando progreso...'}
                  </AlertDescription>
                </Alert>
              )}

              {exercise.completedByUser && (
                <Alert>
                  <AlertDescription>
                    ✓ Ya completaste este ejercicio anteriormente
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Answer Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Responde en voz alta o por escrito</DialogTitle>
            <DialogDescription>
              Pausa en {answers[currentAnswerIndex]?.timeInSeconds}s. 
              Respuesta esperada: "{answers[currentAnswerIndex]?.answer}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Textarea
              placeholder="Escribe tu respuesta aquí..."
              value={currentResponse}
              onChange={(e) => setCurrentResponse(e.target.value)}
              rows={4}
              className="resize-none"
            />
            
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={isRecording ? "destructive" : "outline"}
                size="sm"
                onClick={isRecording ? stopRecording : startRecording}
                className="flex items-center gap-2"
              >
                {isRecording ? (
                  <>
                    <MicOff className="h-4 w-4" />
                    Detener grabación
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4" />
                    Grabar respuesta
                  </>
                )}
              </Button>
              {isRecording && (
                <span className="text-sm text-muted-foreground animate-pulse">
                  Grabando...
                </span>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Saltar
            </Button>
            <Button onClick={handleSubmitAnswer} disabled={!currentResponse.trim()}>
              Guardar y Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
