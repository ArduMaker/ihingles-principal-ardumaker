import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { postUserGrade, postUserPosition } from '@/lib/api';
import { normalizeAnswer } from '@/lib/exerciseUtils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { HelpCircle, CheckCircle2, XCircle } from 'lucide-react';
import DashboardLoader from '@/components/dashboard/DashboardLoader';

const TIEMPO_ACCIONES = {
  pasado: 'Pasada',
  presente: 'Presente',
  futuro: 'Futura',
};

// All possible verb tenses
const ALL_VERB_TENSES = [
  // Without "acabar de/haber/llevar" verb
  { verb: false, gerund: false, time: 'Pasada', tense: 'Past Simple' },
  { verb: false, gerund: false, time: 'Presente', tense: 'Present Simple' },
  { verb: false, gerund: false, time: 'Futura', tense: 'Future Simple' },
  { verb: false, gerund: true, time: 'Pasada', tense: 'Past Continuous' },
  { verb: false, gerund: true, time: 'Presente', tense: 'Present Continuous' },
  { verb: false, gerund: true, time: 'Futura', tense: 'Future Continuous' },
  // With "acabar de/haber/llevar" verb
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
  const navigate = useNavigate();
  const [exercise, setExercise] = useState<Type28Exercise | null>(initialExercise);
  
  // Question states
  const [llevaVerbo, setLlevaVerbo] = useState<boolean | null>(null);
  const [llevaGerundio, setLlevaGerundio] = useState<boolean | null>(null);
  const [tiempoAccion, setTiempoAccion] = useState<string | null>(null);
  
  // Selection and result states
  const [selected, setSelected] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const [result, setResult] = useState<boolean | null>(null);
  
  // Modal states
  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [grade, setGrade] = useState(0);
  const [explanationModalOpen, setExplanationModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset gerund when verb changes
  useEffect(() => {
    setLlevaGerundio(null);
  }, [llevaVerbo]);

  // Reset time when gerund changes
  useEffect(() => {
    setTiempoAccion(null);
  }, [llevaGerundio]);

  // Reset selected when time changes
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
      // Filter by verb question
      if (llevaVerbo !== null && t.verb !== llevaVerbo) return false;
      // Filter by gerund question
      if (llevaGerundio !== null && t.gerund !== llevaGerundio) return false;
      // Filter by time question
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
    setGrade(isCorrect ? 1 : 0);
    setGradeModalOpen(true);
  };

  const handleReset = () => {
    setLlevaVerbo(null);
    setLlevaGerundio(null);
    setTiempoAccion(null);
    setSelected(null);
    setResult(null);
    setVerified(false);
  };

  const handleSaveGrade = async () => {
    if (!exercise || isSubmitting) return;

    setIsSubmitting(true);
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
    } catch (error) {
      console.error('Error saving grade:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar tu progreso',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextExercise = async () => {
    if (!exercise || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await postUserGrade(exercise._id, grade, String(exercise.unidad));
      await postUserPosition({
        unidad: Number(id),
        position: exercise.number,
      });

      const nextExerciseNumber = exercise.number + 1;
      navigate(`/ejercicio/${id}?exerciseIndex=${nextExerciseNumber}`);
    } catch (error) {
      console.error('Error saving grade:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar tu progreso',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = async () => {
    if (!exercise || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await postUserGrade(exercise._id, grade, String(exercise.unidad));
      await postUserPosition({
        unidad: Number(id),
        position: exercise.number,
      });

      setGradeModalOpen(false);
      navigate(`/modulo/${id}`);
    } catch (error) {
      console.error('Error saving grade:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar tu progreso',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
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
    <div className="min-h-screen bg-background">
      {/* Hero Image */}
      <div className="w-full h-48 bg-cover bg-center" style={{ backgroundImage: 'url(/ejercicio/grammar.png)' }}>
        <div className="h-full flex items-center justify-end px-8">
          <h1 className="text-4xl font-bold text-white drop-shadow-lg">{exercise.skill || 'Grammar'}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">{exercise.title}</h2>
          <p className="text-muted-foreground mb-4" dangerouslySetInnerHTML={{ __html: exercise.description }} />
        </div>

        {/* Sentence Card */}
        <div className="bg-card rounded-lg border p-6 mb-6">
          <div className="flex items-center justify-center gap-4">
            <p className="text-xl text-center font-medium italic">
              "{exercise.sentence}"
            </p>
            {verified && exercise.explanation && (
              <Button
                variant="ghost"
                size="sm"
                className="text-primary"
                onClick={showExplanation}
              >
                <HelpCircle className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>

        {/* Questions Section */}
        <div className="space-y-6 mb-8">
          {/* Question 1: ¿Lleva verbo? */}
          <div className="bg-card rounded-lg border p-4">
            <p className="font-medium mb-3">
              ¿Lleva el verbo <span className="text-primary font-bold">acabar de</span> / <span className="text-primary font-bold">haber</span> / <span className="text-primary font-bold">llevar</span>?
            </p>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={llevaVerbo === true}
                  onCheckedChange={(checked) => setLlevaVerbo(checked ? true : null)}
                  disabled={verified}
                />
                <span>Sí</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={llevaVerbo === false}
                  onCheckedChange={(checked) => setLlevaVerbo(checked ? false : null)}
                  disabled={verified}
                />
                <span>No</span>
              </label>
            </div>
          </div>

          {/* Question 2: ¿Lleva gerundio? */}
          {llevaVerbo !== null && (
            <div className="bg-card rounded-lg border p-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <p className="font-medium mb-3">¿Lleva gerundio?</p>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={llevaGerundio === true}
                    onCheckedChange={(checked) => setLlevaGerundio(checked ? true : null)}
                    disabled={verified}
                  />
                  <span>Sí</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={llevaGerundio === false}
                    onCheckedChange={(checked) => setLlevaGerundio(checked ? false : null)}
                    disabled={verified}
                  />
                  <span>No</span>
                </label>
              </div>
            </div>
          )}

          {/* Question 3: ¿Tiempo de acción? */}
          {llevaGerundio !== null && (
            <div className="bg-card rounded-lg border p-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <p className="font-medium mb-3">
                ¿La acción es <span className="text-primary font-bold">pasada</span>, <span className="text-primary font-bold">presente</span> o <span className="text-primary font-bold">futura</span>?
              </p>
              <div className="flex gap-6 flex-wrap">
                {Object.values(TIEMPO_ACCIONES).map((tiempo) => (
                  <label key={tiempo} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={tiempoAccion === tiempo}
                      onCheckedChange={(checked) => setTiempoAccion(checked ? tiempo : null)}
                      disabled={verified}
                    />
                    <span>{tiempo}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Verb Tenses Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
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
                  p-4 rounded-lg border-2 text-sm font-medium transition-all duration-200
                  ${isSelected && !verified ? 'border-primary bg-primary/10 scale-105' : 'border-border'}
                  ${isCorrect ? 'border-green-500 bg-green-100 dark:bg-green-950/30' : ''}
                  ${isIncorrect ? 'border-red-500 bg-red-100 dark:bg-red-950/30' : ''}
                  ${isCorrectAnswer ? 'border-green-500 bg-green-100 dark:bg-green-950/30 ring-2 ring-green-500' : ''}
                  ${!verified && !isSelected ? 'hover:border-primary/50 hover:bg-muted/50' : ''}
                  disabled:cursor-not-allowed
                `}
              >
                <div className="flex items-center justify-center gap-2">
                  {isCorrect && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                  {isIncorrect && <XCircle className="h-4 w-4 text-red-600" />}
                  {isCorrectAnswer && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                  <span>{tense}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Show correct answer if wrong */}
        {verified && !result && (
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
            <p className="text-green-700 dark:text-green-400 font-medium">
              Respuesta correcta: <span className="font-bold">{exercise.answer}</span>
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={handleReset} disabled={!verified}>
            Reintentar
          </Button>
          <Button onClick={handleVerify} disabled={verified || !selected}>
            Verificar
          </Button>
        </div>
      </div>

      {/* Grade Modal */}
      <Dialog open={gradeModalOpen} onOpenChange={setGradeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resultado del ejercicio</DialogTitle>
            <DialogDescription>
              {grade === 1 ? (
                <span className="text-green-600 font-semibold">¡Excelente! Respuesta correcta.</span>
              ) : (
                <span className="text-red-600 font-semibold">Respuesta incorrecta. La respuesta correcta es: {exercise.answer}</span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-4">
            <div className={`text-6xl font-bold ${grade === 1 ? 'text-green-600' : 'text-red-600'}`}>
              {grade === 1 ? '✓' : '✗'}
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setGradeModalOpen(false)} disabled={isSubmitting}>
              Cerrar
            </Button>
            <Button variant="secondary" onClick={handleGoBack} disabled={isSubmitting}>
              Volver al Menú
            </Button>
            <Button onClick={handleNextExercise} disabled={isSubmitting}>
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
            <p dangerouslySetInnerHTML={{ __html: exercise?.explanation || '' }} />
          </div>
          <DialogFooter>
            <Button onClick={() => setExplanationModalOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
