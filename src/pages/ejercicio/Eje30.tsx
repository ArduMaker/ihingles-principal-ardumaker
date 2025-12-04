import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, CheckCircle2, Volume2, ArrowRight, Loader2 } from 'lucide-react';
import { postUserPosition, postUserGrade } from '@/lib/api';
import { toast } from 'sonner';
import { Calculate_index_exercise } from '@/hooks/calculate_index.ts';
import DashboardLoader from '@/components/dashboard/DashboardLoader';
import { useIsMobile } from '@/hooks/use-mobile';

interface ReadingExercise {
  _id: string;
  skill?: string;
  type: number;
  number?: number;
  unidad?: number;
  title?: string;
  description?: string;
  description2?: string;
  description3?: string;
  description4?: string;
  description5?: string;
  audio?: string;
  completedByUser?: boolean;
}

interface Eje30Props {
  exercise: ReadingExercise | any;
}

const parseFormattedText = (text: string): React.ReactNode[] => {
  if (!text) return [];

  let currentText = text.replace(/\.5/g, '<br/>');

  const processPatterns = (input: string): React.ReactNode[] => {
    const nodes: React.ReactNode[] = [];
    let remaining = input;
    let idx = 0;

    while (remaining.length > 0) {
      const boldMatch = remaining.match(/^&([^&]+)&/);
      if (boldMatch) {
        nodes.push(<strong key={`bold-${idx}`} className="font-bold text-foreground">{boldMatch[1]}</strong>);
        remaining = remaining.slice(boldMatch[0].length);
        idx++;
        continue;
      }

      const highlightMatch = remaining.match(/^~([^~]+)~/);
      if (highlightMatch) {
        nodes.push(<span key={`highlight-${idx}`} className="text-primary font-semibold">{highlightMatch[1]}</span>);
        remaining = remaining.slice(highlightMatch[0].length);
        idx++;
        continue;
      }

      const underlineMatch = remaining.match(/^_u_([^_]+)_u_/);
      if (underlineMatch) {
        nodes.push(<span key={`underline-${idx}`} className="underline decoration-primary">{underlineMatch[1]}</span>);
        remaining = remaining.slice(underlineMatch[0].length);
        idx++;
        continue;
      }

      const colorMatch = remaining.match(/^color::(\w+)([^c]+)color::\1/);
      if (colorMatch) {
        const colorName = colorMatch[1];
        const colorText = colorMatch[2];
        const colorClass = getColorClass(colorName);
        nodes.push(<span key={`color-${idx}`} className={colorClass}>{colorText}</span>);
        remaining = remaining.slice(colorMatch[0].length);
        idx++;
        continue;
      }

      const italicMatch = remaining.match(/^letra::cursiva([^l]+)letra::cursiva/);
      if (italicMatch) {
        nodes.push(<em key={`italic-${idx}`} className="italic">{italicMatch[1]}</em>);
        remaining = remaining.slice(italicMatch[0].length);
        idx++;
        continue;
      }

      if (remaining.startsWith('<br/>')) {
        nodes.push(<br key={`br-${idx}`} />);
        remaining = remaining.slice(5);
        idx++;
        continue;
      }

      const nextSpecial = remaining.search(/(&|~|_u_|color::|letra::|<br\/>)/);
      if (nextSpecial === -1) {
        nodes.push(<span key={`text-${idx}`}>{remaining}</span>);
        break;
      } else if (nextSpecial > 0) {
        nodes.push(<span key={`text-${idx}`}>{remaining.slice(0, nextSpecial)}</span>);
        remaining = remaining.slice(nextSpecial);
        idx++;
      } else {
        nodes.push(<span key={`char-${idx}`}>{remaining[0]}</span>);
        remaining = remaining.slice(1);
        idx++;
      }
    }

    return nodes;
  };

  return processPatterns(currentText);
};

const getColorClass = (colorName: string): string => {
  const colors: Record<string, string> = {
    verde: 'text-green-600 dark:text-green-400',
    rojo: 'text-red-600 dark:text-red-400',
    azul: 'text-blue-600 dark:text-blue-400',
    amarillo: 'text-yellow-600 dark:text-yellow-400',
    naranja: 'text-orange-600 dark:text-orange-400',
    morado: 'text-purple-600 dark:text-purple-400',
    rosa: 'text-pink-600 dark:text-pink-400',
  };
  return colors[colorName.toLowerCase()] || 'text-primary';
};

export const Eje30 = ({ exercise: initialExercise }: Eje30Props) => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const [exercise, setExercise] = useState<ReadingExercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const currentExerciseIndex = parseInt(searchParams.get('exerciseIndex') || '0');

  useEffect(() => {
    if (initialExercise) {
      setExercise(initialExercise);
      setIsCompleted(initialExercise.completedByUser || false);
      setLoading(false);
    }
  }, [initialExercise]);

  useEffect(() => {
    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
      }
    };
  }, [audioElement]);

  const handlePlayAudio = () => {
    if (!exercise?.audio) return;

    if (audioElement) {
      if (isPlaying) {
        audioElement.pause();
        setIsPlaying(false);
      } else {
        audioElement.play();
        setIsPlaying(true);
      }
    } else {
      const audio = new Audio(`https://languagehunters.s3.amazonaws.com/audios/${exercise.audio}.mp3`);
      audio.onended = () => setIsPlaying(false);
      audio.play();
      setIsPlaying(true);
      setAudioElement(audio);
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
      toast.success('¡Lectura completada! Progreso guardado.');
    } catch (err) {
      console.error('Error saving progress:', err);
      toast.error('Error al guardar el progreso');
    }
  };

  const handleMarkAsRead = async () => {
    setIsSubmitting(true);
    try {
      await markExerciseCompleted();
      setIsCompleted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextExercise = async () => {
    setIsSubmitting(true);
    try {
      if (!progressSaved) {
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

  if (loading || !exercise) {
    return <DashboardLoader />;
  }

  const descriptions = [
    exercise.description,
    exercise.description2,
    exercise.description3,
    exercise.description4,
    exercise.description5,
  ].filter(Boolean);

  return (
    <div className="space-y-4 md:space-y-6">

      {/* Header Image */}
      <div className="relative w-full h-32 sm:h-40 md:h-48 rounded-lg overflow-hidden">
        <img
          src="/ejercicio/grammar.png"
          alt="Lectura"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 text-white" />
        </div>
      </div>

      {/* Title and Info */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">{exercise.title || 'Lectura'}</h1>
          <span className="text-sm text-muted-foreground">
            Ejercicio: {exercise.number || 0}
          </span>
        </div>

        {exercise.skill && (
          <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm capitalize">
            {exercise.skill}
          </span>
        )}

        {/* Audio Player */}
        {exercise.audio && (
          <Button
            variant="outline"
            size="sm"
            onClick={handlePlayAudio}
            className="flex items-center gap-2"
          >
            <Volume2 className={`h-4 w-4 ${isPlaying ? 'text-primary animate-pulse' : ''}`} />
            {isPlaying ? 'Pausar Audio' : 'Escuchar Audio'}
          </Button>
        )}
      </div>

      {/* Reading Content */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="prose prose-sm sm:prose-lg dark:prose-invert max-w-none space-y-3 sm:space-y-4">
            {descriptions.map((desc, index) => (
              <p key={index} className="text-foreground leading-relaxed text-sm sm:text-base md:text-lg">
                {parseFormattedText(desc || '')}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Already completed notice */}
      {(exercise.completedByUser || isCompleted) && (
        <Card className="border-green-500/50 bg-green-500/10">
          <CardContent className="p-3 sm:p-4 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
            <span className="text-green-700 dark:text-green-300 text-sm sm:text-base">
              {exercise.completedByUser ? 'Ya completaste esta lectura anteriormente' : '¡Lectura completada!'}
            </span>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
        <Button variant="outline" onClick={handleGoBack} className="w-full sm:w-auto">
          Volver al Menú
        </Button>
        {!isCompleted && !exercise.completedByUser ? (
          <Button onClick={handleMarkAsRead} disabled={isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              'Marcar como Leído'
            )}
          </Button>
        ) : (
          <Button onClick={handleNextExercise} disabled={isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Cargando...
              </>
            ) : (
              'Siguiente Ejercicio'
            )}
          </Button>
        )}
      </div>
    </div>
  );
};
