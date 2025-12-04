import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Lightbulb, Volume2, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';
import { GradeModal } from '@/components/ejercicio/GradeModal';
import { ExplanationModal } from '@/components/ejercicio/ExplanationModal';
import { useExerciseGrade } from '@/hooks/useExerciseGrade';
import DashboardLoader from '@/components/dashboard/DashboardLoader';
import { useIsMobile } from '@/hooks/use-mobile';

interface Sentence {
  sentence: string;
  shown?: boolean;
  answer?: string;
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
  sujeto?: string;
  sujeto2?: string;
  sujeto3?: string;
  sujeto4?: string;
  verbo?: string;
  verbo2?: string;
  verbo3?: string;
  verbo4?: string;
  complemento?: string;
  complemento2?: string;
  complemento3?: string;
  complemento4?: string;
  adverbio?: string;
  adverbio2?: string;
  aux?: string;
  aux2?: string;
  wh?: string;
  wh2?: string;
  pregunta?: 'be' | 'general';
  explanation?: string;
  complementar?: string;
}

interface Type29Exercise {
  _id: string;
  type: number;
  number: number;
  unidad: number;
  title?: string;
  description?: string;
  skill?: string;
  vocabularyType?: string;
  vocabularyLevel?: string;
  explanation?: string;
  example?: string;
  audio?: string;
  options?: string[];
  sentences: Sentence[];
}

interface Eje29Props {
  exercise: Type29Exercise | any;
}

const getPlainValue = (text: string): string => {
  if (!text) return '';
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
};

const getAnswer = (sentence: Sentence): string => {
  if (sentence?.answer) return getPlainValue(sentence.answer);

  const complemento =
    sentence.complemento && sentence.complemento !== 'N/A'
      ? getPlainValue(sentence.complemento)
      : '';

  const wh = sentence.wh ?? '';

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

  return 'Error: no matching rule';
};

const getSujObj = (sentence: Sentence, n?: number) => ({
  wh: !n ? sentence.wh : (sentence as any)[`wh${n}`] || sentence.wh,
  adverbio: !n ? sentence.adverbio : (sentence as any)[`adverbio${n}`] || sentence.adverbio,
  aux: !n ? sentence.aux : (sentence as any)[`aux${n}`] || sentence.aux,
  sujeto: !n ? sentence.sujeto : (sentence as any)[`sujeto${n}`] || sentence.sujeto,
  verbo: !n ? sentence.verbo : (sentence as any)[`verbo${n}`] || sentence.verbo,
  complemento: !n ? sentence.complemento : (sentence as any)[`complemento${n}`] || sentence.complemento,
  pregunta: sentence.pregunta,
});

const checkAnswerType29 = (userAnswer: string, sentence: Sentence): number => {
  const normalizedUser = getPlainValue(userAnswer);
  
  if (!sentence.sujeto && sentence.answer) {
    const alternatives = [
      sentence.answer, sentence.answer2, sentence.answer3, sentence.answer4,
      sentence.answer5, sentence.answer6, sentence.answer7, sentence.answer8,
      sentence.answer9, sentence.answer10, sentence.answer11, sentence.answer12
    ].filter(Boolean);
    
    for (const alt of alternatives) {
      if (getPlainValue(alt!) === normalizedUser) return 1;
    }
    return 0;
  }

  const alternatives = [];
  for (let i = 0; i <= 12; i++) {
    const obj = getSujObj(sentence, i || undefined);
    if (obj.sujeto || obj.verbo) {
      alternatives.push(obj);
    }
  }

  let bestScore = 0;
  
  for (const alt of alternatives) {
    const expectedAnswer = getAnswer({ ...sentence, ...alt } as Sentence);
    
    if (getPlainValue(expectedAnswer) === normalizedUser) {
      return 1;
    }
    
    const sujeto = getPlainValue(alt.sujeto || '');
    const verbo = getPlainValue(alt.verbo || '');
    const complemento = getPlainValue(alt.complemento || '');
    
    let score = 0;
    let total = 0;
    
    if (sujeto) {
      total += 0.3;
      if (normalizedUser.includes(sujeto)) score += 0.3;
    }
    if (verbo) {
      total += 0.45;
      if (normalizedUser.includes(verbo)) score += 0.45;
    }
    if (complemento && complemento !== 'n/a') {
      total += 0.25;
      if (normalizedUser.includes(complemento)) score += 0.25;
    }
    
    const partialScore = total > 0 ? score / total : 0;
    if (partialScore > bestScore) bestScore = partialScore;
  }
  
  return bestScore;
};

const getColor = (target: number | null): string => {
  if (target === null) return 'gray';
  return target > 0.6 ? 'green' : 'red';
};

interface SentenceRowProps {
  sentence: Sentence;
  index: number;
  responses: Record<number, string>;
  selectState: (number | null)[];
  verified: boolean;
  options?: string[];
  onChange: (index: number, value: string) => void;
  showExplanation: (text?: string) => void;
  shouldShowAnswer: boolean;
  isMobile: boolean;
}

const SentenceRow = ({
  sentence,
  index,
  responses,
  selectState,
  verified,
  options,
  onChange,
  showExplanation,
  shouldShowAnswer,
  isMobile,
}: SentenceRowProps) => {
  const score = selectState[index];
  const color = getColor(score);
  const expectedAnswer = getAnswer(sentence);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  };

  if (sentence.shown) {
    return (
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 py-2 sm:py-3 items-start sm:items-center">
        <p className="flex-1 text-sm sm:text-base text-foreground">{sentence.sentence}</p>
        <div className="flex items-center gap-2">
          <div className="px-3 py-2 rounded-md border-2 border-green-500 bg-green-50 dark:bg-green-900/20 text-sm">
            {sentence.answer || expectedAnswer}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => speakText(sentence.answer || expectedAnswer)}
          >
            <Volume2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className={`${
      verified && color === 'green'
        ? 'border-green-500 bg-green-50/50 dark:bg-green-900/10'
        : verified && color === 'red'
          ? 'border-red-500 bg-red-50/50 dark:bg-red-900/10'
          : ''
    }`}>
      <CardContent className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start sm:items-center">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className={`flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full text-xs sm:text-sm font-bold shrink-0 ${
              verified && color === 'green'
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : verified && color === 'red'
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  : 'bg-muted text-muted-foreground'
            }`}>
              {index + 1}
            </span>
            <p className="text-sm sm:text-base text-foreground">{sentence.sentence}</p>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {options && options.length > 0 ? (
              <Select
                value={responses[index] || ''}
                onValueChange={(value) => onChange(index, value)}
                disabled={verified}
              >
                <SelectTrigger className={`w-full sm:w-[180px] text-sm ${
                  verified
                    ? color === 'green'
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : ''
                }`}>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {options.map((opt) => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                value={responses[index] || ''}
                onChange={(e) => onChange(index, e.target.value)}
                disabled={verified}
                placeholder="Escribe tu respuesta"
                className={`flex-1 sm:min-w-[200px] text-sm ${
                  verified
                    ? color === 'green'
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : ''
                }`}
              />
            )}
            
            {verified && (
              score !== null && score > 0.6 ? (
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500 shrink-0" />
              )
            )}
          </div>
        </div>

        {/* Score and correct answer */}
        {verified && score !== null && (
          <div className="mt-2 ml-8 sm:ml-9 flex flex-wrap items-center gap-2">
            <span className={`text-xs font-medium ${
              color === 'green' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {Math.round(score * 100)}%
            </span>
            {shouldShowAnswer && score < 1 && (
              <span 
                className="text-xs text-red-600 dark:text-red-400 cursor-pointer flex items-center gap-1"
                onClick={() => showExplanation(sentence.explanation)}
              >
                Correcto: {sentence.answer || expectedAnswer}
                {sentence.explanation && <HelpCircle className="h-3 w-3" />}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const Eje29 = ({ exercise: initialExercise }: Eje29Props) => {
  const { id } = useParams();
  const isMobile = useIsMobile();
  
  const [exercise, setExercise] = useState<Type29Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [selectState, setSelectState] = useState<(number | null)[]>([]);
  const [verified, setVerified] = useState(false);
  const [explanationModalOpen, setExplanationModalOpen] = useState(false);
  const [currentExplanation, setCurrentExplanation] = useState('');

  const {
    grade,
    gradeModalOpen,
    saving,
    setGradeModalOpen,
    openGradeModal,
    handleClose,
    handleGoBack,
    handleNextExercise,
  } = useExerciseGrade({
    exerciseId: exercise?._id || '',
    unidad: exercise?.unidad || Number(id) || 0,
    exerciseNumber: exercise?.number || 0,
  });

  useEffect(() => {
    if (initialExercise) {
      setExercise(initialExercise);
      
      const initialResponses: Record<number, string> = {};
      const initialStates: (number | null)[] = [];
      
      initialExercise.sentences?.forEach((_: any, i: number) => {
        initialResponses[i] = '';
        initialStates.push(null);
      });
      
      setResponses(initialResponses);
      setSelectState(initialStates);
      setLoading(false);
    }
  }, [initialExercise]);

  const handleChange = (index: number, value: string) => {
    setResponses(old => ({ ...old, [index]: value }));
  };

  const isShown = (index: number): boolean => {
    return exercise?.sentences[index]?.shown || false;
  };

  const handleVerify = () => {
    if (!exercise) return;

    const results: number[] = [];
    
    exercise.sentences.forEach((sentence, i) => {
      if (sentence.shown) {
        results.push(1);
        return;
      }
      
      const score = checkAnswerType29(responses[i] || '', sentence);
      results.push(score);
    });

    setSelectState(results);
    setVerified(true);

    const computableResults = results.filter((_, i) => !isShown(i));
    const total = computableResults.length;
    const gradeTotal = computableResults.reduce((a, b) => a + b, 0);
    const calculatedGrade = total > 0 ? gradeTotal / total : 1;

    openGradeModal(calculatedGrade);
  };

  const handleReset = () => {
    if (!exercise) return;
    
    const initialResponses: Record<number, string> = {};
    const initialStates: (number | null)[] = [];
    
    exercise.sentences.forEach((_, i) => {
      initialResponses[i] = '';
      initialStates.push(null);
    });
    
    setResponses(initialResponses);
    setSelectState(initialStates);
    setVerified(false);
  };

  const showExplanation = (text?: string) => {
    if (text) {
      setCurrentExplanation(text);
      setExplanationModalOpen(true);
    }
  };

  const shouldShowAnswer = (): boolean => {
    return verified && selectState.some(x => x !== null && x < 1);
  };

  if (loading || !exercise) {
    return <DashboardLoader />;
  }

  const renderSentences = () => {
    const elements: JSX.Element[] = [];
    let skipNext = false;

    exercise.sentences.forEach((sentence, i) => {
      if (skipNext) {
        skipNext = false;
        return;
      }

      const nextSentence = exercise.sentences[i + 1];
      
      if (sentence.complementar && nextSentence) {
        elements.push(
          <Card key={`group-${i}`} className="border-2 border-primary/30">
            <CardContent className="p-3 sm:p-4">
              <p className="text-xs sm:text-sm font-semibold text-primary mb-3 sm:mb-4">{sentence.complementar}</p>
              <div className="space-y-3 sm:space-y-4">
                <SentenceRow
                  sentence={sentence}
                  index={i}
                  responses={responses}
                  selectState={selectState}
                  verified={verified}
                  options={exercise.options}
                  onChange={handleChange}
                  showExplanation={showExplanation}
                  shouldShowAnswer={shouldShowAnswer()}
                  isMobile={isMobile}
                />
                <SentenceRow
                  sentence={nextSentence}
                  index={i + 1}
                  responses={responses}
                  selectState={selectState}
                  verified={verified}
                  options={exercise.options}
                  onChange={handleChange}
                  showExplanation={showExplanation}
                  shouldShowAnswer={shouldShowAnswer()}
                  isMobile={isMobile}
                />
              </div>
            </CardContent>
          </Card>
        );
        skipNext = true;
      } else {
        elements.push(
          <SentenceRow
            key={`sentence-${i}`}
            sentence={sentence}
            index={i}
            responses={responses}
            selectState={selectState}
            verified={verified}
            options={exercise.options}
            onChange={handleChange}
            showExplanation={showExplanation}
            shouldShowAnswer={shouldShowAnswer()}
            isMobile={isMobile}
          />
        );
      }
    });

    return elements;
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Hero Image */}
      <div className="relative w-full h-32 sm:h-40 md:h-48 rounded-lg overflow-hidden">
        <img
          src="/ejercicio/grammar.png"
          alt="Vocabulary"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
          <div className="px-4 sm:px-6">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{exercise.title || 'Traducción'}</h1>
            {exercise.skill && (
              <span className="inline-block mt-2 px-3 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full text-xs sm:text-sm">
                {exercise.skill}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {exercise.description && (
        <div
          className="text-sm sm:text-base text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: exercise.description }}
        />
      )}

      {/* Vocabulary Info */}
      {(exercise.vocabularyType || exercise.vocabularyLevel || exercise.explanation || exercise.example) && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-3 sm:p-4 space-y-3 sm:space-y-4">
            {(exercise.vocabularyType || exercise.vocabularyLevel) && (
              <p className="text-xs sm:text-sm">
                Este vocabulario es de tipo <span className="font-bold">{exercise.vocabularyType}</span> y pertenece al nivel <span className="font-bold">{exercise.vocabularyLevel}</span>.
              </p>
            )}
            
            {exercise.explanation && (
              <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-foreground">{exercise.explanation}</p>
              </div>
            )}

            {exercise.example && (
              <p className="text-xs sm:text-sm italic text-muted-foreground">
                Ejemplo: {exercise.example}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Sentences */}
      <div className="space-y-3 sm:space-y-4">
        {renderSentences()}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
        {verified && (
          <Button variant="outline" onClick={handleReset} className="w-full sm:w-auto">
            Reintentar
          </Button>
        )}
        <Button 
          onClick={verified ? () => setGradeModalOpen(true) : handleVerify} 
          size="lg"
          className="w-full sm:w-auto"
        >
          {verified ? 'Ver Calificación' : 'Verificar'}
        </Button>
      </div>

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
