import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { BookOpen, CheckCircle2, Volume2 } from 'lucide-react';
import { postUserPosition, postUserGrade } from '@/lib/api';
import { toast } from 'sonner';
import { Calculate_index_exercise } from '@/hooks/calculate_index.ts';
import DashboardLoader from '@/components/dashboard/DashboardLoader';

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

// Parse formatted text with special markers
const parseFormattedText = (text: string): React.ReactNode[] => {
  if (!text) return [];

  const result: React.ReactNode[] = [];
  let currentText = text;
  let keyIndex = 0;

  // Replace .5 with line breaks
  currentText = currentText.replace(/\.5/g, '<br/>');

  // Process all formatting patterns
  const processPatterns = (input: string): React.ReactNode[] => {
    const nodes: React.ReactNode[] = [];
    let remaining = input;
    let idx = 0;

    while (remaining.length > 0) {
      // Check for bold &texto&
      const boldMatch = remaining.match(/^&([^&]+)&/);
      if (boldMatch) {
        nodes.push(<strong key={`bold-${idx}`} className="font-bold text-foreground">{boldMatch[1]}</strong>);
        remaining = remaining.slice(boldMatch[0].length);
        idx++;
        continue;
      }

      // Check for highlight ~texto~
      const highlightMatch = remaining.match(/^~([^~]+)~/);
      if (highlightMatch) {
        nodes.push(<span key={`highlight-${idx}`} className="text-primary font-semibold">{highlightMatch[1]}</span>);
        remaining = remaining.slice(highlightMatch[0].length);
        idx++;
        continue;
      }

      // Check for underline _u_texto_u_
      const underlineMatch = remaining.match(/^_u_([^_]+)_u_/);
      if (underlineMatch) {
        nodes.push(<span key={`underline-${idx}`} className="underline decoration-primary">{underlineMatch[1]}</span>);
        remaining = remaining.slice(underlineMatch[0].length);
        idx++;
        continue;
      }

      // Check for color::verdetextocolor::verde
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

      // Check for letra::cursivatextoletra::cursiva
      const italicMatch = remaining.match(/^letra::cursiva([^l]+)letra::cursiva/);
      if (italicMatch) {
        nodes.push(<em key={`italic-${idx}`} className="italic">{italicMatch[1]}</em>);
        remaining = remaining.slice(italicMatch[0].length);
        idx++;
        continue;
      }

      // Check for line break
      if (remaining.startsWith('<br/>')) {
        nodes.push(<br key={`br-${idx}`} />);
        remaining = remaining.slice(5);
        idx++;
        continue;
      }

      // Find next special character or add regular text
      const nextSpecial = remaining.search(/(&|~|_u_|color::|letra::|<br\/>)/);
      if (nextSpecial === -1) {
        nodes.push(<span key={`text-${idx}`}>{remaining}</span>);
        break;
      } else if (nextSpecial > 0) {
        nodes.push(<span key={`text-${idx}`}>{remaining.slice(0, nextSpecial)}</span>);
        remaining = remaining.slice(nextSpecial);
        idx++;
      } else {
        // If pattern doesn't match, add single character and continue
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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [exercise, setExercise] = useState<ReadingExercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completionModalOpen, setCompletionModalOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  // Initialize exercise
  useEffect(() => {
    if (initialExercise) {
      setExercise(initialExercise);
      setIsCompleted(initialExercise.completedByUser || false);
      setLoading(false);
    }
  }, [initialExercise]);

  // Cleanup audio on unmount
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
      const unidad = Number(exercise.unidad);

      await postUserPosition({
        unidad: unidad || 0,
        position: await Calculate_index_exercise(exercise)
      });

      await postUserGrade(exercise._id, 1, String(unidad || 0));

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
      setCompletionModalOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextExercise = async () => {
    setIsSubmitting(true);
    try {
      if (!progressSaved && isCompleted) {
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

  if (loading || !exercise) {
    return <DashboardLoader />;
  }

  // Collect all descriptions
  const descriptions = [
    exercise.description,
    exercise.description2,
    exercise.description3,
    exercise.description4,
    exercise.description5,
  ].filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Header Image */}
      <div className="relative w-full h-48 rounded-lg overflow-hidden">
        <img
          src="/ejercicio/grammar.png"
          alt="Lectura"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <BookOpen className="h-16 w-16 text-white" />
        </div>
      </div>

      {/* Title and Info */}
      <div className="space-y-2">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <h1 className="text-2xl font-bold text-foreground">{exercise.title || 'Lectura'}</h1>
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
        <CardContent className="p-6">
          <div className="prose prose-lg dark:prose-invert max-w-none space-y-4">
            {descriptions.map((desc, index) => (
              <p key={index} className="text-foreground leading-relaxed text-base md:text-lg">
                {parseFormattedText(desc || '')}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Already completed notice */}
      {exercise.completedByUser && (
        <Card className="border-green-500/50 bg-green-500/10">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <span className="text-green-700 dark:text-green-300">
              Ya completaste esta lectura anteriormente
            </span>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={handleGoBack}>
          Volver al Menú
        </Button>
        {!isCompleted && !exercise.completedByUser ? (
          <Button onClick={handleMarkAsRead} disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Marcar como Leído'}
          </Button>
        ) : (
          <Button onClick={handleNextExercise} disabled={isSubmitting}>
            {isSubmitting ? 'Cargando...' : 'Siguiente Ejercicio'}
          </Button>
        )}
      </div>

      {/* Completion Modal */}
      <Dialog open={completionModalOpen} onOpenChange={setCompletionModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¡Lectura Completada!</DialogTitle>
            <DialogDescription>
              Has completado esta lectura correctamente
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
