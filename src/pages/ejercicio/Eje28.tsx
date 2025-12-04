import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { HelpCircle, CheckCircle2, XCircle } from 'lucide-react';
import { GradeModal } from '@/components/ejercicio/GradeModal';
import { ExplanationModal } from '@/components/ejercicio/ExplanationModal';
import { useExerciseGrade } from '@/hooks/useExerciseGrade';
import DashboardLoader from '@/components/dashboard/DashboardLoader';
import { normalizeAnswer } from '@/lib/exerciseUtils';
import { toast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

const TIEMPO_ACCIONES = {
  pasado: 'Pasada',
  presente: 'Presente',
  futuro: 'Futura',
};

const ALL_VERB_TENSES = [
  { verb: false, gerund: false, time: 'Pasada', tense: 'Past Simple' },
  { verb: false, gerund: false, time: 'Presente', tense: 'Present Simple' },
  { verb: false, gerund: false, time: 'Futura', tense: 'Future Simple' },
  { verb: false, gerund: true, time: 'Pasada', tense: 'Past Continuous' },
  { verb: false, gerund: true, time: 'Presente', tense: 'Present Continuous' },
  { verb: false, gerund: true, time: 'Futura', tense: 'Future Continuous' },
  { verb: true, gerund: false, time: 'Pasada', tense: 'Past Perfect Simple' },
  { verb: true, gerund: false, time: 'Presente', tense: 'Present Perfect Simple' },
  { verb: true, gerund: false, time: 'Futura', tense: 'Future Perfect Simple' },
  { verb: true, gerund: true, time: 'Pasada', tense: 'Past Perfect Continuous' },
  { verb: true, gerund: true, time: 'Presente', tense: 'Present Perfect Continuous' },
  { verb: true, gerund: true, time: 'Futura', tense: 'Future Perfect Continuous' },
];

interface Type28Exercise {
  _id: string;
  skill?: string;
  type: number;
  number: number;
  unidad: number;
  title: string;
  description: string;
  sentence: string;
  answer: string;
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

interface Eje28Props {
  exercise: any;
}

export function Eje28({ exercise: initialExercise }: Eje28Props) {
  const { id } = useParams();
  const isMobile = useIsMobile();
  const [exercise, setExercise] = useState<Type28Exercise | null>(initialExercise);
  
  const [llevaVerbo, setLlevaVerbo] = useState<boolean | null>(null);
  const [llevaGerundio, setLlevaGerundio] = useState<boolean | null>(null);
  const [tiempoAccion, setTiempoAccion] = useState<string | null>(null);
  
  const [selected, setSelected] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const [result, setResult] = useState<boolean | null>(null);
  
  const [explanationModalOpen, setExplanationModalOpen] = useState(false);

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
    setLlevaGerundio(null);
  }, [llevaVerbo]);

  useEffect(() => {
    setTiempoAccion(null);
  }, [llevaGerundio]);

  useEffect(() => {
    setSelected(null);
  }, [tiempoAccion]);

  const checkAnswerType28 = (userAnswer: string): boolean => {
    if (!exercise) return false;
    
    const normalizedUser = normalizeAnswer(userAnswer);
    const correctAnswers = [
      exercise.answer,
      exercise.answer2,
      exercise.answer3,
      exercise.answer4,
      exercise.answer5,
      exercise.answer6,
      exercise.answer7,
      exercise.answer8,
      exercise.answer9,
      exercise.answer10,
      exercise.answer11,
      exercise.answer12,
    ].filter(Boolean);

    return correctAnswers.some(
      (answer) => normalizeAnswer(answer as string) === normalizedUser
    );
  };

  const getFilteredTenses = (): string[] => {
    return ALL_VERB_TENSES.filter((t) => {
      if (llevaVerbo !== null && t.verb !== llevaVerbo) return false;
      if (llevaGerundio !== null && t.gerund !== llevaGerundio) return false;
      if (tiempoAccion !== null && t.time !== tiempoAccion) return false;
      return true;
    }).map((t) => t.tense);
  };

  const handleVerify = () => {
    if (!selected) {
      toast({
        title: 'Selección requerida',
        description: 'Por favor selecciona un tiempo verbal',
        variant: 'destructive',
      });
      return;
    }

    const isCorrect = checkAnswerType28(selected);
    setResult(isCorrect);
    setVerified(true);
    
    // Grade is 1 (correct) or 0 (incorrect) - binary
    openGradeModal(isCorrect ? 1 : 0);
  };

  const handleReset = () => {
    setLlevaVerbo(null);
    setLlevaGerundio(null);
    setTiempoAccion(null);
    setSelected(null);
    setResult(null);
    setVerified(false);
  };

  const showExplanation = () => {
    if (exercise?.explanation) {
      setExplanationModalOpen(true);
    }
  };

  if (!exercise) {
    return <DashboardLoader />;
  }

  const filteredTenses = getFilteredTenses();

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Hero Image */}
      <div className="relative w-full h-32 sm:h-40 md:h-48 rounded-lg overflow-hidden">
        <img
          src="/ejercicio/grammar.png"
          alt="Grammar"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex items-center justify-end px-4 sm:px-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white drop-shadow-lg">{exercise.skill || 'Grammar'}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold mb-2">{exercise.title}</h2>
          <p className="text-sm sm:text-base text-muted-foreground" dangerouslySetInnerHTML={{ __html: exercise.description }} />
        </div>

        {/* Sentence Card */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-center gap-3 sm:gap-4">
              <p className="text-base sm:text-xl text-center font-medium italic">
                "{exercise.sentence}"
              </p>
              {verified && exercise.explanation && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary shrink-0"
                  onClick={showExplanation}
                >
                  <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Questions Section */}
        <div className="space-y-3 sm:space-y-4">
          {/* Question 1: ¿Lleva verbo? */}
          <Card>
            <CardContent className="p-3 sm:p-4">
              <p className="font-medium mb-2 sm:mb-3 text-sm sm:text-base">
                ¿Lleva el verbo <span className="text-primary font-bold">acabar de</span> / <span className="text-primary font-bold">haber</span> / <span className="text-primary font-bold">llevar</span>?
              </p>
              <div className="flex gap-4 sm:gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={llevaVerbo === true}
                    onCheckedChange={(checked) => setLlevaVerbo(checked ? true : null)}
                    disabled={verified}
                  />
                  <span className="text-sm sm:text-base">Sí</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={llevaVerbo === false}
                    onCheckedChange={(checked) => setLlevaVerbo(checked ? false : null)}
                    disabled={verified}
                  />
                  <span className="text-sm sm:text-base">No</span>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Question 2: ¿Lleva gerundio? */}
          {llevaVerbo !== null && (
            <Card className="animate-in fade-in slide-in-from-top-2 duration-300">
              <CardContent className="p-3 sm:p-4">
                <p className="font-medium mb-2 sm:mb-3 text-sm sm:text-base">¿Lleva gerundio?</p>
                <div className="flex gap-4 sm:gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={llevaGerundio === true}
                      onCheckedChange={(checked) => setLlevaGerundio(checked ? true : null)}
                      disabled={verified}
                    />
                    <span className="text-sm sm:text-base">Sí</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={llevaGerundio === false}
                      onCheckedChange={(checked) => setLlevaGerundio(checked ? false : null)}
                      disabled={verified}
                    />
                    <span className="text-sm sm:text-base">No</span>
                  </label>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Question 3: ¿Tiempo de acción? */}
          {llevaGerundio !== null && (
            <Card className="animate-in fade-in slide-in-from-top-2 duration-300">
              <CardContent className="p-3 sm:p-4">
                <p className="font-medium mb-2 sm:mb-3 text-sm sm:text-base">
                  ¿La acción es <span className="text-primary font-bold">pasada</span>, <span className="text-primary font-bold">presente</span> o <span className="text-primary font-bold">futura</span>?
                </p>
                <div className="flex gap-3 sm:gap-6 flex-wrap">
                  {Object.values(TIEMPO_ACCIONES).map((tiempo) => (
                    <label key={tiempo} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={tiempoAccion === tiempo}
                        onCheckedChange={(checked) => setTiempoAccion(checked ? tiempo : null)}
                        disabled={verified}
                      />
                      <span className="text-sm sm:text-base">{tiempo}</span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Verb Tenses Grid */}
        <div className={`grid gap-2 sm:gap-3 ${
          isMobile 
            ? 'grid-cols-2' 
            : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
        }`}>
          {filteredTenses.map((tense) => {
            const isSelected = selected === tense;
            const isCorrect = verified && result && isSelected;
            const isIncorrect = verified && !result && isSelected;
            const isCorrectAnswer = verified && !result && checkAnswerType28(tense);

            return (
              <button
                key={tense}
                onClick={() => !verified && setSelected(tense)}
                disabled={verified}
                className={`
                  p-3 sm:p-4 rounded-lg border-2 text-xs sm:text-sm font-medium transition-all duration-200
                  ${isSelected && !verified ? 'border-primary bg-primary/10 scale-105' : 'border-border'}
                  ${isCorrect ? 'border-green-500 bg-green-100 dark:bg-green-950/30' : ''}
                  ${isIncorrect ? 'border-red-500 bg-red-100 dark:bg-red-950/30' : ''}
                  ${isCorrectAnswer ? 'border-green-500 bg-green-100 dark:bg-green-950/30 ring-2 ring-green-500' : ''}
                  ${!verified && !isSelected ? 'hover:border-primary/50 hover:bg-muted/50' : ''}
                  disabled:cursor-not-allowed
                `}
              >
                <div className="flex items-center justify-center gap-1 sm:gap-2">
                  {isCorrect && <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 shrink-0" />}
                  {isIncorrect && <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 shrink-0" />}
                  {isCorrectAnswer && <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 shrink-0" />}
                  <span className="truncate">{tense}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Show correct answer if wrong */}
        {verified && !result && (
          <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
            <CardContent className="p-3 sm:p-4">
              <p className="text-green-700 dark:text-green-400 font-medium text-sm sm:text-base">
                Respuesta correcta: <span className="font-bold">{exercise.answer}</span>
              </p>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center">
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
            disabled={verified || !selected}
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
        onGoBack={handleGoBack}
        onNextExercise={handleNextExercise}
      />

      {/* Explanation Modal */}
      <ExplanationModal
        open={explanationModalOpen}
        onOpenChange={setExplanationModalOpen}
        explanation={exercise?.explanation || ''}
      />
    </div>
  );
}
