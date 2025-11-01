import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SentenceAnalysisExercise, SentencePart } from '@/types/ejercicio';
import { ChevronRight, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SentenceAnalysisExerciseComponentProps {
  exercise: SentenceAnalysisExercise;
}

interface PartAnswer {
  syntacticGroup?: string;
  sentenceFunction?: string;
}

export const SentenceAnalysisExerciseComponent = ({ exercise }: SentenceAnalysisExerciseComponentProps) => {
  const [answers, setAnswers] = useState<Record<string, PartAnswer>>({});
  const [isVerified, setIsVerified] = useState(false);
  const [incorrectParts, setIncorrectParts] = useState<Set<string>>(new Set());

  const handleSyntacticGroupChange = (partId: string, value: string) => {
    if (isVerified) return;
    
    setAnswers(prev => ({
      ...prev,
      [partId]: {
        ...prev[partId],
        syntacticGroup: value
      }
    }));
  };

  const handleFunctionChange = (partId: string, value: string) => {
    if (isVerified) return;
    
    setAnswers(prev => ({
      ...prev,
      [partId]: {
        ...prev[partId],
        sentenceFunction: value
      }
    }));
  };

  const handleVerify = () => {
    const answeredParts = Object.keys(answers).filter(
      key => answers[key]?.syntacticGroup || answers[key]?.sentenceFunction
    );
    
    if (answeredParts.length === 0) {
      toast.error('Por favor selecciona al menos una opción');
      return;
    }

    const incorrect = new Set<string>();
    exercise.parts.forEach(part => {
      const userAnswer = answers[part.id];
      if (
        (userAnswer?.syntacticGroup && userAnswer.syntacticGroup !== part.syntacticGroup) ||
        (userAnswer?.sentenceFunction && userAnswer.sentenceFunction !== part.sentenceFunction)
      ) {
        incorrect.add(part.id);
      }
    });

    setIncorrectParts(incorrect);
    setIsVerified(true);

    if (incorrect.size === 0) {
      toast.success('¡Excelente! Todas las respuestas son correctas');
    } else {
      toast.error(`${incorrect.size} parte${incorrect.size > 1 ? 's' : ''} incorrecta${incorrect.size > 1 ? 's' : ''}`);
    }
  };

  const getPartHighlight = (part: SentencePart) => {
    if (!isVerified) {
      const hasAnswer = answers[part.id]?.syntacticGroup || answers[part.id]?.sentenceFunction;
      return hasAnswer ? 'bg-green-200 dark:bg-green-800' : '';
    }
    
    if (incorrectParts.has(part.id)) {
      return 'bg-red-200 dark:bg-red-800';
    }
    
    const hasAnswer = answers[part.id]?.syntacticGroup || answers[part.id]?.sentenceFunction;
    return hasAnswer ? 'bg-green-200 dark:bg-green-800' : '';
  };

  return (
    <div className="space-y-8">
      {/* Subtitle */}
      <h3 className="text-xl font-semibold text-heading">
        Sujeto Verbo y Complementos
      </h3>

      {/* Column Headers */}
      <div className="grid grid-cols-2 gap-4">
        <div className="border rounded-lg p-3 text-center">
          <span className="font-medium text-foreground">GRUPO SINTÁCTICO</span>
        </div>
        <div className="border rounded-lg p-3 text-center">
          <span className="font-medium text-foreground">FUNCIÓN en la ORACIÓN</span>
        </div>
      </div>

      {/* Sentence with parts */}
      <div className="space-y-4">
        {exercise.parts.map((part, index) => {
          const isIncorrect = incorrectParts.has(part.id);
          const hasAnswer = answers[part.id]?.syntacticGroup || answers[part.id]?.sentenceFunction;

          return (
            <div key={part.id} className="space-y-2">
              {/* Sentence with highlighted part */}
              <div className="text-lg leading-relaxed">
                {index === 0 && (
                  <>
                    <span className={`${getPartHighlight(part)} px-1 rounded`}>
                      {part.text}
                    </span>
                    {' '}
                  </>
                )}
                {index === 1 && (
                  <>
                    <span>{exercise.parts[0].text} </span>
                    <span className={`${getPartHighlight(part)} px-1 rounded`}>
                      {part.text}
                    </span>
                    {' '}
                  </>
                )}
                {index === 2 && (
                  <>
                    <span>{exercise.parts[0].text} {exercise.parts[1].text} </span>
                    <span className={`${getPartHighlight(part)} px-1 rounded`}>
                      {part.text}
                    </span>
                    {' '}
                  </>
                )}
                {index === 3 && (
                  <>
                    <span>{exercise.parts[0].text} {exercise.parts[1].text} {exercise.parts[2].text} </span>
                    <span className={`${getPartHighlight(part)} px-1 rounded`}>
                      {part.text}
                    </span>
                    {' '}
                  </>
                )}
                {index === 4 && (
                  <>
                    <span>{exercise.parts[0].text} {exercise.parts[1].text} {exercise.parts[2].text} {exercise.parts[3].text} </span>
                    <span className={`${getPartHighlight(part)} px-1 rounded`}>
                      {part.text}
                    </span>
                    {' '}
                  </>
                )}
                {index === 5 && (
                  <>
                    <span>{exercise.parts[0].text} {exercise.parts[1].text} {exercise.parts[2].text} {exercise.parts[3].text} {exercise.parts[4].text} </span>
                    <span className={`${getPartHighlight(part)} px-1 rounded`}>
                      {part.text}
                    </span>
                  </>
                )}
              </div>

              {/* Selection buttons */}
              <div className="grid grid-cols-2 gap-4">
                <Select
                  value={answers[part.id]?.syntacticGroup}
                  onValueChange={(value) => handleSyntacticGroupChange(part.id, value)}
                  disabled={isVerified}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar" />
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  </SelectTrigger>
                  <SelectContent>
                    {exercise.syntacticOptions.slice(1).map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={answers[part.id]?.sentenceFunction}
                  onValueChange={(value) => handleFunctionChange(part.id, value)}
                  disabled={isVerified}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar" />
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  </SelectTrigger>
                  <SelectContent>
                    {exercise.functionOptions.slice(1).map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Error message */}
              {isVerified && isIncorrect && (
                <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                  <XCircle className="h-4 w-4" />
                  <span>Mensaje</span>
                  <button className="ml-auto">
                    <XCircle className="h-5 w-5" />
                  </button>
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
