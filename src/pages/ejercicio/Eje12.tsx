import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { HelpCircle, CheckCircle2, XCircle } from 'lucide-react';
import { postUserGrade, postUserPosition } from '@/lib/api';
import { toast } from 'sonner';
import { Calculate_index_exercise } from '@/hooks/calculate_index.ts';
import DashboardLoader from '@/components/dashboard/DashboardLoader';

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
  const [exercise, setExercise] = useState<Type12Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  
  // State for user responses and verification
  const [userResponses, setUserResponses] = useState<string[]>([]);
  const [verified, setVerified] = useState(false);
  const [verifiedResponses, setVerifiedResponses] = useState<Record<number, boolean | 'shown'>>({});
  
  // Modal states
  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [grade, setGrade] = useState(0);
  const [explanationModalOpen, setExplanationModalOpen] = useState(false);
  const [currentExplanation, setCurrentExplanation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    
    let calculatedGrade = successes / total;
    if (calculatedGrade > 1) calculatedGrade = 1;
    
    setGrade(calculatedGrade);
    setGradeModalOpen(true);
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

  const getInputClassName = (index: number): string => {
    if (!verified) return '';
    
    const result = verifiedResponses[index];
    if (result === 'shown' || result === true) {
      return 'border-green-500 bg-green-50 dark:bg-green-900/20';
    }
    return 'border-red-500 bg-red-50 dark:bg-red-900/20';
  };

  return (
    <div className="space-y-6">
      {/* Header Image */}
      <div className="relative w-full h-48 rounded-lg overflow-hidden">
        <img 
          src="/ejercicio/grammar.png" 
          alt="Grammar"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Title and Info */}
      <div className="space-y-2">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <h1 className="text-2xl font-bold text-foreground">{exercise.title || 'Ejercicio Tipo 12'}</h1>
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

      {/* Fields */}
      <Card>
        <CardContent className="p-4 md:p-6 space-y-4">
          {exercise.fields.map((field, index) => (
            <div key={index} className="flex items-center gap-2 md:gap-4">
              {/* Index number */}
              <span className="w-8 h-8 flex items-center justify-center bg-primary/10 text-primary rounded-full font-semibold text-sm shrink-0">
                {index + 1}
              </span>
              
              {/* Input field */}
              <div className="flex-1 flex items-center gap-2 flex-wrap">
                <Input
                  value={userResponses[index] || ''}
                  onChange={(e) => handleChange(index, e.target.value)}
                  disabled={verified || field.shown}
                  placeholder={field.shown ? '' : 'Escribe tu respuesta'}
                  className={`flex-1 min-w-[150px] ${getInputClassName(index)}`}
                />
                
                {/* Verification icon */}
                {verified && (
                  <div className="shrink-0">
                    {verifiedResponses[index] === 'shown' || verifiedResponses[index] === true ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                )}
                
                {/* Show correct answer when wrong */}
                {shouldShowAnswer() && verifiedResponses[index] === false && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-red-500 font-medium">
                      {getPlainValue(field.answer)}
                    </span>
                    {field.explanation && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => showExplanation(field.explanation)}
                      >
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

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

      {/* Explanation Modal */}
      <Dialog open={explanationModalOpen} onOpenChange={setExplanationModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Explicación</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-foreground">{currentExplanation}</p>
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
