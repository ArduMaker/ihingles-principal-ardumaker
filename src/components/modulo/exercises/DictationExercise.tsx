import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DictationExercise } from '@/types/ejercicio';
import { Play, Pause, Volume2, Mic, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface DictationExerciseComponentProps {
  exercise: DictationExercise;
}

export const DictationExerciseComponent = ({ exercise }: DictationExerciseComponentProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isVerified, setIsVerified] = useState(false);
  const [incorrectAnswers, setIncorrectAnswers] = useState<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    audioRef.current.currentTime = newTime;
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    if (isVerified) return;
    
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleVerify = () => {
    const answeredQuestions = Object.keys(answers).filter(key => answers[key]?.trim());
    
    if (answeredQuestions.length === 0) {
      toast.error('Por favor escribe al menos una respuesta');
      return;
    }

    const incorrect = new Set<string>();
    exercise.questions.forEach(question => {
      const userAnswer = answers[question.id]?.trim().toLowerCase() || '';
      const correctAnswer = question.correctAnswer.toLowerCase();
      if (userAnswer !== correctAnswer) {
        incorrect.add(question.id);
      }
    });

    setIncorrectAnswers(incorrect);
    setIsVerified(true);

    if (incorrect.size === 0) {
      toast.success('¡Excelente! Todas las respuestas son correctas');
    } else {
      toast.error(`${incorrect.size} respuesta${incorrect.size > 1 ? 's' : ''} incorrecta${incorrect.size > 1 ? 's' : ''}`);
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="space-y-8">
      {/* Audio Player */}
      <div className="bg-card rounded-lg p-6 border">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden shrink-0">
            <img 
              src={exercise.audioImage}
              alt="Audio"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="w-12 h-12 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center transition-colors"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5 text-primary-foreground" />
                ) : (
                  <Play className="h-5 w-5 text-primary-foreground ml-0.5" />
                )}
              </button>

              <div className="flex-1">
                <div 
                  className="h-2 bg-muted rounded-full cursor-pointer"
                  onClick={handleProgressClick}
                >
                  <div 
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-muted-foreground">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>
              </div>

              <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                <Volume2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <audio ref={audioRef} src={exercise.audioUrl} />
      </div>

      {/* Questions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {exercise.questions.map((question) => {
          const isIncorrect = incorrectAnswers.has(question.id);
          const hasAnswer = answers[question.id]?.trim();

          return (
            <div key={question.id} className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-[#D4AF37] flex items-center justify-center shrink-0">
                  <span className="text-white font-bold">{question.questionNumber}</span>
                </div>
                <div className="relative flex-1">
                  <Input
                    placeholder="Escribe aquí"
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    disabled={isVerified}
                    className={`pr-10 ${
                      isVerified && isIncorrect
                        ? 'border-red-500 bg-red-50 dark:bg-red-950/20'
                        : isVerified && hasAnswer
                        ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                        : ''
                    }`}
                  />
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-muted rounded transition-colors">
                    <Mic className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {isVerified && isIncorrect && (
                <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 ml-12">
                  <XCircle className="h-4 w-4" />
                  <span>Mensaje</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Verify Button */}
      {!isVerified && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={handleVerify}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg font-semibold"
          >
            Verificar ✓
          </Button>
        </div>
      )}
    </div>
  );
};
