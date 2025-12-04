import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronLeft, HelpCircle, RotateCcw, Check } from 'lucide-react';
import DashboardLoader from '@/components/dashboard/DashboardLoader';
import { useExerciseGrade } from '@/hooks/useExerciseGrade';
import { GradeModal } from '@/components/ejercicio/GradeModal';
import { ExplanationModal } from '@/components/ejercicio/ExplanationModal';

const abcd = "abcdefghijklmnopqrstuvwxyz";

interface SentenceItem {
  sentence?: string;
  answer?: boolean;
  explanation?: string;
  description?: string;
  description2?: string;
}

interface Type11Exercise {
  _id?: string;
  type: number;
  number: number;
  unidad: number;
  title?: string;
  description?: string;
  audio?: string;
  sentences: SentenceItem[];
}

interface Eje11Props {
  exercise: Type11Exercise | any;
}

export const Eje11 = ({ exercise: initialExercise }: Eje11Props) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [exercise, setExercise] = useState<Type11Exercise | null>(null);
  const [loading, setLoading] = useState(true);

  const currentExerciseIndex = parseInt(searchParams.get('exerciseIndex') || '0');

  // State for tracking responses and results
  const [verified, setVerified] = useState(false);
  const [responses, setResponses] = useState<(boolean | string)[]>([]);
  const [userResponses, setUserResponses] = useState<(boolean | string)[]>([]);
  
  // Modal states
  const [explanationModalOpen, setExplanationModalOpen] = useState(false);
  const [currentExplanation, setCurrentExplanation] = useState('');

  // Hook modular de calificación
  const {
    grade,
    gradeModalOpen,
    saving,
    openGradeModal,
    setGradeModalOpen,
    handleClose,
    handleGoBack,
    handleNextExercise,
  } = useExerciseGrade({
    exerciseId: initialExercise?._id || initialExercise?.number?.toString() || '0',
    unidad: initialExercise?.unidad || Number(id) || 1,
    exerciseNumber: initialExercise?.number || currentExerciseIndex,
  });

  // Initialize exercise and states
  useEffect(() => {
    if (initialExercise) {
      setExercise(initialExercise);
      
      // Initialize states based on sentences (only questions, not descriptions)
      const initialStates: (boolean | string)[] = [];
      initialExercise.sentences
        ?.filter((sentence) => !sentence.description)
        .forEach(() => initialStates.push(''));
      
      setUserResponses(initialStates);
      setResponses(initialStates);
      setVerified(false);
      setLoading(false);
    }
  }, [initialExercise]);

  // Get the index for a sentence (excluding description items)
  const getIndex = (i: number): number => {
    if (!exercise) return i;
    let index = i;
    exercise.sentences.slice(0, i).forEach((sentence) => {
      if (sentence.description) index--;
    });
    return index;
  };

  // Check answer for type 11 (true/false comparison)
  const checkAnswerType11 = (userAnswer: boolean | string, correctAnswer: boolean): boolean => {
    if (userAnswer === '') return false;
    return userAnswer === correctAnswer;
  };

  const handleChange = (i: number, value: boolean | string) => {
    setUserResponses((old) => {
      const data = [...old];
      data[i] = value;
      return data;
    });
  };

  const handleVerify = () => {
    if (!exercise) return;

    // Get all answers from sentences (excluding descriptions)
    const answers: boolean[] = [];
    exercise.sentences
      .filter((sentence) => !sentence?.description)
      .forEach((sentence) => {
        if (sentence.answer !== undefined) {
          answers.push(sentence.answer);
        }
      });

    // Check each response
    const responsesCheck: boolean[] = [];
    answers.forEach((answer, iAns) => {
      responsesCheck.push(checkAnswerType11(userResponses[iAns], answer));
    });

    setResponses(responsesCheck);
    setVerified(true);

    // Calculate and show grade
    const total = responsesCheck.length;
    const successes = responsesCheck.filter((x) => x).length;
    const calculatedGrade = total > 0 ? successes / total : 0; // 0-1 normalizado
    
    openGradeModal(calculatedGrade);
  };

  const handleReset = () => {
    if (!exercise) return;
    
    const initialStates: (boolean | string)[] = [];
    exercise.sentences
      ?.filter((sentence) => !sentence.description)
      .forEach(() => initialStates.push(''));
    
    setUserResponses(initialStates);
    setVerified(false);
    setResponses(initialStates);
  };

  const showExplanation = (text: string) => {
    setCurrentExplanation(text);
    setExplanationModalOpen(true);
  };

  const getTextColor = (idx: number): string => {
    const index = getIndex(idx);
    if (responses[index] === '') return 'text-foreground';
    if (responses[index] === false) return 'text-red-600';
    if (responses[index] === true) return 'text-green-600';
    return 'text-foreground';
  };

  const getRowClassName = (idx: number): string => {
    const index = getIndex(idx);
    if (responses[index] === true) {
      return 'bg-green-50 dark:bg-green-950/20 border-l-4 border-green-500';
    }
    if (responses[index] === false) {
      return 'bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500';
    }
    return idx % 2 === 0 ? 'bg-muted/30' : 'bg-muted/10';
  };

  if (loading || !exercise) {
    return (
      <div className="min-h-screen">
        <DashboardLoader />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Header */}
      <div className="relative h-24 sm:h-32 bg-gradient-to-r from-yellow-800/40 to-yellow-700/40 rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-end px-4 sm:px-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-white">Grammar</h1>
        </div>
      </div>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
            <div className="space-y-2 flex-1">
              <CardTitle className="text-xl sm:text-2xl">{exercise.title}</CardTitle>
              {exercise.number && (
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Ejercicio: {exercise.number}
                </p>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => navigate(`/modulo/${id}`)}
              className="gap-2 w-full sm:w-auto"
              size="sm"
            >
              <ChevronLeft className="h-4 w-4" />
              Atrás
            </Button>
          </div>
          {exercise.description && (
            <p className="text-muted-foreground mt-4 text-sm sm:text-base">{exercise.description}</p>
          )}
          {exercise.audio && (
            <div className="mt-2 text-xs sm:text-sm text-muted-foreground">
              Audio: {exercise.audio}
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-3 p-4 sm:p-6 pt-0">
          {exercise.sentences?.map((item, idx) => {
            // If it's a description block (no sentence)
            if (item.description) {
              return (
                <div
                  key={`desc-${idx}`}
                  className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg space-y-2 border-l-4 border-blue-500"
                >
                  {item.description && (
                    <p className="text-xs sm:text-sm font-medium">{item.description}</p>
                  )}
                  {item.description2 && (
                    <p className="text-xs sm:text-sm text-muted-foreground">{item.description2}</p>
                  )}
                </div>
              );
            }

            // It's a question
            const index = getIndex(idx);
            const letter = abcd[index];

            return (
              <div
                key={`s-${idx}`}
                className={`p-3 sm:p-4 rounded-lg transition-colors ${getRowClassName(idx)}`}
              >
                <div className="flex items-start gap-2 sm:gap-3 flex-wrap">
                  {/* Letter label and Sentence */}
                  <p className={`flex-1 text-sm sm:text-base ${getTextColor(idx)}`}>
                    <span className="font-semibold">({letter})</span> {item.sentence}
                  </p>

                  {/* True/False options */}
                  <div className="flex items-center gap-3 sm:gap-4">
                    {/* True option */}
                    <div
                      className={`flex items-center gap-1.5 sm:gap-2 ${verified ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                      onClick={() => !verified && handleChange(index, userResponses[index] === true ? '' : true)}
                    >
                      <Checkbox
                        checked={userResponses[index] === true}
                        disabled={verified}
                        className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 h-4 w-4 sm:h-5 sm:w-5"
                      />
                      <span className="text-xs sm:text-sm font-medium">True</span>
                    </div>

                    {/* False option */}
                    <div
                      className={`flex items-center gap-1.5 sm:gap-2 ${verified ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                      onClick={() => !verified && handleChange(index, userResponses[index] === false ? '' : false)}
                    >
                      <Checkbox
                        checked={userResponses[index] === false}
                        disabled={verified}
                        className="data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600 h-4 w-4 sm:h-5 sm:w-5"
                      />
                      <span className="text-xs sm:text-sm font-medium">False</span>
                    </div>

                    {/* Help button - shown after verification if incorrect and has explanation */}
                    {verified && item.explanation && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-muted hover:bg-muted/80"
                        onClick={() => showExplanation(item.explanation!)}
                      >
                        <HelpCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4">
            <Button onClick={handleReset} variant="outline" className="gap-2 w-full sm:w-auto">
              <RotateCcw className="h-4 w-4" />
              Reintentar
            </Button>
            <Button onClick={handleVerify} className="gap-2 w-full sm:w-auto">
              <Check className="h-4 w-4" />
              Verificar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Grade Modal */}
      <GradeModal
        open={gradeModalOpen}
        onOpenChange={setGradeModalOpen}
        grade={grade}
        saving={saving}
        onClose={handleClose}
        onGoBack={handleGoBack}
        onNextExercise={handleNextExercise}
      />

      {/* Explanation Modal */}
      <ExplanationModal
        open={explanationModalOpen}
        onOpenChange={setExplanationModalOpen}
        explanation={currentExplanation}
      />
    </div>
  );
};
