import { useState, useEffect, Fragment } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { normalizeAnswer } from '@/lib/exerciseUtils';
import { postUserGrade, postUserPosition } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CheckSquare, XSquare, HelpCircle, MessageCircle } from 'lucide-react';
import DashboardLoader from '@/components/dashboard/DashboardLoader';

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
  const { id } = useParams();
  const navigate = useNavigate();
  const [exercise, setExercise] = useState<ExerciseType3 | null>(initialExercise);
  const [responses, setResponses] = useState<{ [key: number]: string }>({});
  const [selectState, setSelectState] = useState<(boolean | null)[]>([]);
  const [verified, setVerified] = useState(false);
  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [grade, setGrade] = useState(0);
  const [explanationModalOpen, setExplanationModalOpen] = useState(false);
  const [currentExplanation, setCurrentExplanation] = useState('');

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

    setGrade(calculatedGrade);
    setGradeModalOpen(true);
  };

  const handleSaveGrade = async (continueToNext: boolean = false) => {
    if (!exercise) return;

    try {
      await postUserGrade(exercise._id, grade, String(exercise.unidad));
      await postUserPosition({
        unidad: Number(id),
        position: exercise.number,
      });

      toast({
        title: 'Progreso guardado',
        description: 'Tu calificación ha sido registrada correctamente',
      });

      setGradeModalOpen(false);

      if (continueToNext) {
        const nextExerciseNumber = exercise.number + 1;
        navigate(`/ejercicio/${id}/${nextExerciseNumber}`);
      } else {
        navigate(`/unidad/${id}`);
      }
    } catch (error) {
      console.error('Error saving grade:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar tu progreso',
        variant: 'destructive',
      });
    }
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
        return <CheckSquare className="h-6 w-6" style={{ color: '#037bfc' }} />;
      case 'NEG':
        return <XSquare className="h-6 w-6" style={{ color: '#fc0398' }} />;
      case '¿?':
        return <HelpCircle className="h-6 w-6" style={{ color: '#c203fc' }} />;
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
      {/* Hero Image */}
      <div className="w-full h-48 bg-cover bg-center" style={{ backgroundImage: 'url(/ejercicio/grammar.png)' }}>
        <div className="h-full flex items-center justify-end px-8">
          <h1 className="text-4xl font-bold text-white">{exercise.skill}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">{exercise.title}</h2>
          <p className="text-muted-foreground mb-4" dangerouslySetInnerHTML={{ __html: exercise.description }} />
        </div>

        {/* Formulas */}
        <div className="space-y-6">
          {exercise.formulas.map((formula, iFormula) => (
            <div key={iFormula} className="bg-card rounded-lg border p-6">
              {/* Formula Header */}
              <div className="flex items-center gap-3 mb-6">
                {getFormulaIcon(formula.name)}
                <h3 
                  className="text-2xl font-bold"
                  style={{ color: getFormulaColor(formula.name) }}
                >
                  {formula.name}
                </h3>
              </div>

              {/* Formula Content */}
              <div className="space-y-4">
                {/* Answers Row */}
                <div className="flex flex-wrap items-center gap-3">
                  {formula.answers.map((answer, i) => {
                    const fieldIndex = getIndex(iFormula, i);
                    const isCorrect = selectState[fieldIndex];
                    const showResult = verified && !answer.shown;

                    return (
                      <Fragment key={i}>
                        {answer.shown ? (
                          <div className="flex items-center">
                            {answer.parentesis && <span className="text-xl mr-1">(</span>}
                            <div className="px-4 py-2 bg-muted/50 rounded-md font-medium">
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
                            {answer.parentesis && <span className="text-xl ml-1">)</span>}
                            {answer.asterisco && (
                              <sup className="text-red-600 font-bold text-sm ml-1">*</sup>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              {answer.parentesis && <span className="text-xl">(</span>}
                              <Select
                                value={responses[fieldIndex] || ''}
                                onValueChange={(value) => handleSelectChange(fieldIndex, value)}
                                disabled={verified}
                              >
                                <SelectTrigger
                                  className={`w-48 ${
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
                              {answer.parentesis && <span className="text-xl">)</span>}
                              {answer.asterisco && (
                                <sup className="text-red-600 font-bold text-sm">*</sup>
                              )}
                            </div>
                            {shouldShowAnswer() && (
                              <div
                                className={`text-xs flex items-center gap-2 ${
                                  isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                }`}
                              >
                                <span>Correcto: {answer.value}</span>
                                {answer.explanation && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-5 w-5 p-0"
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
                          <span className="text-2xl font-semibold text-primary">+</span>
                        )}
                      </Fragment>
                    );
                  })}
                </div>

                {/* Texto Auxiliar */}
                {formula.textoAuxiliar && (
                  <p className="text-sm text-muted-foreground mt-4 pl-2 border-l-2 border-muted">
                    <sup className="text-red-600 font-bold">* </sup>
                    {formula.textoAuxiliar}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center mt-8">
          <Button variant="outline" onClick={handleReset} disabled={!verified}>
            Reintentar
          </Button>
          <Button onClick={handleVerify} disabled={verified}>
            Verificar
          </Button>
        </div>
      </div>

      {/* Grade Modal */}
      <Dialog open={gradeModalOpen} onOpenChange={setGradeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resultado del Ejercicio</DialogTitle>
            <DialogDescription>
              Has obtenido una calificación de {(grade * 100).toFixed(0)}%
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="text-center">
              <div className="text-6xl font-bold text-primary mb-2">
                {(grade * 100).toFixed(0)}%
              </div>
              <p className="text-muted-foreground">
                {grade >= 0.7 ? '¡Excelente trabajo!' : 'Sigue practicando'}
              </p>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setGradeModalOpen(false)}>
              Cerrar
            </Button>
            <Button variant="secondary" onClick={() => handleSaveGrade(false)}>
              Volver al Menú
            </Button>
            <Button onClick={() => handleSaveGrade(true)}>
              Siguiente Ejercicio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Explanation Modal */}
      <Dialog open={explanationModalOpen} onOpenChange={setExplanationModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Explicación</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p dangerouslySetInnerHTML={{ __html: currentExplanation }} />
          </div>
          <DialogFooter>
            <Button onClick={() => setExplanationModalOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
