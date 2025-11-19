import { useState, useEffect } from 'react';
import { Exercise } from '@/data/unidades';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { checkAnswer } from '@/lib/exerciseUtils';
import { postUserGrade, postUserPosition } from '@/lib/api';
import { toast } from 'sonner';

interface Eje12Props {
  exercise: Exercise;
}

interface Field {
  answer: string;
  answer2?: string;
  answer3?: string;
  answer4?: string;
  shown?: boolean;
  explanation?: string;
}

export function Eje12({ exercise }: Eje12Props) {
  const fields = exercise.fields as Field[] || [];
  const [userAnswers, setUserAnswers] = useState<string[]>(
    fields.map(field => field.shown ? field.answer : '')
  );
  const [verified, setVerified] = useState(false);
  const [verifiedResponses, setVerifiedResponses] = useState<boolean[]>([]);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [grade, setGrade] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (index: number, value: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[index] = value;
    setUserAnswers(newAnswers);
  };

  const handleVerify = () => {
    const results = fields.map((field, index) => {
      // Fields with shown:true are automatically correct
      if (field.shown) return true;
      
      const validAnswers = [
        field.answer,
        field.answer2,
        field.answer3,
        field.answer4
      ];
      
      return checkAnswer(userAnswers[index] || '', validAnswers);
    });

    setVerifiedResponses(results);
    setVerified(true);

    // Calculate grade based on computable fields (not shown)
    const computableFields = fields.filter(f => !f.shown);
    const correctAnswers = results.filter((result, index) => 
      !fields[index].shown && result
    ).length;
    
    const calculatedGrade = computableFields.length > 0 
      ? Math.min(correctAnswers / computableFields.length, 1)
      : 1;
    
    setGrade(calculatedGrade);
    setShowGradeModal(true);
  };

  const handleSaveGrade = async () => {
    setIsSaving(true);
    try {
      await postUserGrade(
        exercise._id,
        grade,
        exercise.unidad?.toString() || '0'
      );

      await postUserPosition({
        unidad: exercise.unidad || 0,
        position: exercise.position || 0
      });

      toast.success('Progreso guardado correctamente');
      setShowGradeModal(false);
    } catch (error) {
      toast.error('Error al guardar el progreso');
    } finally {
      setIsSaving(false);
    }
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
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">{exercise.title}</h1>
          <span className="text-sm text-muted-foreground">
            Ejercicios: {exercise.number || 0}/{exercise.unidad ? Math.round(exercise.unidad * 100) : 0}
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
        <CardContent className="p-6 space-y-4">
          {fields.map((field, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center gap-4">
                <Label className="w-24 text-base font-medium">
                  Campo {index + 1}
                </Label>
                <div className="flex-1 relative">
                  <Input
                    value={userAnswers[index]}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    disabled={field.shown || verified}
                    placeholder="Escribe aquí"
                    className={
                      verified
                        ? verifiedResponses[index]
                          ? 'border-green-500 bg-green-50'
                          : 'border-red-500 bg-red-50'
                        : ''
                    }
                  />
                  {verified && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {verifiedResponses[index] ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {verified && !verifiedResponses[index] && field.explanation && (
                <p className="text-sm text-red-500 ml-28">
                  {field.explanation}
                </p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        {!verified ? (
          <Button onClick={handleVerify} size="lg">
            Verificar
          </Button>
        ) : (
          <Button onClick={() => setShowGradeModal(true)} size="lg">
            Ver Calificación
          </Button>
        )}
      </div>

      {/* Grade Modal */}
      <Dialog open={showGradeModal} onOpenChange={setShowGradeModal}>
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

          <DialogFooter>
            <Button 
              onClick={handleSaveGrade}
              disabled={isSaving}
              className="w-full"
            >
              {isSaving ? 'Guardando...' : 'Guardar y Continuar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
