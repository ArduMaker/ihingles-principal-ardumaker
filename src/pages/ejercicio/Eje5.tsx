import { useState, useEffect, Fragment } from 'react';
import { Exercise } from '@/data/unidades';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { normalizeAnswer } from '@/lib/exerciseUtils';
import DashboardLoader from '@/components/dashboard/DashboardLoader';
import { RotateCcw, Check, MessageCircle } from 'lucide-react';
import { useExerciseGrade } from '@/hooks/useExerciseGrade';
import { GradeModal } from '@/components/ejercicio/GradeModal';
import { ExplanationModal } from '@/components/ejercicio/ExplanationModal';

interface Eje5Props {
  exercise: Exercise;
}

interface SentenceData {
  sentence: string;
  answers: (string | [string, string[]])[];
  answers2?: (string | null)[];
  answers3?: (string | null)[];
  answers4?: (string | null)[];
  answers5?: (string | null)[];
  answers6?: (string | null)[];
  answers7?: (string | null)[];
  answers8?: (string | null)[];
  answers9?: (string | null)[];
  answers10?: (string | null)[];
  answers11?: (string | null)[];
  answers12?: (string | null)[];
  explanation?: string;
  textToConjugate?: string;
}

type Type5Exercise = Exercise & {
  sentences: SentenceData[];
  description?: string;
};

const isType5Exercise = (exercise: Exercise): exercise is Type5Exercise => {
  return 'sentences' in exercise && Array.isArray((exercise as any).sentences);
};

const getPlainValue = (answer: string | [string, string[]] | undefined): string => {
  if (!answer) return '';
  if (typeof answer === 'string') return answer;
  if (Array.isArray(answer)) return answer[0];
  return '';
};

const checkAnswerOld = (
  userAnswer: string,
  answer: string | [string, string[]] | undefined,
  ...alternatives: (string | null | undefined)[]
): boolean => {
  const normalized = normalizeAnswer(userAnswer);
  if (!normalized) return false;

  const validAnswers: string[] = [];

  if (typeof answer === 'string') {
    validAnswers.push(normalizeAnswer(answer));
  } else if (Array.isArray(answer)) {
    const [base, permutables] = answer;
    validAnswers.push(normalizeAnswer(base));
    if (permutables) {
      permutables.forEach(perm => validAnswers.push(normalizeAnswer(perm)));
    }
  }

  alternatives.forEach(alt => {
    if (alt) validAnswers.push(normalizeAnswer(alt));
  });

  return validAnswers.includes(normalized);
};

export const Eje5 = ({ exercise: initialExercise }: Eje5Props) => {
  const [verified, setVerified] = useState(false);
  const [responses, setResponses] = useState<(boolean | string)[]>([]);
  const [userResponses, setUserResponses] = useState<string[]>([]);
  const [explanationModalOpen, setExplanationModalOpen] = useState(false);
  const [currentExplanation, setCurrentExplanation] = useState('');
  const [loading, setLoading] = useState(true);

  const exercise = initialExercise as Type5Exercise;

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

  useEffect(() => {
    if (!isType5Exercise(initialExercise)) return;
    
    const initialStates: string[] = [];
    exercise.sentences.forEach((sentence) =>
      sentence.answers.forEach(() => initialStates.push(''))
    );
    
    setUserResponses(initialStates);
    setResponses(initialStates.map(() => ''));
    setLoading(false);
  }, [initialExercise]);

  if (!isType5Exercise(initialExercise)) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Estructura de ejercicio tipo 5 no válida</p>
      </div>
    );
  }

  const shouldShowAnswer = () => verified && responses.some((x) => !x);

  const getIndex = (iSentence: number, iAnswer: number): number => {
    const sizes: number[] = [];
    exercise.sentences
      .slice(0, iSentence)
      .forEach((sentence) => sizes.push(sentence.answers.length));
    return sizes.reduce((a, b) => a + b, 0) + iAnswer;
  };

  const getAnswer = (i: number): string | [string, string[]] => {
    const answers: (string | [string, string[]])[] = [];
    exercise.sentences.forEach((sentence) =>
      sentence.answers.forEach((answer) => answers.push(answer))
    );
    return answers[i];
  };

  const handleChange = (index: number, value: string) => {
    setUserResponses((old) => {
      const data = [...old];
      data[index] = value;
      return data;
    });
  };

  const handleReset = () => {
    const initialStates: string[] = [];
    exercise.sentences.forEach((sentence) =>
      sentence.answers.forEach(() => initialStates.push(''))
    );
    setUserResponses(initialStates);
    setResponses(initialStates.map(() => ''));
    setVerified(false);
  };

  const handleVerify = () => {
    const answers: (string | [string, string[]])[] = [];
    const altAnswers: (string | null | undefined)[][] = Array.from({ length: 11 }, () => []);

    exercise.sentences.forEach((sentence) => {
      const s = sentence as any;
      sentence.answers.forEach((answer, i) => {
        answers.push(answer);
        for (let n = 2; n <= 12; n++) {
          altAnswers[n - 2].push(s[`answers${n}`]?.[i]);
        }
      });
    });

    const responsesCheck: boolean[] = [];
    answers.forEach((answer, iAns) =>
      responsesCheck.push(
        checkAnswerOld(
          userResponses[iAns],
          answer,
          ...altAnswers.map(arr => arr[iAns])
        )
      )
    );

    setResponses(responsesCheck);
    setVerified(true);

    const total = responsesCheck.length;
    const successes = responsesCheck.filter((x) => x).length;
    const gradeValue = total > 0 ? successes / total : 1;

    openGradeModal(gradeValue);
  };

  const handleSaveAndContinue = async () => {
    await saveGrade(true);
  };

  const handleSaveAndBack = async () => {
    await saveGrade(false);
  };

  const showExplanation = (text?: string) => {
    if (text) {
      setCurrentExplanation(text);
      setExplanationModalOpen(true);
    }
  };

  if (loading) {
    return <DashboardLoader />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Image - Responsive */}
      <div 
        className="w-full h-32 sm:h-40 md:h-48 bg-cover bg-center" 
        style={{ backgroundImage: 'url(/ejercicio/principal2.png)' }}
      >
        <div className="h-full flex items-center justify-end px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
            {exercise.skill}
          </h1>
        </div>
      </div>

      {/* Content - Responsive */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 max-w-4xl">
        <div className="mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2">{exercise.title}</h2>
          {exercise.description && (
            <p className="text-sm sm:text-base text-muted-foreground whitespace-pre-wrap">{exercise.description}</p>
          )}
        </div>

        {/* Sentences - Responsive */}
        <div className="space-y-3 sm:space-y-4">
          {exercise.sentences.map((sentenceData, iSentence) => (
            <div 
              key={iSentence} 
              className="border border-border rounded-lg p-3 sm:p-4 md:p-6 bg-card"
            >
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-sm sm:text-base md:text-lg">
                <span className="font-bold text-primary mr-1 sm:mr-2 min-w-[20px] sm:min-w-[24px]">
                  {iSentence + 1}.
                </span>
                {sentenceData.sentence.split('___').map((part, index) => (
                  <Fragment key={index}>
                    {index !== 0 && (
                      <div className="inline-flex flex-col items-center">
                        <Input
                          value={userResponses[getIndex(iSentence, index - 1)] || ''}
                          onChange={(e) => handleChange(getIndex(iSentence, index - 1), e.target.value)}
                          disabled={verified}
                          className="w-20 sm:w-28 md:w-32 h-7 sm:h-8 md:h-9 text-center text-xs sm:text-sm"
                          style={{
                            borderColor: !verified ? 'hsl(var(--border))' :
                              responses[getIndex(iSentence, index - 1)] ? '#22c55e' : '#ef4444',
                            borderWidth: verified ? '2px' : '1px',
                            backgroundColor: !verified ? 'transparent' :
                              responses[getIndex(iSentence, index - 1)] ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          }}
                        />
                        {shouldShowAnswer() && !responses[getIndex(iSentence, index - 1)] && (
                          <span 
                            className="text-[10px] sm:text-xs text-green-600 mt-0.5 sm:mt-1 cursor-pointer hover:underline"
                            onClick={() => showExplanation(sentenceData.explanation)}
                          >
                            {getPlainValue(getAnswer(getIndex(iSentence, index - 1)))}
                          </span>
                        )}
                      </div>
                    )}
                    <span className="text-foreground">{part}</span>
                  </Fragment>
                ))}
              </div>

              {sentenceData.textToConjugate && (
                <div className="mt-2 sm:mt-3 text-xs sm:text-sm text-muted-foreground italic bg-muted/50 px-2 sm:px-3 py-1.5 sm:py-2 rounded inline-block">
                  {sentenceData.textToConjugate}
                </div>
              )}

              {verified && sentenceData.explanation && (
                <button
                  onClick={() => showExplanation(sentenceData.explanation)}
                  className="mt-2 flex items-center gap-1 text-xs sm:text-sm text-blue-600 hover:text-blue-700"
                >
                  <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                  Ver explicación
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Action Buttons - Responsive */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-6 sm:mt-8">
          <Button 
            onClick={handleReset} 
            variant="outline" 
            className="w-full sm:w-auto gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reintentar
          </Button>
          <Button 
            onClick={handleVerify} 
            className="w-full sm:w-auto gap-2"
            disabled={verified}
          >
            <Check className="h-4 w-4" />
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
};

export default Eje5;
