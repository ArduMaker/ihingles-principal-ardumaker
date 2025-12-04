import { useState, useEffect, Fragment } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { normalizeAnswer } from '@/lib/exerciseUtils';
import { CheckSquare, XSquare, HelpCircle, MessageCircle } from 'lucide-react';
import DashboardLoader from '@/components/dashboard/DashboardLoader';
import { useExerciseGrade } from '@/hooks/useExerciseGrade';
import { GradeModal } from '@/components/ejercicio/GradeModal';
import { ExplanationModal } from '@/components/ejercicio/ExplanationModal';

interface Answer {
  value: string;
  shown?: boolean;
  color?: string;
  black?: string;
  parentesis?: boolean;
  asterisco?: boolean;
  answer2?: string;
  answer3?: string;
  answer4?: string;
  answer5?: string;
  answer6?: string;
  answer7?: string;
  answer8?: string;
  answer9?: string;
  answer10?: string;
  answer11?: string;
  answer12?: string;
  explanation?: string;
}

interface Formula {
  name: string;
  textoAuxiliar?: string;
  options: string[];
  answers: Answer[];
}

interface ExerciseType3 {
  _id: string;
  skill: string;
  type: number;
  number: number;
  unidad: number;
  title: string;
  description: string;
  formulas: Formula[];
  completedByUser?: boolean;
  position?: number;
}

interface Eje3Props {
  exercise: any;
}

export default function Eje3({ exercise: initialExercise }: Eje3Props) {
  const [exercise, setExercise] = useState<ExerciseType3 | null>(initialExercise);
  const [responses, setResponses] = useState<{ [key: number]: string }>({});
  const [selectState, setSelectState] = useState<(boolean | null)[]>([]);
  const [verified, setVerified] = useState(false);
  const [explanationModalOpen, setExplanationModalOpen] = useState(false);
  const [currentExplanation, setCurrentExplanation] = useState('');

  // Hook modular para calificación y navegación
  const {
    grade,
    gradeModalOpen,
    saving,
    setGradeModalOpen,
    openGradeModal,
    saveGrade,
    handleClose,
    handleGoBack,
    handleNextExercise,
  } = useExerciseGrade({
    exerciseId: exercise?._id || '',
    unidad: exercise?.unidad || 0,
    exerciseNumber: exercise?.number || 0,
  });

  // Initialize states
  useEffect(() => {
    if (initialExercise && initialExercise.formulas) {
      const initialStates: (boolean | null)[] = [];
      initialExercise.formulas.forEach((formula: Formula) =>
        formula.answers.forEach(() => initialStates.push(null))
      );
      setSelectState(initialStates);
    }
  }, [initialExercise]);

  // Helper functions
  const getIndex = (iFormula: number, i: number): number => {
    if (!exercise) return 0;
    const sizes: number[] = [];
    exercise.formulas
      .slice(0, iFormula)
      .forEach((formula) => sizes.push(formula.answers.length));
    return sizes.reduce((a, b) => a + b, 0) + i;
  };

  const isShown = (generalIndex: number): boolean => {
    let current = 0;
    for (const formula of exercise?.formulas || []) {
      for (const answer of formula.answers) {
        if (current === generalIndex) return answer.shown || false;
        else current++;
      }
    }
    return false;
  };

  const shouldShowAnswer = (): boolean =>
    verified && selectState.some((x) => x === false);

  const checkAnswer = (
    userAnswer: string,
    ...correctAnswers: (string | undefined)[]
  ): boolean => {
    const normalizedUser = normalizeAnswer(userAnswer);
    return correctAnswers.some(
      (answer) => answer && normalizeAnswer(answer) === normalizedUser
    );
  };

  const handleSelectChange = (index: number, value: string) => {
    setResponses((old) => ({ ...old, [index]: value }));
  };

  const handleVerify = () => {
    if (!exercise) return;

    const results: boolean[] = [];
    exercise.formulas.forEach((formula, iFormula) =>
      formula.answers.forEach((answer, i) => {
        if (answer.shown) return results.push(true);
        const selectedAnswer = responses[getIndex(iFormula, i)];
        results.push(
          checkAnswer(
            selectedAnswer,
            answer.value,
            answer.answer2,
            answer.answer3,
            answer.answer4,
            answer.answer5,
            answer.answer6,
            answer.answer7,
            answer.answer8,
            answer.answer9,
            answer.answer10,
            answer.answer11,
            answer.answer12
          )
        );
      })
    );

    setSelectState(results);
    setVerified(true);

    // Calculate grade
    const computableResults = results.filter((_, i) => !isShown(i));
    const total = computableResults.length;
    const successes = computableResults.filter((x) => x).length;
    const calculatedGrade = total > 0 ? successes / total : 1;

    openGradeModal(calculatedGrade);
  };

  const handleSaveAndContinue = async () => {
    await saveGrade(true);
  };

  const handleSaveAndBack = async () => {
    await saveGrade(false);
  };

  const handleReset = () => {
    if (exercise) {
      const initialStates: (boolean | null)[] = [];
      exercise.formulas.forEach((formula) =>
        formula.answers.forEach(() => initialStates.push(null))
      );
      setSelectState(initialStates);
      setResponses({});
      setVerified(false);
    }
  };

  const showExplanation = (text?: string) => {
    if (text) {
      setCurrentExplanation(text);
      setExplanationModalOpen(true);
    }
  };

  const getFormulaIcon = (name: string) => {
    switch (name) {
      case 'AFF':
        return <CheckSquare className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: '#037bfc' }} />;
      case 'NEG':
        return <XSquare className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: '#fc0398' }} />;
      case '¿?':
        return <HelpCircle className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: '#c203fc' }} />;
      default:
        return null;
    }
  };

  const getFormulaColor = (name: string): string => {
    switch (name) {
      case 'AFF':
        return '#037bfc';
      case 'NEG':
        return '#fc0398';
      case '¿?':
        return '#c203fc';
      default:
        return '';
    }
  };

  const getTextColor = (color?: string): string => {
    switch (color) {
      case 'blue':
        return 'text-blue-600';
      case 'orange':
        return 'text-orange-600';
      case 'red':
        return 'text-red-600';
      case 'green':
        return 'text-green-600';
      default:
        return '';
    }
  };

  if (!exercise) {
    return <DashboardLoader />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Image - Responsive */}
      <div 
        className="w-full h-32 sm:h-40 md:h-48 bg-cover bg-center" 
        style={{ backgroundImage: 'url(/ejercicio/grammar.png)' }}
      >
        <div className="h-full flex items-center justify-end px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
            {exercise.skill}
          </h1>
        </div>
      </div>

      {/* Content - Responsive */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 max-w-6xl">
        <div className="mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2">{exercise.title}</h2>
          <p 
            className="text-sm sm:text-base text-muted-foreground mb-4" 
            dangerouslySetInnerHTML={{ __html: exercise.description }} 
          />
        </div>

        {/* Formulas - Responsive */}
        <div className="space-y-4 sm:space-y-6">
          {exercise.formulas.map((formula, iFormula) => (
            <div key={iFormula} className="bg-card rounded-lg border p-3 sm:p-4 md:p-6">
              {/* Formula Header */}
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                {getFormulaIcon(formula.name)}
                <h3 
                  className="text-lg sm:text-xl md:text-2xl font-bold"
                  style={{ color: getFormulaColor(formula.name) }}
                >
                  {formula.name}
                </h3>
              </div>

              {/* Formula Content - Responsive wrap */}
              <div className="space-y-3 sm:space-y-4">
                {/* Answers Row - Flex wrap for mobile */}
                <div className="flex flex-wrap items-start gap-2 sm:gap-3">
                  {formula.answers.map((answer, i) => {
                    const fieldIndex = getIndex(iFormula, i);
                    const isCorrect = selectState[fieldIndex];
                    const showResult = verified && !answer.shown;

                    return (
                      <Fragment key={i}>
                        {answer.shown ? (
                          <div className="flex items-center">
                            {answer.parentesis && <span className="text-lg sm:text-xl mr-0.5 sm:mr-1">(</span>}
                            <div className="px-2 sm:px-4 py-1.5 sm:py-2 bg-muted/50 rounded-md font-medium text-xs sm:text-sm">
                              {!answer.black ? (
                                <span className={getTextColor(answer.color)}>{answer.value}</span>
                              ) : (
                                answer.value.split(answer.black).map((part, ip, arr) => (
                                  <Fragment key={ip}>
                                    <span className={getTextColor(answer.color)}>{part}</span>
                                    {ip + 1 !== arr.length && (
                                      <span className="text-foreground">{answer.black}</span>
                                    )}
                                  </Fragment>
                                ))
                              )}
                            </div>
                            {answer.parentesis && <span className="text-lg sm:text-xl ml-0.5 sm:ml-1">)</span>}
                            {answer.asterisco && (
                              <sup className="text-red-600 font-bold text-xs sm:text-sm ml-0.5 sm:ml-1">*</sup>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1 sm:gap-2">
                            <div className="flex items-center gap-1 sm:gap-2">
                              {answer.parentesis && <span className="text-lg sm:text-xl">(</span>}
                              <Select
                                value={responses[fieldIndex] || ''}
                                onValueChange={(value) => handleSelectChange(fieldIndex, value)}
                                disabled={verified}
                              >
                                <SelectTrigger
                                  className={`w-32 sm:w-40 md:w-48 text-xs sm:text-sm h-8 sm:h-10 ${
                                    isCorrect === null
                                      ? ''
                                      : isCorrect === false
                                      ? 'border-red-500 border-2 bg-red-50 dark:bg-red-950/20'
                                      : 'border-green-500 border-2 bg-green-50 dark:bg-green-950/20'
                                  }`}
                                >
                                  <SelectValue placeholder="Seleccionar" />
                                </SelectTrigger>
                                <SelectContent>
                                  {formula.options.map((option, idx) => (
                                    <SelectItem key={idx} value={option}>
                                      {option}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {answer.parentesis && <span className="text-lg sm:text-xl">)</span>}
                              {answer.asterisco && (
                                <sup className="text-red-600 font-bold text-xs sm:text-sm">*</sup>
                              )}
                            </div>
                            {shouldShowAnswer() && (
                              <div
                                className={`text-[10px] sm:text-xs flex items-center gap-1 sm:gap-2 ${
                                  isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                }`}
                              >
                                <span className="truncate">Correcto: {answer.value}</span>
                                {answer.explanation && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-4 w-4 sm:h-5 sm:w-5 p-0 flex-shrink-0"
                                    onClick={() => showExplanation(answer.explanation)}
                                  >
                                    <MessageCircle className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                        {i < formula.answers.length - 1 && (
                          <span className="text-lg sm:text-xl md:text-2xl font-semibold text-primary self-center">+</span>
                        )}
                      </Fragment>
                    );
                  })}
                </div>

                {/* Texto Auxiliar */}
                {formula.textoAuxiliar && (
                  <p className="text-xs sm:text-sm text-muted-foreground mt-3 sm:mt-4 pl-2 border-l-2 border-muted">
                    <sup className="text-red-600 font-bold">* </sup>
                    {formula.textoAuxiliar}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons - Responsive */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-6 sm:mt-8">
          <Button 
            variant="outline" 
            onClick={handleReset} 
            disabled={!verified}
            className="w-full sm:w-auto"
          >
            Reintentar
          </Button>
          <Button 
            onClick={handleVerify} 
            disabled={verified}
            className="w-full sm:w-auto"
          >
            Verificar
          </Button>
        </div>
      </div>

      {/* Grade Modal */}
      <GradeModal
        open={gradeModalOpen}
        onOpenChange={setGradeModalOpen}
        grade={grade}
        saving={saving}
        onClose={handleClose}
        onGoBack={handleSaveAndBack}
        onNextExercise={handleSaveAndContinue}
      />

      {/* Explanation Modal */}
      <ExplanationModal
        open={explanationModalOpen}
        onOpenChange={setExplanationModalOpen}
        explanation={currentExplanation}
      />
    </div>
  );
}
