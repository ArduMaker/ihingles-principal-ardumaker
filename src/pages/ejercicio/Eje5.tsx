import { useState, useEffect, Fragment } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Exercise } from '@/data/unidades';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { postUserGrade, postUserPosition } from '@/lib/api';
import { toast } from 'sonner';
import { normalizeAnswer } from '@/lib/exerciseUtils';
import { Calculate_index_exercise } from '@/hooks/calculate_index';
import DashboardLoader from '@/components/dashboard/DashboardLoader';
import { ArrowRight, RotateCcw, Check, MessageCircle } from 'lucide-react';

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

// Get plain value from answer (handles complex structures)
const getPlainValue = (answer: string | [string, string[]] | undefined): string => {
  if (!answer) return '';
  if (typeof answer === 'string') return answer;
  if (Array.isArray(answer)) {
    // [string, string[]] format - return the first value
    return answer[0];
  }
  return '';
};

// Check answer function matching old logic with multiple alternative answers
const checkAnswerOld = (
  userAnswer: string,
  answer: string | [string, string[]] | undefined,
  answer2?: string | null,
  answer3?: string | null,
  answer4?: string | null,
  answer5?: string | null,
  answer6?: string | null,
  answer7?: string | null,
  answer8?: string | null,
  answer9?: string | null,
  answer10?: string | null,
  answer11?: string | null,
  answer12?: string | null
): boolean => {
  const normalized = normalizeAnswer(userAnswer);
  if (!normalized) return false;

  // Build list of valid answers
  const validAnswers: string[] = [];

  if (typeof answer === 'string') {
    validAnswers.push(normalizeAnswer(answer));
  } else if (Array.isArray(answer)) {
    // Handle [string, string[]] format with permutables
    const [base, permutables] = answer;
    validAnswers.push(normalizeAnswer(base));
    if (permutables) {
      permutables.forEach(perm => validAnswers.push(normalizeAnswer(perm)));
    }
  }

  // Add alternative answers (answers2 through answers12)
  const alternatives = [answer2, answer3, answer4, answer5, answer6, answer7, answer8, answer9, answer10, answer11, answer12];
  alternatives.forEach(alt => {
    if (alt) validAnswers.push(normalizeAnswer(alt));
  });

  return validAnswers.includes(normalized);
};

export const Eje5 = ({ exercise: initialExercise }: Eje5Props) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [verified, setVerified] = useState(false);
  const [responses, setResponses] = useState<(boolean | string)[]>([]);
  const [userResponses, setUserResponses] = useState<string[]>([]);
  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [grade, setGrade] = useState(0);
  const [explanationModalOpen, setExplanationModalOpen] = useState(false);
  const [currentExplanation, setCurrentExplanation] = useState('');
  const [loading, setLoading] = useState(true);

  // Initialize responses
  useEffect(() => {
    if (!isType5Exercise(initialExercise)) return;
    
    const exercise = initialExercise;
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

  const exercise = initialExercise;

  // Should show the correct answer (when verified and there are errors)
  const shouldShowAnswer = () => verified && responses.some((x) => !x);

  // Get linear index for a field (matching old logic exactly)
  const getIndex = (iSentence: number, iAnswer: number): number => {
    const sizes: number[] = [];
    exercise.sentences
      .slice(0, iSentence)
      .forEach((sentence) => sizes.push(sentence.answers.length));
    return sizes.reduce((a, b) => a + b, 0) + iAnswer;
  };

  // Get the correct answer at a given linear index
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
    // Collect all answers
    const answers: (string | [string, string[]])[] = [];
    const answers2: (string | null | undefined)[] = [];
    const answers3: (string | null | undefined)[] = [];
    const answers4: (string | null | undefined)[] = [];
    const answers5: (string | null | undefined)[] = [];
    const answers6: (string | null | undefined)[] = [];
    const answers7: (string | null | undefined)[] = [];
    const answers8: (string | null | undefined)[] = [];
    const answers9: (string | null | undefined)[] = [];
    const answers10: (string | null | undefined)[] = [];
    const answers11: (string | null | undefined)[] = [];
    const answers12: (string | null | undefined)[] = [];

    exercise.sentences.forEach((sentence) => {
      const s = sentence as any; // Cast to access dynamic answer properties
      sentence.answers.forEach((answer, i) => {
        answers.push(answer);
        answers2.push(s.answers2?.[i]);
        answers3.push(s.answers3?.[i]);
        answers4.push(s.answers4?.[i]);
        answers5.push(s.answers5?.[i]);
        answers6.push(s.answers6?.[i]);
        answers7.push(s.answers7?.[i]);
        answers8.push(s.answers8?.[i]);
        answers9.push(s.answers9?.[i]);
        answers10.push(s.answers10?.[i]);
        answers11.push(s.answers11?.[i]);
        answers12.push(s.answers12?.[i]);
      });
    });

    // Check responses
    const responsesCheck: boolean[] = [];
    answers.forEach((answer, iAns) =>
      responsesCheck.push(
        checkAnswerOld(
          userResponses[iAns],
          answer,
          answers2[iAns],
          answers3[iAns],
          answers4[iAns],
          answers5[iAns],
          answers6[iAns],
          answers7[iAns],
          answers8[iAns],
          answers9[iAns],
          answers10[iAns],
          answers11[iAns],
          answers12[iAns]
        )
      )
    );

    setResponses(responsesCheck);
    setVerified(true);

    // Calculate grade
    const total = responsesCheck.length;
    const successes = responsesCheck.filter((x) => x).length;
    const gradeValue = total > 0 ? Math.round((successes / total) * 100) : 0;

    setGrade(gradeValue);
    setGradeModalOpen(true);
  };

  const handleSaveGrade = async (continueToNext: boolean = false) => {
    try {
      await postUserGrade(
        (exercise.number || 0).toString(),
        grade,
        (exercise.unidad || 0).toString()
      );

      const exerciseIndex = await Calculate_index_exercise(exercise);
      if (exerciseIndex !== -1) {
        await postUserPosition({
          unidad: exercise.unidad,
          position: exerciseIndex
        });
      }

      toast.success('Progreso guardado correctamente');
      setGradeModalOpen(false);

      if (continueToNext) {
        const nextExerciseNumber = (exercise.number || 0) + 1;
        navigate(`/ejercicio/${id}/${nextExerciseNumber}`);
      } else {
        navigate(`/unidad/${id}`);
      }
    } catch (error) {
      console.error('Error saving grade:', error);
      toast.error('Error al guardar el progreso');
    }
  };

  const showExplanation = (text?: string) => {
    if (text) {
      setCurrentExplanation(text);
      setExplanationModalOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <DashboardLoader />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      {/* Hero Image */}
      <div className="w-full rounded-xl overflow-hidden mb-6">
        <img 
          src="/ejercicio/principal2.png" 
          alt="Exercise" 
          className="w-full h-32 md:h-48 object-cover"
        />
      </div>

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">{exercise.title}</h1>
        {exercise.description && (
          <p className="text-muted-foreground whitespace-pre-wrap">{exercise.description}</p>
        )}
      </div>

      {/* Sentences */}
      <div className="space-y-4">
        {exercise.sentences.map((sentenceData, iSentence) => (
          <div 
            key={iSentence} 
            className="border border-border rounded-lg p-4 md:p-6 bg-card"
          >
            {/* Sentence with blanks */}
            <div className="flex flex-wrap items-center gap-2 text-lg">
              <span className="font-bold text-primary mr-2 min-w-[24px]">
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
                        className="w-32 h-9 text-center"
                        style={{
                          borderColor: !verified ? 'hsl(var(--border))' :
                            responses[getIndex(iSentence, index - 1)] ? '#22c55e' : '#ef4444',
                          borderWidth: verified ? '2px' : '1px',
                          backgroundColor: !verified ? 'transparent' :
                            responses[getIndex(iSentence, index - 1)] ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        }}
                      />
                      {/* Show correct answer when verified and wrong */}
                      {shouldShowAnswer() && !responses[getIndex(iSentence, index - 1)] && (
                        <span 
                          className="text-xs text-green-600 mt-1 cursor-pointer hover:underline"
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

            {/* Text to conjugate */}
            {sentenceData.textToConjugate && (
              <div className="mt-3 text-sm text-muted-foreground italic bg-muted/50 px-3 py-2 rounded inline-block">
                {sentenceData.textToConjugate}
              </div>
            )}

            {/* Explanation button (only show if verified, has explanation, and there's an error in this sentence) */}
            {verified && sentenceData.explanation && (
              <button
                onClick={() => showExplanation(sentenceData.explanation)}
                className="mt-2 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <MessageCircle className="h-4 w-4" />
                Ver explicación
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 pt-6">
        <Button 
          onClick={handleReset} 
          variant="outline" 
          size="lg"
          className="gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reintentar
        </Button>
        <Button 
          onClick={handleVerify} 
          size="lg"
          className="gap-2"
          disabled={verified}
        >
          <Check className="h-4 w-4" />
          Verificar
        </Button>
      </div>

      {/* Grade Modal */}
      <Dialog open={gradeModalOpen} onOpenChange={setGradeModalOpen}>
        <DialogContent className="bg-background">
          <DialogHeader>
            <DialogTitle>Resultado del Ejercicio</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center py-6">
              <p className="text-5xl font-bold text-primary">{grade}%</p>
              <p className="text-muted-foreground mt-2">
                Respuestas correctas
              </p>
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="ghost" onClick={() => setGradeModalOpen(false)}>
              Cerrar
            </Button>
            <Button variant="outline" onClick={() => handleSaveGrade(false)}>
              Volver al Menú
            </Button>
            <Button onClick={() => handleSaveGrade(true)} className="gap-2">
              Siguiente Ejercicio
              <ArrowRight className="h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Explanation Modal */}
      <Dialog open={explanationModalOpen} onOpenChange={setExplanationModalOpen}>
        <DialogContent className="bg-background">
          <DialogHeader>
            <DialogTitle>Explicación</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-foreground">{currentExplanation}</p>
          </div>
          <DialogFooter>
            <Button onClick={() => setExplanationModalOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Eje5;
