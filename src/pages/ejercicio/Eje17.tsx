import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Volume2, CheckCircle2, XCircle } from 'lucide-react';
import { postUserGrade, postUserPosition } from '@/lib/api';
import { toast } from 'sonner';
import { Calculate_index_exercise } from '@/hooks/calculate_index.ts';
import DashboardLoader from '@/components/dashboard/DashboardLoader';
import { normalizeAnswer } from '@/lib/exerciseUtils';

const AUDIO_PAISES = {
  ingles: 'ingles',
  americano: 'americano',
};

interface FieldData {
  id?: number;
  answer: string;
  audio: string;
  image: string;
}

interface Type17Exercise {
  _id: string;
  skill?: string;
  type: number;
  number?: number;
  unidad?: number;
  title?: string;
  description?: string;
  fields: FieldData[];
}

interface Eje17Props {
  exercise: Type17Exercise | any;
}

// Check answer
const checkAnswerType17 = (userAnswer: string, correctAnswer: string): boolean => {
  if (!userAnswer || userAnswer.trim() === '') return false;
  return normalizeAnswer(userAnswer) === normalizeAnswer(correctAnswer);
};

// Shuffle array utility
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
};

export function Eje17({ exercise: initialExercise }: Eje17Props) {
  const navigate = useNavigate();
  const [exercise, setExercise] = useState<Type17Exercise | null>(null);
  const [loading, setLoading] = useState(true);

  // State for user responses and verification
  const [userResponses, setUserResponses] = useState<string[]>([]);
  const [verified, setVerified] = useState(false);
  const [responses, setResponses] = useState<boolean[]>([]);
  const [answerSelected, setAnswerSelected] = useState<number | null>(null);

  // Audio state
  const [audioPais, setAudioPais] = useState<string>(AUDIO_PAISES.ingles);
  const [playingAudio, setPlayingAudio] = useState<number | null>(null);

  // Modal states
  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [grade, setGrade] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Shuffled fields (memoized to prevent re-shuffle on re-render)
  const shuffledFields = useMemo(() => {
    if (!exercise) return [];
    return shuffleArray(exercise.fields);
  }, [exercise]);

  // Initialize exercise data
  useEffect(() => {
    if (initialExercise) {
      const exerciseWithIds = {
        ...initialExercise,
        fields: initialExercise.fields?.map((field: FieldData, i: number) => ({ ...field, id: i })) || []
      };
      setExercise(exerciseWithIds);

      const initialStates: string[] = exerciseWithIds.fields.map(() => '');
      setUserResponses(initialStates);
      setResponses(initialStates.map(() => false));
      setLoading(false);
    }
  }, [initialExercise]);

  if (loading || !exercise) {
    return <DashboardLoader />;
  }

  const shouldShowAnswer = (): boolean => {
    return verified && responses.some((x) => !x);
  };

  const handleVerify = () => {
    const responsesCheck: boolean[] = [];
    exercise.fields.forEach((field, i) => {
      responsesCheck.push(checkAnswerType17(userResponses[i], field.answer));
    });

    setResponses(responsesCheck);
    setVerified(true);

    // Calculate grade
    const total = responsesCheck.length;
    const successes = responsesCheck.filter((x) => x).length;
    const calculatedGrade = total > 0 ? successes / total : 1;

    setGrade(calculatedGrade);
    setGradeModalOpen(true);
  };

  const handleReset = () => {
    const initialStates: string[] = exercise.fields.map(() => '');
    setUserResponses(initialStates);
    setResponses(initialStates.map(() => false));
    setAnswerSelected(null);
    setVerified(false);
  };

  const handleChange = (i: number) => {
    if (verified) return;

    let value = '';

    // If slot is empty and an answer is selected, fill it
    if (userResponses[i] === '' && answerSelected !== null) {
      const selectedField = exercise.fields.find((x) => x.id === answerSelected);
      value = selectedField?.answer || '';
    } else {
      // If slot has value, clear it
      value = '';
    }

    setUserResponses((old) => {
      const data = [...old];
      data[i] = value;
      return data;
    });
    setAnswerSelected(null);
  };

  const handleSelectAnswer = (fieldId: number) => {
    if (verified) return;
    setAnswerSelected(fieldId === answerSelected ? null : fieldId);
  };

  const playAudio = (audioName: string, index: number) => {
    const audioPath = `/audios/${audioPais}/${audioName}.mp3`;
    const audio = new Audio(audioPath);
    
    setPlayingAudio(index);
    audio.play().catch(() => {
      // Fallback to alternative path
      const fallbackAudio = new Audio(`/audios/${audioName}.mp3`);
      fallbackAudio.play().catch(console.error);
    });
    
    audio.addEventListener('ended', () => setPlayingAudio(null));
  };

  const handleSaveGrade = async () => {
    setIsSubmitting(true);
    try {
      await postUserGrade(
        exercise._id,
        grade,
        exercise.unidad?.toString() || '0'
      );

      await postUserPosition({
        unidad: exercise.unidad || 0,
        position: await Calculate_index_exercise(exercise)
      });

      toast.success('Progreso guardado correctamente');
      setGradeModalOpen(false);
    } catch (error) {
      toast.error('Error al guardar el progreso');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextExercise = async () => {
    await handleSaveGrade();
    const nextNumber = (exercise.number || 0) + 1;
    navigate(`/ejercicio/${nextNumber}`);
  };

  const handleGoBack = () => {
    setGradeModalOpen(false);
    navigate(-1);
  };

  // Get available answers (not yet used)
  const availableAnswers = shuffledFields.filter(
    ({ answer }) => !userResponses.some((x) => x === answer)
  );

  return (
    <div className="space-y-6">
      {/* Header Image */}
      <div className="relative w-full h-48 rounded-lg overflow-hidden">
        <img
          src="/ejercicio/principal1.png"
          alt="Listening"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Title and Info */}
      <div className="space-y-2">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <h1 className="text-2xl font-bold text-foreground">{exercise.title || 'Ejercicio Tipo 17'}</h1>
          <span className="text-sm text-muted-foreground">
            Ejercicio: {exercise.number || 0}
          </span>
        </div>

        {exercise.description && (
          <div
            className="text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: exercise.description }}
          />
        )}
      </div>

      {/* Audio Country Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-sm font-medium text-foreground">Acento del audio:</span>
            <div className="flex gap-2">
              <Button
                variant={audioPais === AUDIO_PAISES.ingles ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAudioPais(AUDIO_PAISES.ingles)}
              >
                🇬🇧 Británico
              </Button>
              <Button
                variant={audioPais === AUDIO_PAISES.americano ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAudioPais(AUDIO_PAISES.americano)}
              >
                🇺🇸 Americano
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Answer Selection Area */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground mb-3">Selecciona una palabra y haz clic en la imagen correspondiente:</p>
          <div className="flex flex-wrap gap-2 justify-center min-h-[60px]">
            {availableAnswers.map((field) => (
              <button
                key={`answer-${field.id}`}
                onClick={() => handleSelectAnswer(field.id!)}
                disabled={verified}
                className={`px-4 py-2 rounded-full transition-all duration-200 font-medium ${
                  answerSelected === field.id
                    ? 'bg-primary text-primary-foreground scale-110 shadow-lg'
                    : 'bg-background text-foreground hover:bg-accent border border-border'
                } ${verified ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {field.answer}
              </button>
            ))}
            {availableAnswers.length === 0 && !verified && (
              <p className="text-muted-foreground italic">Todas las palabras han sido asignadas</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Image Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {exercise.fields.map((field, i) => (
          <Card
            key={`card-${i}`}
            className={`overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
              answerSelected !== null && userResponses[i] === '' ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => handleChange(i)}
          >
            <CardContent className="p-3">
              {/* Image with audio button */}
              <div className="relative aspect-square mb-2">
                <img
                  src={`/ejercicios/imagenes/${field.image}`}
                  alt={`Image ${i + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute bottom-2 right-2 h-8 w-8 rounded-full shadow-md"
                  onClick={(e) => {
                    e.stopPropagation();
                    playAudio(field.audio, i);
                  }}
                >
                  <Volume2 className={`h-4 w-4 ${playingAudio === i ? 'animate-pulse text-primary' : ''}`} />
                </Button>
              </div>

              {/* User response area */}
              <div
                className={`min-h-[40px] flex items-center justify-center rounded-lg border-2 border-dashed p-2 ${
                  userResponses[i]
                    ? verified
                      ? responses[i]
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border-primary bg-primary/10'
                    : 'border-muted-foreground/30'
                }`}
              >
                {userResponses[i] ? (
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${
                      verified
                        ? responses[i]
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                        : 'text-foreground'
                    }`}>
                      {userResponses[i]}
                    </span>
                    {verified && (
                      responses[i]
                        ? <CheckCircle2 className="h-4 w-4 text-green-500" />
                        : <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">Haz clic aquí</span>
                )}
              </div>

              {/* Show correct answer if wrong */}
              {shouldShowAnswer() && !responses[i] && (
                <p className="text-xs text-center text-red-500 mt-1 font-medium">
                  Correcto: {field.answer}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        {verified && (
          <Button variant="outline" onClick={handleReset}>
            Reintentar
          </Button>
        )}
        <Button onClick={verified ? () => setGradeModalOpen(true) : handleVerify} size="lg">
          {verified ? 'Ver Calificación' : 'Verificar'}
        </Button>
      </div>

      {/* Grade Modal */}
      <Dialog open={gradeModalOpen} onOpenChange={setGradeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Calificación</DialogTitle>
            <DialogDescription>
              Resultado de tu ejercicio
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 text-center">
            <div className="text-6xl font-bold text-primary mb-4">
              {Math.round(grade * 100)}%
            </div>
            <p className="text-muted-foreground">
              {grade >= 0.8 ? '¡Excelente trabajo!' : grade >= 0.6 ? '¡Bien hecho!' : 'Sigue practicando'}
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
              {isSubmitting ? 'Guardando...' : 'Siguiente Ejercicio'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
