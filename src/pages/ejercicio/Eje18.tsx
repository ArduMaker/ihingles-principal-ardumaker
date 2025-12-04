import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { getVideoCredentials } from '@/data/unidades';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, CheckCircle2, RefreshCw, Loader2, ArrowRight } from 'lucide-react';
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
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [exercise, setExercise] = useState<VideoExercise | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [videoData, setVideoData] = useState<{ otp: string; playbackInfo: string } | null>(null);
  const [error, setError] = useState(false);
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentExerciseIndex = parseInt(searchParams.get('exerciseIndex') || '0');

  useEffect(() => {
    if (initialExercise) {
      setExercise(initialExercise);
      setVideoCompleted(initialExercise.completedByUser || false);
      setLoading(false);
    }
  }, [initialExercise]);

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
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          
          if (!videoCompleted) {
            setVideoCompleted(true);
            await markExerciseCompleted();
          }
        }
      }
    } catch (err) {
      console.error('Error checking video progress:', err);
    }
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
      const unidad = Number(exercise.unidad) || Number(id) || 0;

      await postUserPosition({
        unidad: unidad,
        position: await Calculate_index_exercise(exercise)
      });

      await postUserGrade(exercise._id, 1, String(unidad));

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
      // Para videos, si el usuario quiere saltar, guardamos progreso y avanzamos
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

  return (
    <div className="space-y-4 md:space-y-6">

      {/* Header Image */}
      <div className="relative w-full h-32 sm:h-40 md:h-48 rounded-lg overflow-hidden">
        <img
          src="/ejercicio/grammar.png"
          alt="Video"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <Play className="h-12 w-12 sm:h-16 sm:w-16 text-white" />
        </div>
      </div>

      
      {/* Botón de siguiente ejercicio en la parte superior para videos */}
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
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">{exercise.title || 'Video Instructivo'}</h1>
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
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {videoCompleted 
                    ? '✓ Has completado este video'
                    : 'Mira al menos el 75% del video para completar este ejercicio'
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
    </div>
  );
};
