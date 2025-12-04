import { useState, useEffect } from 'react';
import { Exercise } from '@/data/unidades';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { normalizeAnswer } from '@/lib/exerciseUtils';
import DashboardLoader from '@/components/dashboard/DashboardLoader';
import { RotateCcw, Check, MessageCircle, CheckCircle2, XCircle } from 'lucide-react';
import { useExerciseGrade } from '@/hooks/useExerciseGrade';
import { GradeModal } from '@/components/ejercicio/GradeModal';
import { ExplanationModal } from '@/components/ejercicio/ExplanationModal';

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

const getPlainValue = (value: string | string[] | boolean | undefined): string => {
  if (!value || value === true) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.join(' ');
  return '';
};

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
    !isPreguntaBe && !isPreguntaGeneral && !sentence.wh && !sentence.aux && !sentence.adverbio &&
    sentence.sujeto && sentence.verbo && sentence.complemento;
  const isAdverbioSentence = !isPreguntaBe && !isNormalSentence && !isPreguntaGeneral && sentence.adverbio;

  if (isNormalSentence) return `${sentence.sujeto} ${sentence.verbo} ${complemento}`.trim();
  if (isPreguntaBe) return `${wh} ${sentence.verbo} ${sentence.sujeto} ${complemento}`.trim();
  if (isPreguntaGeneral) return `${wh} ${sentence.aux} ${sentence.sujeto} ${sentence.verbo} ${complemento}`.trim();
  if (isAdverbioSentence) return `${sentence.adverbio} ${sentence.sujeto} ${sentence.verbo} ${complemento}`.trim();

  return '';
};

const getSujObj = (sentence: SentenceData, n?: number): SentenceData => ({
  wh: !n ? sentence.wh : sentence[`wh${n}`] || sentence.wh,
  adverbio: !n ? sentence.adverbio : sentence[`adverbio${n}`] || sentence.adverbio,
  aux: !n ? sentence.aux : sentence[`aux${n}`] || sentence.aux,
  sujeto: !n ? sentence.sujeto : sentence[`sujeto${n}`] || sentence.sujeto,
  verbo: !n ? sentence.verbo : sentence[`verbo${n}`] || sentence.verbo,
  complemento: !n ? sentence.complemento : sentence[`complemento${n}`] || sentence.complemento,
});

const checkAnswerType6 = (userAnswer: string, sentence: SentenceData): number => {
  const normalized = normalizeAnswer(userAnswer);
  if (!normalized) return 0;

  if (sentence.answer) {
    const validAnswers: string[] = [];
    for (let i = 0; i <= 20; i++) {
      const key = i === 0 ? 'answer' : `answer${i}`;
      if (sentence[key]) validAnswers.push(normalizeAnswer(sentence[key]));
    }
    return validAnswers.includes(normalized) ? 1 : 0;
  }

  if (sentence.sujeto) {
    for (let i = 0; i <= 12; i++) {
      const sujObj = getSujObj(sentence, i === 0 ? undefined : i);
      const correctAnswer = getAnswer(sujObj);
      if (correctAnswer && normalizeAnswer(correctAnswer) === normalized) return 1;
    }
    
    const mainAnswer = getAnswer(sentence);
    if (mainAnswer) {
      const mainNorm = normalizeAnswer(mainAnswer);
      const words = mainNorm.split(' ').filter(w => w);
      const userWords = normalized.split(' ').filter(w => w);
      let matches = 0;
      userWords.forEach(uw => { if (words.includes(uw)) matches++; });
      if (words.length > 0) return matches / words.length;
    }
  }

  return 0;
};

export function Eje6({ exercise: initialExercise }: Eje6Props) {
  const [verified, setVerified] = useState(false);
  const [selectState, setSelectState] = useState<(number | null)[]>([]);
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [explanationModalOpen, setExplanationModalOpen] = useState(false);
  const [currentExplanation, setCurrentExplanation] = useState('');
  const [loading, setLoading] = useState(true);

  const exercise = initialExercise as Type6Exercise;

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
    if (!isType6Exercise(initialExercise)) return;

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

  const isShown = (index: number): boolean => !!exercise.sentences[index]?.shown;

  const shouldShowAnswer = () => verified && selectState.some((x) => x !== null && x < 1);

  const handleVerify = () => {
    const results: number[] = [];

    exercise.sentences.forEach((s, i) => {
      if (s.shown) { results.push(1); return; }
      const score = checkAnswerType6(responses[i] || '', s);
      results.push(score);
    });

    setSelectState(results);
    setVerified(true);

    const computableResults = results.filter((_, i) => !isShown(i));
    const total = computableResults.length;
    const gradeTotal = computableResults.reduce((a, b) => a + b, 0);
    const gradeValue = total > 0 ? gradeTotal / total : 1;

    openGradeModal(gradeValue);
  };

  const handleSaveAndContinue = async () => { await saveGrade(true); };
  const handleSaveAndBack = async () => { await saveGrade(false); };

  const showExplanation = (text?: string) => {
    if (text) { setCurrentExplanation(text); setExplanationModalOpen(true); }
  };

  const getColor = (score: number | null): string => {
    if (score === null) return 'hsl(var(--border))';
    return score >= 0.6 ? '#22c55e' : '#ef4444';
  };

  const getBackgroundColor = (score: number | null): string => {
    if (score === null) return 'transparent';
    return score >= 0.6 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)';
  };

  if (loading) { return <DashboardLoader />; }

  const renderSentence = (sentence: SentenceData, i: number, removeBorder: boolean = false) => {
    const stateI = selectState[i];
    const isCorrect = stateI !== null && stateI >= 0.6;

    return (
      <div
        key={i}
        className={`flex flex-col md:flex-row md:items-center gap-2 sm:gap-3 p-3 sm:p-4 ${
          !removeBorder ? 'border border-border rounded-lg bg-card' : ''
        }`}
      >
        {verified && (
          <div className="flex-shrink-0">
            {isCorrect ? <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" /> : <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />}
          </div>
        )}

        <p className="flex-1 min-w-0 font-medium text-foreground text-sm sm:text-base">{sentence.sentence}</p>

        <div className="flex flex-col gap-1 flex-shrink-0 w-full md:w-auto">
          {sentence.shown ? (
            <p className="font-normal text-muted-foreground px-2 sm:px-3 py-1.5 sm:py-2 bg-muted rounded text-xs sm:text-sm">{sentence.answer}</p>
          ) : exercise.options ? (
            <Select value={responses[i] || ''} onValueChange={(value) => handleChange(i, value)} disabled={verified}>
              <SelectTrigger
                className="w-full md:w-[180px] text-xs sm:text-sm h-8 sm:h-10"
                style={{ borderColor: getColor(stateI), borderWidth: verified ? '2px' : '1px', backgroundColor: getBackgroundColor(stateI) }}
              >
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                {exercise.options.map((option, optIndex) => {
                  const optionValue = typeof option === 'string' ? option : (option as any).text || '';
                  return <SelectItem key={optIndex} value={optionValue}>{optionValue}</SelectItem>;
                })}
              </SelectContent>
            </Select>
          ) : (
            <Input
              value={responses[i] || ''}
              onChange={(e) => handleChange(i, e.target.value)}
              disabled={verified}
              className="w-full md:w-[220px] text-xs sm:text-sm h-8 sm:h-10"
              style={{ borderColor: getColor(stateI), borderWidth: verified ? '2px' : '1px', backgroundColor: getBackgroundColor(stateI) }}
            />
          )}

          {shouldShowAnswer() && !sentence.shown && stateI !== null && stateI < 1 && (
            <span
              className="text-[10px] sm:text-sm font-semibold cursor-pointer hover:underline"
              style={{ color: isCorrect ? '#22c55e' : '#ef4444' }}
              onClick={() => showExplanation(sentence.explanation)}
            >
              {getAnswer(sentence)}
            </span>
          )}
        </div>

        {verified && sentence.explanation && (
          <button onClick={() => showExplanation(sentence.explanation)} className="flex-shrink-0 text-blue-600 hover:text-blue-700">
            <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Image - Responsive */}
      <div className="w-full h-32 sm:h-40 md:h-48 bg-cover bg-center" style={{ backgroundImage: 'url(/ejercicio/grammar.png)' }}>
        <div className="h-full flex items-center justify-end px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white drop-shadow-lg">{exercise.skill}</h1>
        </div>
      </div>

      {/* Content - Responsive */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 max-w-4xl">
        <div className="mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2">{exercise.title}</h2>
          {exercise.description && <p className="text-sm sm:text-base text-muted-foreground whitespace-pre-wrap">{exercise.description}</p>}
        </div>

        {/* Sentences - Responsive */}
        <div className="space-y-3 sm:space-y-4">
          {exercise.sentences.map((s, i, arr) => {
            const sentence = s as any;
            const prevSentence = i !== 0 ? (arr[i - 1] as any) : null;
            if (prevSentence?.complementar) return null;

            if (sentence.complementar) {
              return (
                <div key={`comp-${i}`} className="border-2 border-primary/30 rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3">
                  <p className="text-xs sm:text-sm font-semibold text-foreground">{sentence.complementar}</p>
                  {renderSentence(sentence, i, true)}
                  {arr[i + 1] && renderSentence(arr[i + 1] as any, i + 1, true)}
                </div>
              );
            }

            return renderSentence(sentence, i);
          })}
        </div>

        {/* Action Buttons - Responsive */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-6 sm:mt-8">
          <Button onClick={handleReset} variant="outline" className="w-full sm:w-auto gap-2">
            <RotateCcw className="h-4 w-4" /> Reintentar
          </Button>
          <Button onClick={handleVerify} className="w-full sm:w-auto gap-2" disabled={verified}>
            <Check className="h-4 w-4" /> Verificar
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
      <ExplanationModal open={explanationModalOpen} onOpenChange={setExplanationModalOpen} explanation={currentExplanation} />
    </div>
  );
}

export default Eje6;
