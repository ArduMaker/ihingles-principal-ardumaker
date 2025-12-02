import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getVideoCredentials } from '@/data/unidades';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Play, CheckCircle2, RefreshCw, Loader2 } from 'lucide-react';
import { postUserPosition, postUserGrade } from '@/lib/api';
import { toast } from 'sonner';
import { Calculate_index_exercise } from '@/hooks/calculate_index.ts';
import DashboardLoader from '@/components/dashboard/DashboardLoader';
import { useIsMobile } from '@/hooks/use-mobile';

interface VideoExercise {
  _id: string;
  skill?: string;
  type: number;
  number?: number;
  unidad?: number;
  title?: string;
  description?: string;
  videoID?: string;
  completedByUser?: boolean;
}

interface Eje18Props {
  exercise: VideoExercise | any;
}

declare global {
  interface Window {
    VdoPlayer?: any;
  }
}

export const Eje18 = ({ exercise: initialExercise }: Eje18Props) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [exercise, setExercise] = useState<VideoExercise | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [videoData, setVideoData] = useState<{ otp: string; playbackInfo: string } | null>(null);
  const [error, setError] = useState(false);
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Modal states
  const [completionModalOpen, setCompletionModalOpen] = useState(false);
  
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize exercise
  useEffect(() => {
    if (initialExercise) {
      setExercise(initialExercise);
      setVideoCompleted(initialExercise.completedByUser || false);
      setLoading(false);
    }
  }, [initialExercise]);

  // Listener for video progress
  const checkVideoProgress = async () => {
    try {
      if (!playerRef.current) {
        playerRef.current = window.VdoPlayer?.getInstance(
          document.getElementById('vdocipher-iframe')
        );
      }

      if (playerRef.current) {
        const totalPlayed = await playerRef.current.api?.getTotalPlayed?.();
        const duration = playerRef.current.video?.duration;

        if (totalPlayed && duration && totalPlayed >= duration * 0.75) {
          // Video completed (75%)
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          
          if (!videoCompleted) {
            setVideoCompleted(true);
            await markExerciseCompleted();
            setCompletionModalOpen(true);
          }
        }
      }
    } catch (err) {
      console.error('Error checking video progress:', err);
    }
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

      // Start monitoring progress if not completed
      if (!exercise.completedByUser && !videoCompleted) {
        intervalRef.current = setInterval(checkVideoProgress, 1000);
      }
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
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [exercise?.videoID]);

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
      toast.success('¡Video completado! Progreso guardado.');
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
      const nextNumber = (exercise?.number || 0) + 1;
      navigate(`/ejercicio/${nextNumber}`);
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

  return (
    <div className="space-y-6">
      {/* Header Image */}
      <div className="relative w-full h-48 rounded-lg overflow-hidden">
        <img
          src="/ejercicio/grammar.png"
          alt="Video"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <Play className="h-16 w-16 text-white" />
        </div>
      </div>

      {/* Title and Info */}
      <div className="space-y-2">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <h1 className="text-2xl font-bold text-foreground">{exercise.title || 'Video Instructivo'}</h1>
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
                  id="vdocipher-iframe"
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
                    : 'Mira al menos el 75% del video para completar este ejercicio'
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

      {/* Completion Modal */}
      <Dialog open={completionModalOpen} onOpenChange={setCompletionModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¡Video Completado!</DialogTitle>
            <DialogDescription>
              Has visto el video correctamente
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
