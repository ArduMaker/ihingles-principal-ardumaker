import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle, CheckCircle2, XCircle, ChevronLeft, RotateCcw } from 'lucide-react';
import DashboardLoader from '@/components/dashboard/DashboardLoader';
import { useExerciseGrade } from '@/hooks/useExerciseGrade';
import { GradeModal } from '@/components/ejercicio/GradeModal';
import { ExplanationModal } from '@/components/ejercicio/ExplanationModal';

interface FieldData {
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
  shown?: boolean;
  explanation?: string;
}

interface Type12Exercise {
  _id: string;
  type: number;
  number?: number;
  unidad?: number;
  title?: string;
  description?: string;
  calificationSobre?: number;
  fields: FieldData[];
}

interface Eje12Props {
  exercise: Type12Exercise | any;
}

// Normalize text for comparison
const normalizeForComparison = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
};

// Get plain value from answer (handles objects with value property)
const getPlainValue = (answer: any): string => {
  if (!answer) return '';
  if (typeof answer === 'object' && answer.value) return answer.value;
  return String(answer);
};

// Check answer against multiple valid answers
const checkAnswerType12 = (userAnswer: string, field: FieldData): boolean => {
  if (!userAnswer || userAnswer.trim() === '') return false;
  
  const normalizedUser = normalizeForComparison(userAnswer);
  
  const validAnswers = [
    field.answer,
    field.answer2,
    field.answer3,
    field.answer4,
    field.answer5,
    field.answer6,
    field.answer7,
    field.answer8,
    field.answer9,
    field.answer10,
    field.answer11,
    field.answer12,
  ].filter(Boolean);
  
  return validAnswers.some(answer => {
    const normalizedAnswer = normalizeForComparison(getPlainValue(answer));
    return normalizedUser === normalizedAnswer;
  });
};

export function Eje12({ exercise: initialExercise }: Eje12Props) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [exercise, setExercise] = useState<Type12Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  
  const currentExerciseIndex = parseInt(searchParams.get('exerciseIndex') || '0');
  
  // State for user responses and verification
  const [userResponses, setUserResponses] = useState<string[]>([]);
  const [verified, setVerified] = useState(false);
  const [verifiedResponses, setVerifiedResponses] = useState<Record<number, boolean | 'shown'>>({});
  
  // Modal states
  const [explanationModalOpen, setExplanationModalOpen] = useState(false);
  const [currentExplanation, setCurrentExplanation] = useState('');

  // Hook modular de calificación
  const {
    grade,
    gradeModalOpen,
    saving,
    openGradeModal,
    setGradeModalOpen,
    handleClose,
    handleGoBack,
    handleNextExercise,
  } = useExerciseGrade({
    exerciseId: initialExercise?._id || initialExercise?.number?.toString() || '0',
    unidad: initialExercise?.unidad || Number(id) || 1,
    exerciseNumber: initialExercise?.number || currentExerciseIndex,
  });

  // Initialize exercise data
  useEffect(() => {
    if (initialExercise) {
      setExercise(initialExercise);
      
      // Initialize user responses - empty for non-shown, answer for shown
      const initialResponses = initialExercise.fields.map((field: FieldData) => 
        field.shown ? getPlainValue(field.answer) : ''
      );
      setUserResponses(initialResponses);
      
      // Initialize verified responses
      const initialVerified: Record<number, boolean | 'shown'> = {};
      initialExercise.fields.forEach((_: FieldData, i: number) => {
        initialVerified[i] = false;
      });
      setVerifiedResponses(initialVerified);
      
      setLoading(false);
    }
  }, [initialExercise]);

  if (loading || !exercise) {
    return <DashboardLoader />;
  }

  const isShown = (index: number): boolean => {
    return exercise.fields[index]?.shown || false;
  };

  const handleChange = (index: number, value: string) => {
    setUserResponses(prev => {
      const newResponses = [...prev];
      newResponses[index] = value;
      return newResponses;
    });
  };

  const handleVerify = () => {
    const newVerifiedResponses: Record<number, boolean | 'shown'> = {};
    const results: boolean[] = [];
    
    exercise.fields.forEach((field, index) => {
      if (field.shown) {
        newVerifiedResponses[index] = 'shown';
        results.push(true);
      } else {
        const isCorrect = checkAnswerType12(userResponses[index], field);
        newVerifiedResponses[index] = isCorrect;
        results.push(isCorrect);
      }
    });
    
    setVerifiedResponses(newVerifiedResponses);
    setVerified(true);
    
    // Calculate grade based on computable fields (not shown)
    const computableResults = results.filter((_, i) => !isShown(i));
    const total = exercise.calificationSobre ?? computableResults.length;
    const successes = computableResults.filter(x => x).length;
    
    let calculatedGrade = total > 0 ? successes / total : 0;
    if (calculatedGrade > 1) calculatedGrade = 1;
    
    openGradeModal(calculatedGrade);
  };

  const handleReset = () => {
    const initialResponses = exercise.fields.map((field: FieldData) => 
      field.shown ? getPlainValue(field.answer) : ''
    );
    setUserResponses(initialResponses);
    
    const initialVerified: Record<number, boolean | 'shown'> = {};
    exercise.fields.forEach((_: FieldData, i: number) => {
      initialVerified[i] = false;
    });
    setVerifiedResponses(initialVerified);
    
    setVerified(false);
  };

  const showExplanation = (explanation: string | undefined) => {
    if (explanation) {
      setCurrentExplanation(explanation);
      setExplanationModalOpen(true);
    }
  };

  const shouldShowAnswer = (): boolean => {
    return verified && Object.values(verifiedResponses).some(x => x === false);
  };

  const getInputClassName = (index: number): string => {
    if (!verified) return '';
    
    const result = verifiedResponses[index];
    if (result === 'shown' || result === true) {
      return 'border-green-500 bg-green-50 dark:bg-green-900/20';
    }
    return 'border-red-500 bg-red-50 dark:bg-red-900/20';
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Header Image */}
      <div className="relative w-full h-32 sm:h-48 rounded-lg overflow-hidden">
        <img 
          src="/ejercicio/grammar.png" 
          alt="Grammar"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Title and Info */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
            <div className="space-y-2 flex-1">
              <CardTitle className="text-xl sm:text-2xl">{exercise.title || 'Ejercicio Tipo 12'}</CardTitle>
              <span className="text-xs sm:text-sm text-muted-foreground">
                Ejercicio: {exercise.number || 0}
              </span>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate(`/modulo/${id}`)}
              className="gap-2 w-full sm:w-auto"
              size="sm"
            >
              <ChevronLeft className="h-4 w-4" />
              Atrás
            </Button>
          </div>
          
          {exercise.description && (
            <div 
              className="text-muted-foreground mt-4 text-sm sm:text-base"
              dangerouslySetInnerHTML={{ __html: exercise.description }}
            />
          )}
        </CardHeader>

        {/* Fields */}
        <CardContent className="p-4 sm:p-6 pt-0 space-y-3 sm:space-y-4">
          {exercise.fields.map((field, index) => (
            <div key={index} className="flex items-center gap-2 sm:gap-4">
              {/* Index number */}
              <span className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-primary/10 text-primary rounded-full font-semibold text-xs sm:text-sm shrink-0">
                {index + 1}
              </span>
              
              {/* Input field */}
              <div className="flex-1 flex items-center gap-2 flex-wrap">
                <Input
                  value={userResponses[index] || ''}
                  onChange={(e) => handleChange(index, e.target.value)}
                  disabled={verified || field.shown}
                  placeholder={field.shown ? '' : 'Escribe tu respuesta'}
                  className={`flex-1 min-w-[120px] sm:min-w-[150px] text-sm sm:text-base ${getInputClassName(index)}`}
                />
                
                {/* Verification icon */}
                {verified && (
                  <div className="shrink-0">
                    {verifiedResponses[index] === 'shown' || verifiedResponses[index] === true ? (
                      <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                    )}
                  </div>
                )}
                
                {/* Show correct answer when wrong */}
                {shouldShowAnswer() && verifiedResponses[index] === false && (
                  <div className="flex items-center gap-1 sm:gap-2">
                    <span className="text-xs sm:text-sm text-red-500 font-medium">
                      {getPlainValue(field.answer)}
                    </span>
                    {field.explanation && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 sm:h-8 sm:w-8"
                        onClick={() => showExplanation(field.explanation)}
                      >
                        <HelpCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 pt-4">
            {verified && (
              <Button variant="outline" onClick={handleReset} className="gap-2 w-full sm:w-auto">
                <RotateCcw className="h-4 w-4" />
                Reintentar
              </Button>
            )}
            <Button 
              onClick={verified ? () => setGradeModalOpen(true) : handleVerify} 
              className="w-full sm:w-auto"
            >
              {verified ? 'Ver Calificación' : 'Verificar'}
            </Button>
          </div>
        </CardContent>
      </Card>

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
}
