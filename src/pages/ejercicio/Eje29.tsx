import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Lightbulb, Volume2, MessageCircle } from 'lucide-react';
import { postUserGrade, postUserPosition } from '@/lib/api';
import { toast } from 'sonner';
import { Calculate_index_exercise } from '@/hooks/calculate_index';
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

// Helper to get plain value (remove accents/normalize)
const getPlainValue = (text: string): string => {
  if (!text) return '';
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
};

// Build answer from sentence structure
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

// Get subject object for alternative N
const getSujObj = (sentence: Sentence, n?: number) => ({
  wh: !n ? sentence.wh : (sentence as any)[`wh${n}`] || sentence.wh,
  adverbio: !n ? sentence.adverbio : (sentence as any)[`adverbio${n}`] || sentence.adverbio,
  aux: !n ? sentence.aux : (sentence as any)[`aux${n}`] || sentence.aux,
  sujeto: !n ? sentence.sujeto : (sentence as any)[`sujeto${n}`] || sentence.sujeto,
  verbo: !n ? sentence.verbo : (sentence as any)[`verbo${n}`] || sentence.verbo,
  complemento: !n ? sentence.complemento : (sentence as any)[`complemento${n}`] || sentence.complemento,
  pregunta: sentence.pregunta,
});

// Check answer with weighted scoring for S+V+C
const checkAnswerType29 = (
  userAnswer: string,
  sentence: Sentence
): number => {
  const normalizedUser = getPlainValue(userAnswer);
  
  // If has direct answer, check against it
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

  // Check with S+V+C structure (weighted)
  // Build alternatives 1-12
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
    
    // Weighted scoring
    const userWords = normalizedUser.split(/\s+/);
    const expectedWords = getPlainValue(expectedAnswer).split(/\s+/);
    
    // Check S+V+C components separately
    const sujeto = getPlainValue(alt.sujeto || '');
    const verbo = getPlainValue(alt.verbo || '');
    const complemento = getPlainValue(alt.complemento || '');
    
    let score = 0;
    let total = 0;
    
    // Weight: Sujeto 30%, Verbo 45%, Complemento 25%
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

const getColor = (target: number | boolean | null): string => {
  if (target === null) return 'gray';
  if (typeof target === 'number') {
    return target > 0.6 ? 'green' : 'red';
  }
  return target ? 'green' : 'red';
};

export const Eje29 = ({ exercise: initialExercise }: Eje29Props) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const [exercise, setExercise] = useState<Type29Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [selectState, setSelectState] = useState<(number | null)[]>([]);
  const [verified, setVerified] = useState(false);
  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [grade, setGrade] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [explanationModalOpen, setExplanationModalOpen] = useState(false);
  const [currentExplanation, setCurrentExplanation] = useState('');

  // Initialize exercise
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

    // Calculate grade excluding shown
    const computableResults = results.filter((_, i) => !isShown(i));
    const total = computableResults.length;
    const gradeTotal = computableResults.reduce((a, b) => a + b, 0);
    const calculatedGrade = total > 0 ? gradeTotal / total : 1;

    setGrade(calculatedGrade);
    setGradeModalOpen(true);
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

  const handleSaveGrade = async () => {
    if (!exercise) return;
    setIsSubmitting(true);

    try {
      const position = await Calculate_index_exercise(exercise);
      await postUserGrade(exercise._id, grade, String(exercise.unidad));
      await postUserPosition({ unidad: exercise.unidad, position });

      toast.success('Progreso guardado correctamente');
      setGradeModalOpen(false);
      navigate(-1);
    } catch (error) {
      console.error('Error saving grade:', error);
      toast.error('Error al guardar el progreso');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextExercise = async () => {
    if (!exercise) return;
    setIsSubmitting(true);

    try {
      const position = await Calculate_index_exercise(exercise);
      await postUserGrade(exercise._id, grade, String(exercise.unidad));
      await postUserPosition({ unidad: exercise.unidad, position });

      const nextNumber = exercise.number + 1;
      navigate(`/ejercicio/${id}?exerciseIndex=${nextNumber}`);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al continuar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    setGradeModalOpen(false);
    navigate(-1);
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

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 1) return 'Perfecto';
    if (score >= 0.8) return 'Excelente';
    if (score >= 0.6) return 'Bien';
    if (score >= 0.4) return 'Regular';
    return 'Incorrecto';
  };

  if (loading || !exercise) {
    return <DashboardLoader />;
  }

  // Group sentences by complementar
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
        // Group two sentences together
        elements.push(
          <Card key={`group-${i}`} className="border-2 border-primary/30">
            <CardContent className="p-4">
              <p className="text-sm font-semibold text-primary mb-4">{sentence.complementar}</p>
              <div className="space-y-4">
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
    <div className="space-y-6">
      {/* Hero Image */}
      <div className="relative w-full h-48 rounded-lg overflow-hidden">
        <img
          src="/ejercicio/grammar.png"
          alt="Vocabulary"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
          <div className="px-6">
            <h1 className="text-2xl md:text-3xl font-bold text-white">{exercise.title || 'Traducción'}</h1>
            {exercise.skill && (
              <span className="inline-block mt-2 px-3 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm">
                {exercise.skill}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {exercise.description && (
        <div
          className="text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: exercise.description }}
        />
      )}

      {/* Vocabulary Info */}
      {(exercise.vocabularyType || exercise.vocabularyLevel || exercise.explanation || exercise.example) && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 space-y-4">
            {(exercise.vocabularyType || exercise.vocabularyLevel) && (
              <p className="text-sm">
                Este vocabulario es de tipo <span className="font-bold">{exercise.vocabularyType}</span> y pertenece al nivel <span className="font-bold">{exercise.vocabularyLevel}</span>.
              </p>
            )}
            
            {exercise.explanation && (
              <div className="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <Lightbulb className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="font-medium text-sm">{exercise.explanation}</p>
              </div>
            )}
            
            {exercise.example && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Veamos un ejemplo:</p>
                <p className="font-medium italic">{exercise.example}</p>
              </div>
            )}
            
            <p className="text-sm font-medium text-primary">Ahora, ejercitemos:</p>
          </CardContent>
        </Card>
      )}

      {/* Audio Player */}
      {exercise.audio && (
        <Card>
          <CardContent className="p-4">
            <audio controls className="w-full">
              <source src={exercise.audio} type="audio/mpeg" />
              Tu navegador no soporta audio.
            </audio>
          </CardContent>
        </Card>
      )}

      {/* Sentences */}
      <div className="space-y-4">
        {renderSentences()}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <Button variant="outline" onClick={handleReset} disabled={!verified}>
          Reintentar
        </Button>
        <Button onClick={handleVerify} disabled={verified}>
          Verificar
        </Button>
      </div>

      {/* Grade Modal */}
      <Dialog open={gradeModalOpen} onOpenChange={setGradeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resultado del Ejercicio</DialogTitle>
            <DialogDescription>Tu puntuación en este ejercicio</DialogDescription>
          </DialogHeader>

          <div className="py-6 text-center">
            <div className={`text-6xl font-bold mb-2 ${
              grade >= 0.7 ? 'text-green-500' : grade >= 0.4 ? 'text-yellow-500' : 'text-red-500'
            }`}>
              {Math.round(grade * 100)}%
            </div>
            <p className="text-muted-foreground">
              {grade >= 0.9 ? '¡Excelente trabajo!' :
               grade >= 0.7 ? '¡Muy bien!' :
               grade >= 0.5 ? 'Buen intento, sigue practicando' :
               'Necesitas más práctica'}
            </p>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setGradeModalOpen(false)}
              className="w-full sm:w-auto"
            >
              Cerrar
            </Button>
            <Button
              variant="outline"
              onClick={handleGoBack}
              className="w-full sm:w-auto"
            >
              Volver al Menú
            </Button>
            <Button
              onClick={handleNextExercise}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? 'Cargando...' : 'Siguiente Ejercicio'}
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
          <p className="text-muted-foreground">{currentExplanation}</p>
          <DialogFooter>
            <Button onClick={() => setExplanationModalOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Sentence Row Component
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
  const borderColor = score === null ? 'border-input' : 
    score >= 0.6 ? 'border-green-500' : 'border-red-500';
  const bgColor = score === null ? '' : 
    score >= 0.6 ? 'bg-green-50 dark:bg-green-950/20' : 'bg-red-50 dark:bg-red-950/20';

  return (
    <Card className={`${borderColor} border-2 transition-colors`}>
      <CardContent className={`p-4 ${isMobile ? 'space-y-3' : 'flex items-center gap-4'}`}>
        {/* Spanish sentence */}
        <p className={`font-medium ${isMobile ? 'text-base' : 'flex-1 min-w-[200px]'}`}>
          {sentence.sentence}
        </p>

        {/* Input/Select area */}
        <div className={`${isMobile ? 'w-full' : 'w-[40%]'} space-y-2`}>
          {sentence.shown ? (
            <p className="text-muted-foreground italic py-2">{sentence.answer}</p>
          ) : options ? (
            <Select
              value={responses[index] || ''}
              onValueChange={(value) => onChange(index, value)}
              disabled={verified}
            >
              <SelectTrigger className={`${bgColor}`}>
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              value={responses[index] || ''}
              onChange={(e) => onChange(index, e.target.value)}
              disabled={verified}
              placeholder="Escribe la traducción..."
              className={`${bgColor}`}
            />
          )}

          {/* Show correct answer */}
          {shouldShowAnswer && !sentence.shown && (
            <div 
              className={`text-sm flex items-center gap-2 cursor-pointer ${
                (score ?? 0) >= 0.6 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}
              onClick={() => showExplanation(sentence.explanation)}
            >
              <span className="font-medium">{getAnswer(sentence)}</span>
              {sentence.explanation && (
                <MessageCircle className="h-4 w-4" />
              )}
            </div>
          )}

          {/* Score indicator */}
          {verified && !sentence.shown && score !== null && (
            <div className={`text-xs ${
              score >= 0.6 ? 'text-green-600' : 'text-red-600'
            }`}>
              {Math.round(score * 100)}% - {score >= 1 ? 'Perfecto' : score >= 0.6 ? 'Bien' : 'Incorrecto'}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Eje29;
