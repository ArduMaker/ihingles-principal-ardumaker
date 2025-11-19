import { useEffect, useState } from 'react';
import { Exercise, getVideoCredentials } from '@/data/unidades';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, Play } from 'lucide-react';

interface VideoExerciseProps {
  exercise: Exercise;
}

export const VideoExercise = ({ exercise }: VideoExerciseProps) => {
  const [videoCredentials, setVideoCredentials] = useState<{
    otp: string;
    playbackInfo: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoCompleted, setVideoCompleted] = useState(false);

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
  }, [videoId]);

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
              <Alert>
                <AlertDescription>
                  ✓ Video completado. Puedes continuar al siguiente ejercicio.
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
