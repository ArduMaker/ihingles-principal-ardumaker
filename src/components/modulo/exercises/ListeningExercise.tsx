import { useState, useRef, useEffect } from 'react';
import { ListeningExercise } from '@/types/ejercicio';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, Heart, FileText, ChevronRight, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ListeningExerciseComponentProps {
  exercise: ListeningExercise;
}

export const ListeningExerciseComponent = ({ exercise }: ListeningExerciseComponentProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showFeedback, setShowFeedback] = useState<Record<string, boolean>>({});
  const [isVerified, setIsVerified] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const bounds = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - bounds.left) / bounds.width;
    audio.currentTime = percent * duration;
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (isVerified) return;
    
    const question = exercise.questions.find(q => q.id === questionId);
    if (!question) return;

    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
    setShowFeedback(prev => ({ ...prev, [questionId]: true }));
  };

  const isCorrect = (questionId: string) => {
    const question = exercise.questions.find(q => q.id === questionId);
    if (!question) return false;
    return selectedAnswers[questionId] === question.correctOptionIndex;
  };

  const handleVerify = () => {
    const answeredCount = Object.keys(selectedAnswers).length;
    
    if (answeredCount === 0) {
      toast.error('Por favor responde al menos una pregunta');
      return;
    }

    setIsVerified(true);
    
    const correctCount = exercise.questions.filter(q => 
      selectedAnswers[q.id] === q.correctOptionIndex
    ).length;
    
    toast.success(`Verificado: ${correctCount}/${exercise.questions.length} respuestas correctas`);
  };

  return (
    <div className="space-y-8">
      {/* Consejo */}
      <div className="bg-muted/50 rounded-lg p-6 border border-border">
        <h3 className="font-bold text-lg mb-2">CONSEJO:</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {exercise.adviceText}
        </p>
      </div>

      {/* Audio Player */}
      <div className="bg-card rounded-lg p-6 border border-border space-y-4">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="shrink-0">
            <img
              src={exercise.audioImage}
              alt="Speaker"
              className="w-16 h-16 rounded-full object-cover"
            />
          </div>

          {/* Play Button */}
          <Button
            size="icon"
            variant="ghost"
            onClick={togglePlay}
            className="shrink-0"
          >
            {isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6" />
            )}
          </Button>

          {/* Progress Bar */}
          <div className="flex-1 space-y-1">
            <div
              className="h-2 bg-muted rounded-full cursor-pointer relative overflow-hidden"
              onClick={handleProgressClick}
            >
              <div
                className="absolute left-0 top-0 h-full bg-primary rounded-full transition-all"
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          {/* Volume */}
          <Button size="icon" variant="ghost" className="shrink-0">
            <Volume2 className="h-5 w-5" />
          </Button>

          {/* More Options */}
          <Button size="icon" variant="ghost" className="shrink-0">
            <span className="text-xl">⋮</span>
          </Button>

          {/* Attached File */}
          {exercise.attachedFile && (
            <div className="flex items-center gap-2 px-3 py-2 bg-destructive/10 rounded-lg shrink-0">
              <FileText className="h-4 w-4 text-destructive" />
              <span className="text-xs max-w-[150px] truncate">
                {exercise.attachedFile.name}
              </span>
            </div>
          )}

          {/* Favorite */}
          <Button size="icon" variant="ghost" className="shrink-0">
            <Heart className="h-5 w-5 text-destructive" />
          </Button>
        </div>

        <audio ref={audioRef} src={exercise.audioUrl} preload="metadata" />
      </div>

      {/* Pronunciation Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold">{exercise.pronunciationTitle}</h3>
        
        <p className="text-muted-foreground">
          Indica qué opción es la que está bien pronunciada y cual no
        </p>

        {/* Questions */}
        <div className="space-y-3">
          {exercise.questions.map((question) => {
            const answered = showFeedback[question.id];
            const correct = answered && isCorrect(question.id);

            return (
              <div
                key={question.id}
                className={cn(
                  "bg-muted/30 rounded-lg p-4 border transition-colors",
                  answered && !correct && "border-destructive bg-destructive/5",
                  answered && correct && "border-primary bg-primary/5"
                )}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <span className="font-medium">
                      {question.questionNumber}) {question.text}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {answered && !correct && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    )}
                    
                    <Button
                      variant={answered && !correct ? "destructive" : "outline"}
                      size="sm"
                      disabled={isVerified}
                      className={cn(
                        "gap-2",
                        answered && correct && "border-primary text-primary"
                      )}
                      onClick={() => {
                        // Show options dialog or select random for demo
                        const randomIndex = Math.floor(Math.random() * question.options.length);
                        handleSelectOption(question.id, randomIndex);
                      }}
                    >
                      Seleccionar
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {answered && !correct && (
                  <div className="mt-3 flex items-start gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>Mensaje</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Verify Button */}
      {!isVerified && (
        <div className="flex justify-center pt-6">
          <Button 
            onClick={handleVerify}
            className="bg-[#2C5F3C] hover:bg-[#234A2F] text-white px-8 py-6 text-lg font-semibold"
            size="lg"
          >
            Verificar ✓
          </Button>
        </div>
      )}
    </div>
  );
};
