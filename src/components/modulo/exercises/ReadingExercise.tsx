import { useState } from 'react';
import { ReadingExercise } from '@/types/ejercicio';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { HelpCircle, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ReadingExerciseProps {
  exercise: ReadingExercise;
}

export const ReadingExerciseComponent = ({ exercise }: ReadingExerciseProps) => {
  const [answers, setAnswers] = useState<Record<string, boolean | null>>({});
  const [isVerified, setIsVerified] = useState(false);

  const handleAnswerChange = (questionId: string, value: boolean) => {
    if (!isVerified) {
      setAnswers(prev => ({
        ...prev,
        [questionId]: prev[questionId] === value ? null : value
      }));
    }
  };

  const handleVerify = () => {
    const unanswered = exercise.questions.filter(q => answers[q.id] === undefined || answers[q.id] === null);
    
    if (unanswered.length > 0) {
      toast.error(`Por favor responde todas las preguntas (${unanswered.length} sin responder)`);
      return;
    }

    setIsVerified(true);
    
    const correct = exercise.questions.filter(q => answers[q.id] === q.correctAnswer).length;
    const total = exercise.questions.length;
    
    toast.success(`Verificado: ${correct}/${total} respuestas correctas`);
  };

  const getQuestionStatus = (questionId: string, correctAnswer: boolean) => {
    if (!isVerified) return null;
    return answers[questionId] === correctAnswer;
  };

  return (
    <div className="space-y-6">
      {/* Content Image */}
      <div className="rounded-lg overflow-hidden border border-border">
        <img 
          src={exercise.contentImage}
          alt="Reading content"
          className="w-full h-auto object-contain"
          onError={(e) => {
            e.currentTarget.src = '/placeholder.svg';
          }}
        />
      </div>

      {/* Questions */}
      <div className="space-y-3">
        {exercise.questions.map((question) => {
          const isCorrect = getQuestionStatus(question.id, question.correctAnswer);
          const selected = answers[question.id];
          
          return (
            <div 
              key={question.id}
              className={`p-4 rounded-lg border-2 transition-colors ${
                isVerified
                  ? isCorrect
                    ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                    : 'border-red-500 bg-red-50 dark:bg-red-950/20'
                  : 'border-border bg-card'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-foreground font-medium">
                    {question.questionNumber}. {question.text}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  {/* True/False Checkboxes */}
                  <div className="flex items-center gap-6">
                    <button
                      onClick={() => handleAnswerChange(question.id, true)}
                      disabled={isVerified}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                        selected === true
                          ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-500'
                          : 'bg-card border-2 border-border hover:bg-accent'
                      } ${isVerified ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                    >
                      <Checkbox 
                        checked={selected === true} 
                        disabled={isVerified}
                        className="pointer-events-none"
                      />
                      <span className="font-medium">True</span>
                    </button>

                    <button
                      onClick={() => handleAnswerChange(question.id, false)}
                      disabled={isVerified}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                        selected === false
                          ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-500'
                          : 'bg-card border-2 border-border hover:bg-accent'
                      } ${isVerified ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                    >
                      <Checkbox 
                        checked={selected === false} 
                        disabled={isVerified}
                        className="pointer-events-none"
                      />
                      <span className="font-medium">False</span>
                    </button>
                  </div>

                  {/* Status Icons */}
                  <div className="w-10 flex justify-center">
                    {isVerified ? (
                      isCorrect ? (
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-600" />
                      )
                    ) : (
                      <HelpCircle className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Verify Button */}
      {!isVerified && (
        <div className="flex justify-center pt-4">
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
