import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Volume2, CheckCircle2, XCircle } from 'lucide-react';
import { GradeModal } from '@/components/ejercicio/GradeModal';
import { useExerciseGrade } from '@/hooks/useExerciseGrade';
import DashboardLoader from '@/components/dashboard/DashboardLoader';
import { normalizeAnswer } from '@/lib/exerciseUtils';
import { useIsMobile } from '@/hooks/use-mobile';

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

const checkAnswerType17 = (userAnswer: string, correctAnswer: string): boolean => {
  if (!userAnswer || userAnswer.trim() === '') return false;
  return normalizeAnswer(userAnswer) === normalizeAnswer(correctAnswer);
};

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
};

export function Eje17({ exercise: initialExercise }: Eje17Props) {
  const { id } = useParams();
  const isMobile = useIsMobile();
  const [exercise, setExercise] = useState<Type17Exercise | null>(null);
  const [loading, setLoading] = useState(true);

  const [userResponses, setUserResponses] = useState<string[]>([]);
  const [verified, setVerified] = useState(false);
  const [responses, setResponses] = useState<boolean[]>([]);
  const [answerSelected, setAnswerSelected] = useState<number | null>(null);

  const [audioPais, setAudioPais] = useState<string>(AUDIO_PAISES.ingles);
  const [playingAudio, setPlayingAudio] = useState<number | null>(null);

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

  const shuffledFields = useMemo(() => {
    if (!exercise) return [];
    return shuffleArray(exercise.fields);
  }, [exercise]);

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

    const total = responsesCheck.length;
    const successes = responsesCheck.filter((x) => x).length;
    const calculatedGrade = total > 0 ? successes / total : 1;

    openGradeModal(calculatedGrade);
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

    if (userResponses[i] === '' && answerSelected !== null) {
      const selectedField = exercise.fields.find((x) => x.id === answerSelected);
      value = selectedField?.answer || '';
    } else {
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
      const fallbackAudio = new Audio(`/audios/${audioName}.mp3`);
      fallbackAudio.play().catch(console.error);
    });
    
    audio.addEventListener('ended', () => setPlayingAudio(null));
  };

  const availableAnswers = shuffledFields.filter(
    ({ answer }) => !userResponses.some((x) => x === answer)
  );

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header Image */}
      <div className="relative w-full h-32 sm:h-40 md:h-48 rounded-lg overflow-hidden">
        <img
          src="/ejercicio/principal1.png"
          alt="Listening"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Title and Info */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">{exercise.title || 'Ejercicio Tipo 17'}</h1>
          <span className="text-sm text-muted-foreground">
            Ejercicio: {exercise.number || 0}
          </span>
        </div>

        {exercise.description && (
          <div
            className="text-sm sm:text-base text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: exercise.description }}
          />
        )}
      </div>

      {/* Audio Country Selector */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <span className="text-sm font-medium text-foreground">Acento del audio:</span>
            <div className="flex gap-2">
              <Button
                variant={audioPais === AUDIO_PAISES.ingles ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAudioPais(AUDIO_PAISES.ingles)}
                className="flex-1 sm:flex-none"
              >
                🇬🇧 Británico
              </Button>
              <Button
                variant={audioPais === AUDIO_PAISES.americano ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAudioPais(AUDIO_PAISES.americano)}
                className="flex-1 sm:flex-none"
              >
                🇺🇸 Americano
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Answer Selection Area */}
      <Card className="bg-muted/50">
        <CardContent className="p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-muted-foreground mb-3">Selecciona una palabra y haz clic en la imagen correspondiente:</p>
          <div className="flex flex-wrap gap-2 justify-center min-h-[50px] sm:min-h-[60px]">
            {availableAnswers.map((field) => (
              <button
                key={`answer-${field.id}`}
                onClick={() => handleSelectAnswer(field.id!)}
                disabled={verified}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all duration-200 text-sm sm:text-base font-medium ${
                  answerSelected === field.id
                    ? 'bg-primary text-primary-foreground scale-105 sm:scale-110 shadow-lg'
                    : 'bg-background text-foreground hover:bg-accent border border-border'
                } ${verified ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {field.answer}
              </button>
            ))}
            {availableAnswers.length === 0 && !verified && (
              <p className="text-muted-foreground italic text-sm">Todas las palabras han sido asignadas</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Image Cards Grid */}
      <div className={`grid gap-3 sm:gap-4 ${
        isMobile 
          ? 'grid-cols-2' 
          : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
      }`}>
        {exercise.fields.map((field, i) => (
          <Card
            key={`card-${i}`}
            className={`overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
              answerSelected !== null && userResponses[i] === '' ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => handleChange(i)}
          >
            <CardContent className="p-2 sm:p-3">
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
                  className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 h-7 w-7 sm:h-8 sm:w-8 rounded-full shadow-md"
                  onClick={(e) => {
                    e.stopPropagation();
                    playAudio(field.audio, i);
                  }}
                >
                  <Volume2 className={`h-3 w-3 sm:h-4 sm:w-4 ${playingAudio === i ? 'animate-pulse text-primary' : ''}`} />
                </Button>
              </div>

              {/* User response area */}
              <div
                className={`min-h-[32px] sm:min-h-[40px] flex items-center justify-center rounded-lg border-2 border-dashed p-1.5 sm:p-2 ${
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
                  <div className="flex items-center gap-1 sm:gap-2">
                    <span className={`text-xs sm:text-sm font-medium ${
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
                        ? <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                        : <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                    )}
                  </div>
                ) : (
                  <span className="text-muted-foreground text-xs sm:text-sm">Haz clic aquí</span>
                )}
              </div>

              {/* Show correct answer if wrong */}
              {shouldShowAnswer() && !responses[i] && (
                <p className="text-[10px] sm:text-xs text-center text-red-500 mt-1 font-medium">
                  Correcto: {field.answer}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
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
    </div>
  );
}
