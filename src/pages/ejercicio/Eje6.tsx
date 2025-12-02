import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Exercise } from '@/data/unidades';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { postUserGrade, postUserPosition } from '@/lib/api';
import { toast } from 'sonner';
import { normalizeAnswer } from '@/lib/exerciseUtils';
import { Calculate_index_exercise } from '@/hooks/calculate_index';
import DashboardLoader from '@/components/dashboard/DashboardLoader';
import { ArrowRight, RotateCcw, Check, MessageCircle, CheckCircle2, XCircle } from 'lucide-react';

interface Eje6Props {
  exercise: Exercise;
}

interface SentenceData {
  sentence?: string;
  shown?: boolean;
  answer?: string | boolean;
  answer2?: string;
  answer3?: string;
  sujeto?: string;
  verbo?: string;
  complemento?: string | string[];
  adverbio?: string;
  aux?: string;
  wh?: string;
  pregunta?: 'be' | 'general';
  explanation?: string;
  complementar?: string;
  // Alternative answers (sujeto2, verbo2, etc.)
  [key: string]: any;
}

type Type6Exercise = Exercise & {
  sentences: SentenceData[];
  options?: string[];
  audio?: string;
  description?: string;
};

const isType6Exercise = (exercise: Exercise): exercise is Type6Exercise => {
  return 'sentences' in exercise && Array.isArray((exercise as any).sentences);
};

// Get plain value from complemento (handles string, array, or boolean)
const getPlainValue = (value: string | string[] | boolean | undefined): string => {
  if (!value || value === true) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.join(' ');
  return '';
};

// Build the complete correct answer from sentence parts
const getAnswer = (sentence: SentenceData): string => {
  if (sentence?.answer && typeof sentence.answer === 'string') return getPlainValue(sentence.answer);

  let complemento =
    sentence.complemento && sentence.complemento !== 'N/A'
      ? getPlainValue(sentence.complemento as string | string[])
      : '';

  let wh = sentence.wh ?? '';

  const isPreguntaBe = sentence.pregunta === 'be';
  const isPreguntaGeneral = sentence.pregunta === 'general';
  const isNormalSentence =
    !isPreguntaBe &&
    !isPreguntaGeneral &&
    !sentence.wh &&
    !sentence.aux &&
    !sentence.adverbio &&
    sentence.sujeto &&
    sentence.verbo &&
    sentence.complemento;
  const isAdverbioSentence =
    !isPreguntaBe &&
    !isNormalSentence &&
    !isPreguntaGeneral &&
    sentence.adverbio;

  if (isNormalSentence)
    return `${sentence.sujeto} ${sentence.verbo} ${complemento}`.trim();
  if (isPreguntaBe)
    return `${wh} ${sentence.verbo} ${sentence.sujeto} ${complemento}`.trim();
  if (isPreguntaGeneral)
    return `${wh} ${sentence.aux} ${sentence.sujeto} ${sentence.verbo} ${complemento}`.trim();
  if (isAdverbioSentence)
    return `${sentence.adverbio} ${sentence.sujeto} ${sentence.verbo} ${complemento}`.trim();

  return '';
};

// Get subject object with potential alternative (sujeto2, verbo2, etc.)
const getSujObj = (sentence: SentenceData, n?: number): SentenceData => ({
  wh: !n ? sentence.wh : sentence[`wh${n}`] || sentence.wh,
  adverbio: !n ? sentence.adverbio : sentence[`adverbio${n}`] || sentence.adverbio,
  aux: !n ? sentence.aux : sentence[`aux${n}`] || sentence.aux,
  sujeto: !n ? sentence.sujeto : sentence[`sujeto${n}`] || sentence.sujeto,
  verbo: !n ? sentence.verbo : sentence[`verbo${n}`] || sentence.verbo,
  complemento: !n ? sentence.complemento : sentence[`complemento${n}`] || sentence.complemento,
});

// Check answer with multiple alternatives
const checkAnswerType6 = (userAnswer: string, sentence: SentenceData): number => {
  const normalized = normalizeAnswer(userAnswer);
  if (!normalized) return 0;

  // If sentence has direct answer field
  if (sentence.answer) {
    const validAnswers: string[] = [];
    for (let i = 0; i <= 20; i++) {
      const key = i === 0 ? 'answer' : `answer${i}`;
      if (sentence[key]) {
        validAnswers.push(normalizeAnswer(sentence[key]));
      }
    }
    return validAnswers.includes(normalized) ? 1 : 0;
  }

  // If sentence uses sujeto/verbo/complemento structure
  if (sentence.sujeto) {
    // Check up to 12 alternative sentence structures
    for (let i = 0; i <= 12; i++) {
      const sujObj = getSujObj(sentence, i === 0 ? undefined : i);
      const correctAnswer = getAnswer(sujObj);
      if (correctAnswer && normalizeAnswer(correctAnswer) === normalized) {
        return 1;
      }
    }
    
    // Partial match scoring (simplified - just check if mostly correct)
    const mainAnswer = getAnswer(sentence);
    if (mainAnswer) {
      const mainNorm = normalizeAnswer(mainAnswer);
      const words = mainNorm.split(' ').filter(w => w);
      const userWords = normalized.split(' ').filter(w => w);
      let matches = 0;
      userWords.forEach(uw => {
        if (words.includes(uw)) matches++;
      });
      if (words.length > 0) {
        return matches / words.length;
      }
    }
  }

  return 0;
};

export function Eje6({ exercise: initialExercise }: Eje6Props) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [verified, setVerified] = useState(false);
  const [selectState, setSelectState] = useState<(number | null)[]>([]);
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [grade, setGrade] = useState(0);
  const [explanationModalOpen, setExplanationModalOpen] = useState(false);
  const [currentExplanation, setCurrentExplanation] = useState('');
  const [loading, setLoading] = useState(true);

  // Initialize state
  useEffect(() => {
    if (!isType6Exercise(initialExercise)) return;

    const exercise = initialExercise;
    const initialStates: (number | null)[] = [];
    const initialResponses: Record<number, string> = {};

    exercise.sentences.forEach((s, i) => {
      const sentence = s as any;
      initialStates.push(null);
      initialResponses[i] = sentence.shown && typeof sentence.answer === 'string' ? sentence.answer : '';
    });

    setSelectState(initialStates);
    setResponses(initialResponses);
    setLoading(false);
  }, [initialExercise]);

  if (!isType6Exercise(initialExercise)) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Estructura de ejercicio tipo 6 no válida</p>
      </div>
    );
  }

  const exercise = initialExercise;

  const handleChange = (index: number, value: string) => {
    setResponses((old) => ({ ...old, [index]: value }));
  };

  const handleReset = () => {
    const initialStates: (number | null)[] = [];
    const initialResponses: Record<number, string> = {};

    exercise.sentences.forEach((s, i) => {
      const sentence = s as any;
      initialStates.push(null);
      initialResponses[i] = sentence.shown && typeof sentence.answer === 'string' ? sentence.answer : '';
    });

    setSelectState(initialStates);
    setResponses(initialResponses);
    setVerified(false);
  };

  const isShown = (index: number): boolean => {
    return !!exercise.sentences[index]?.shown;
  };

  const shouldShowAnswer = () =>
    verified && selectState.some((x) => x !== null && x < 1);

  const handleVerify = () => {
    const results: number[] = [];

    exercise.sentences.forEach((s, i) => {
      if (s.shown) {
        results.push(1);
        return;
      }

      const score = checkAnswerType6(responses[i] || '', s);
      results.push(score);
    });

    setSelectState(results);
    setVerified(true);

    // Calculate grade (only count non-shown fields)
    const computableResults = results.filter((_, i) => !isShown(i));
    const total = computableResults.length;
    const gradeTotal = computableResults.reduce((a, b) => a + b, 0);
    const gradeValue = total > 0 ? Math.round((gradeTotal / total) * 100) : 0;

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

  const getColor = (score: number | null): string => {
    if (score === null) return 'hsl(var(--border))';
    return score >= 0.6 ? '#22c55e' : '#ef4444';
  };

  const getBackgroundColor = (score: number | null): string => {
    if (score === null) return 'transparent';
    return score >= 0.6 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <DashboardLoader />
      </div>
    );
  }

  // Render a single sentence row
  const renderSentence = (sentence: SentenceData, i: number, removeBorder: boolean = false) => {
    const stateI = selectState[i];
    const isCorrect = stateI !== null && stateI >= 0.6;

    return (
      <div
        key={i}
        className={`flex flex-col md:flex-row md:items-center gap-3 p-4 ${
          !removeBorder ? 'border border-border rounded-lg bg-card' : ''
        }`}
      >
        {/* Result indicator */}
        {verified && (
          <div className="flex-shrink-0">
            {isCorrect ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
          </div>
        )}

        {/* Sentence text */}
        <p className="flex-1 min-w-[200px] font-medium text-foreground">
          {sentence.sentence}
        </p>

        {/* Input or Select */}
        <div className="flex flex-col gap-1 flex-shrink-0">
          {sentence.shown ? (
            <p className="font-normal text-muted-foreground px-3 py-2 bg-muted rounded">
              {sentence.answer}
            </p>
          ) : exercise.options ? (
            <Select
              value={responses[i] || ''}
              onValueChange={(value) => handleChange(i, value)}
              disabled={verified}
            >
              <SelectTrigger
                className="w-[200px]"
                style={{
                  borderColor: getColor(stateI),
                  borderWidth: verified ? '2px' : '1px',
                  backgroundColor: getBackgroundColor(stateI),
                }}
              >
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                {exercise.options.map((option, optIndex) => {
                  const optionValue = typeof option === 'string' ? option : (option as any).text || '';
                  return (
                    <SelectItem key={optIndex} value={optionValue}>
                      {optionValue}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          ) : (
            <Input
              value={responses[i] || ''}
              onChange={(e) => handleChange(i, e.target.value)}
              disabled={verified}
              className="w-[250px]"
              style={{
                borderColor: getColor(stateI),
                borderWidth: verified ? '2px' : '1px',
                backgroundColor: getBackgroundColor(stateI),
              }}
            />
          )}

          {/* Show correct answer when verified and wrong */}
          {shouldShowAnswer() && !sentence.shown && stateI !== null && stateI < 1 && (
            <span
              className="text-sm font-semibold cursor-pointer hover:underline"
              style={{ color: isCorrect ? '#22c55e' : '#ef4444' }}
              onClick={() => showExplanation(sentence.explanation)}
            >
              {getAnswer(sentence)}
            </span>
          )}
        </div>

        {/* Explanation button */}
        {verified && sentence.explanation && (
          <button
            onClick={() => showExplanation(sentence.explanation)}
            className="flex-shrink-0 text-blue-600 hover:text-blue-700"
          >
            <MessageCircle className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      {/* Hero Image */}
      <div className="w-full rounded-xl overflow-hidden mb-6">
        <img
          src="/ejercicio/grammar.png"
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
        {exercise.sentences.map((s, i, arr) => {
          const sentence = s as any;
          const prevSentence = i !== 0 ? (arr[i - 1] as any) : null;
          
          // Skip if previous sentence had complementar (already rendered)
          if (prevSentence?.complementar) return null;

          // Handle complementar (grouped sentences)
          if (sentence.complementar) {
            return (
              <div
                key={`comp-${i}`}
                className="border-2 border-primary/30 rounded-lg p-4 space-y-3"
              >
                <p className="text-sm font-semibold text-foreground">
                  {sentence.complementar}
                </p>
                {renderSentence(sentence, i, true)}
                {arr[i + 1] && renderSentence(arr[i + 1] as any, i + 1, true)}
              </div>
            );
          }

          return renderSentence(sentence, i);
        })}
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
                {grade >= 80 ? '¡Excelente trabajo!' :
                 grade >= 60 ? '¡Buen trabajo!' :
                 '¡Sigue practicando!'}
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
}

export default Eje6;
