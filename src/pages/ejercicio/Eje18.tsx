import { useEffect, useState, useRef } from 'react';
import { Exercise, getVideoCredentials } from '@/data/unidades';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, Play, CheckCircle } from 'lucide-react';
import { postUserPosition, postUserGrade } from '@/lib/api';
import { toast } from 'sonner';
import { Calculate_index_exercise } from '@/hooks/calculate_index.ts';

interface VideoExerciseProps {
  exercise: Exercise;
}

export const Eje18 = ({ exercise }: VideoExerciseProps) => {
  const [videoCredentials, setVideoCredentials] = useState<{
    otp: string;
    playbackInfo: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);
  const playerRef = useRef<any>(null);
  const progressCheckInterval = useRef<NodeJS.Timeout | null>(null);

  // Extraer videoID del ejercicio
  const videoId = (exercise as any).videoID;

  const loadVideoCredentials = async () => {
    if (!videoId) {
      setError('No se encontró videoID en el ejercicio');
      return;
    }

    // Si videoId es una URL, abrir en nueva pestaña
    if (videoId.startsWith('http://') || videoId.startsWith('https://')) {
      window.open(videoId, '_blank');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const credentials = await getVideoCredentials(videoId);

      // Verificar si es "fallo"
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
      if (progressCheckInterval.current) {
        clearInterval(progressCheckInterval.current);
      }
    };
  }, [videoId]);

  // Monitor video progress
  useEffect(() => {
    if (!videoCredentials || videoCompleted) return;

    const checkProgress = () => {
      if (typeof window !== 'undefined' && (window as any).VdoPlayer) {
        const player = (window as any).VdoPlayer.getInstance();
        if (player) {
          player.video.addEventListener('progress', async () => {
            const totalPlayed = player.video.totalPlayed || 0;
            const duration = player.video.duration || 0;

            if (duration > 0 && totalPlayed >= duration * 0.75 && !videoCompleted) {
              setVideoCompleted(true);
              await markExerciseCompleted();
            }
          });
        }
      }
    };

    // Wait for player to load
    const timer = setTimeout(checkProgress, 2000);

    return () => clearTimeout(timer);
  }, [videoCredentials, videoCompleted]);

  const markExerciseCompleted = async () => {
    if (progressSaved) return;

    try {
      const exerciseId = (exercise as any)._id;
      const unidad = Number((exercise as any).displayUnidad || (exercise as any).unidad);
      const position = (exercise as any).position;

      // Mark position
      if (position !== undefined && !isNaN(unidad)) {
        await postUserPosition({
          unidad,
          position: await Calculate_index_exercise(exercise)
        });
      }

      // Mark grade
      if (exerciseId && !isNaN(unidad)) {
        await postUserGrade(exerciseId, 1, String(unidad));
      }

      setProgressSaved(true);
      toast.success('¡Video completado! Progreso guardado.');
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5" />
          {exercise.title || 'Video Instructivo'}
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
              <div className="prose prose-sm max-w-none">
                <p className="text-muted-foreground">{(exercise as any).description}</p>
              </div>
            )}

            {videoCompleted && (
              <Alert className="border-green-500/50 bg-green-500/10">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-700 dark:text-green-300">
                  ✓ Video completado. {progressSaved ? 'Progreso guardado.' : 'Guardando progreso...'} Puedes continuar al siguiente ejercicio.
                </AlertDescription>
              </Alert>
            )}

            {/* Información de progreso */}
            {exercise.completedByUser && (
              <Alert>
                <AlertDescription>
                  ✓ Ya completaste este ejercicio anteriormente
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Script de VdoCipher cargado desde index.html */}
      </CardContent>
    </Card>
  );
};
