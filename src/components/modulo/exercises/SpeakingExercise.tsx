import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SpeakingExercise } from '@/types/ejercicio';
import { Mic } from 'lucide-react';
import { toast } from 'sonner';

interface SpeakingExerciseComponentProps {
  exercise: SpeakingExercise;
}

export const SpeakingExerciseComponent = ({ exercise }: SpeakingExerciseComponentProps) => {
  const [recordingPhraseId, setRecordingPhraseId] = useState<string | null>(null);
  const [completedPhrases, setCompletedPhrases] = useState<Set<string>>(new Set());
  const [isVerified, setIsVerified] = useState(false);

  const handleMicPress = (phraseId: string) => {
    if (isVerified) return;

    // Simulate recording
    setRecordingPhraseId(phraseId);
    
    // Simulate recording duration
    setTimeout(() => {
      setRecordingPhraseId(null);
      setCompletedPhrases(prev => new Set([...prev, phraseId]));
      toast.success('Grabación completada');
    }, 2000);
  };

  const handleVerify = () => {
    if (completedPhrases.size === 0) {
      toast.error('Por favor graba al menos una frase');
      return;
    }

    setIsVerified(true);
    toast.success(`¡Bien hecho! Has completado ${completedPhrases.size} de ${exercise.phrases.length} frases`);
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Phrases List */}
      <div className="space-y-3 md:space-y-4">
        {exercise.phrases.map((phrase) => {
          const isRecording = recordingPhraseId === phrase.id;
          const isCompleted = completedPhrases.has(phrase.id);

          return (
            <div key={phrase.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4">
              {/* Phrase Number */}
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#D4AF37] flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-sm md:text-base">{phrase.phraseNumber}</span>
              </div>

              {/* Phrase Text */}
              <div className="flex-1">
                <p className="text-sm md:text-base font-medium text-foreground">{phrase.text}</p>
              </div>

              {/* Action Button */}
              <Button
                onClick={() => handleMicPress(phrase.id)}
                disabled={isRecording || isVerified}
                className={`
                  w-full sm:min-w-[200px] md:min-w-[280px] h-10 md:h-12 rounded-lg font-medium text-xs md:text-sm
                  ${isRecording 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : isCompleted
                    ? 'bg-green-700 hover:bg-green-800 text-white'
                    : 'bg-[#3D5A3C] hover:bg-[#2D4A2C] text-[#D4AF37]'
                  }
                `}
              >
                {isRecording ? 'Grabando...' : 'Presiona el micrófono para hablar'}
              </Button>

              {/* Microphone Icon */}
              <button
                onClick={() => handleMicPress(phrase.id)}
                disabled={isRecording || isVerified}
                className={`
                  w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center shrink-0 transition-all
                  ${isRecording
                    ? 'bg-red-600 animate-pulse'
                    : isCompleted
                    ? 'bg-green-600'
                    : 'bg-[#D4AF37] hover:bg-[#C49F27]'
                  }
                  ${isVerified ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <Mic className={`h-5 w-5 md:h-6 md:w-6 ${isRecording || isCompleted ? 'text-white' : 'text-white'}`} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Verify Button */}
      {!isVerified && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={handleVerify}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 md:px-8 py-4 md:py-6 text-base md:text-lg font-semibold w-full md:w-auto"
          >
            Verificar ✓
          </Button>
        </div>
      )}
    </div>
  );
};
