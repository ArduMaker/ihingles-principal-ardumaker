import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { postUserPosition, postUserGrade } from '@/lib/api';
import { checkAnswer } from '@/lib/exerciseUtils';
import { toast } from '@/hooks/use-toast';
import { Calculate_index_exercise } from '@/hooks/calculate_index.ts';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Exercise } from '@/types/ejercicio';

interface Sentence {
  sentence: string;
  answer: string;
  answer2?: string;
  answer3?: string;
  shown?: boolean;
  explanation?: string;
}

interface Eje6Props {
  exercise: {
    _id: string;
    type: number | string;
    number?: number;
    unidad?: number;
    title: string;
    description?: string;
    skill: string;
    options?: string[] | { id: string; text: string; }[];
    sentences?: Sentence[];
  };
}

export function Eje6({ exercise }: Eje6Props) {
  const { id } = useParams<{ id: string }>();
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [verified, setVerified] = useState(false);
  const [results, setResults] = useState<Record<number, boolean>>({});
  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [grade, setGrade] = useState(0);
  const [explanationModalOpen, setExplanationModalOpen] = useState(false);
  const [currentExplanation, setCurrentExplanation] = useState('');

  // Initialize responses for shown fields
  useEffect(() => {
    if (!exercise.sentences) return;
    const initialResponses: Record<number, string> = {};
    exercise.sentences.forEach((sentence, index) => {
      if (sentence.shown) {
        initialResponses[index] = sentence.answer;
      }
    });
    setResponses(initialResponses);
  }, [exercise]);

  const handleSelectChange = (index: number, value: string) => {
    setResponses(prev => ({ ...prev, [index]: value }));
  };

  const handleVerify = () => {
    if (!exercise.sentences) return;
    
    const newResults: Record<number, boolean> = {};
    
    exercise.sentences.forEach((sentence, index) => {
      if (sentence.shown) {
        newResults[index] = true;
      } else {
        const userAnswer = responses[index] || '';
        const validAnswers = [
          sentence.answer,
          sentence.answer2,
          sentence.answer3,
        ];
        newResults[index] = checkAnswer(userAnswer, validAnswers);
      }
    });

    setResults(newResults);
    setVerified(true);

    // Calculate grade
    const computableFields = exercise.sentences.filter((s, i) => !s.shown);
    const correctAnswers = computableFields.filter((_, i) => {
      const actualIndex = exercise.sentences.findIndex(s => s === computableFields[i]);
      return newResults[actualIndex];
    }).length;
    
    const calculatedGrade = computableFields.length > 0 
      ? correctAnswers / computableFields.length 
      : 1;
    
    setGrade(calculatedGrade);
    setGradeModalOpen(true);
  };

  const handleSaveGrade = async () => {
    try {
      await postUserGrade(exercise._id, grade, String(exercise.unidad || 0));
      await postUserPosition({
        unidad: Number(id),
        position: await Calculate_index_exercise(exercise),
      });
      
      toast({
        title: "Progreso guardado",
        description: "Tu calificación ha sido registrada exitosamente.",
      });
      
      setGradeModalOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la calificación. Intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    if (!exercise.sentences) return;
    
    const initialResponses: Record<number, string> = {};
    exercise.sentences.forEach((sentence, index) => {
      if (sentence.shown) {
        initialResponses[index] = sentence.answer;
      }
    });
    setResponses(initialResponses);
    setVerified(false);
    setResults({});
  };

  const showExplanation = (explanation?: string) => {
    if (explanation) {
      setCurrentExplanation(explanation);
      setExplanationModalOpen(true);
    }
  };

  const getBorderColor = (index: number) => {
    if (!verified) return 'border-input';
    if (results[index]) return 'border-green-500';
    return 'border-red-500';
  };

  const hasIncorrectAnswers = Object.values(results).some(r => !r);

  return (
    <div className="space-y-6">
      {/* Hero Image */}
      <div className="relative w-full h-48 rounded-lg overflow-hidden">
        <img 
          src="/ejercicio/grammar.png" 
          alt="Grammar"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
          <h2 className="text-white text-3xl font-bold p-6">Grammar</h2>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-6">
          {/* Title and Description */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">{exercise.title}</h1>
            <div 
              className="text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: exercise.description || '' }}
            />
            <p className="text-sm text-muted-foreground">
              Ejercicios: {exercise.number}/{/* total exercises */}
            </p>
          </div>

          {/* Sentences */}
          <div className="space-y-4">
            {exercise.sentences?.map((sentence, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center gap-3">
                  {/* Result indicator */}
                  {verified && (
                    <div className="flex-shrink-0">
                      {results[index] ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  )}
                  
                  {/* Sentence text */}
                  <span className="flex-shrink-0 font-medium min-w-[100px]">
                    {sentence.sentence}
                  </span>

                  {/* Select dropdown */}
                  <Select
                    value={responses[index] || ''}
                    onValueChange={(value) => handleSelectChange(index, value)}
                    disabled={verified || sentence.shown}
                  >
                    <SelectTrigger 
                      className={`w-full max-w-xs ${getBorderColor(index)} ${
                        sentence.shown ? 'bg-muted' : ''
                      }`}
                    >
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {exercise.options?.map((option, optIndex) => {
                        const optionText = typeof option === 'string' ? option : option.text;
                        const optionValue = typeof option === 'string' ? option : option.text;
                        return (
                          <SelectItem key={optIndex} value={optionValue}>
                            {optionText}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Show correct answer if verified and incorrect */}
                {verified && !results[index] && !sentence.shown && hasIncorrectAnswers && (
                  <div className="ml-8 pl-4 border-l-2 border-red-500">
                    <button
                      onClick={() => showExplanation(sentence.explanation)}
                      className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
                    >
                      <AlertCircle className="h-4 w-4" />
                      Respuesta correcta: {sentence.answer}
                      {sentence.explanation && ' (click para ver explicación)'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleVerify}
              disabled={verified}
              className="flex-1"
            >
              Verificar
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              disabled={!verified}
              className="flex-1"
            >
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Grade Modal */}
      <Dialog open={gradeModalOpen} onOpenChange={setGradeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Calificación</DialogTitle>
            <DialogDescription>
              Has completado el ejercicio
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center py-6">
              <div className="text-5xl font-bold text-primary">
                {Math.round(grade * 100)}%
              </div>
              <p className="text-muted-foreground mt-2">
                {grade >= 0.8 ? '¡Excelente trabajo!' : 
                 grade >= 0.6 ? '¡Buen trabajo!' : 
                 '¡Sigue practicando!'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveGrade} className="flex-1">
                Guardar y continuar
              </Button>
              <Button 
                onClick={() => setGradeModalOpen(false)} 
                variant="outline"
                className="flex-1"
              >
                Cerrar
              </Button>
            </div>
          </div>
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
          <Button onClick={() => setExplanationModalOpen(false)}>
            Cerrar
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
