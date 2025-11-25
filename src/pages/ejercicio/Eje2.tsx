import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle2, XCircle, Info } from 'lucide-react';
import { checkAnswer } from '@/lib/exerciseUtils';
import { postUserGrade, postUserPosition } from '@/lib/api';
import { Exercise } from '@/data/unidades';

interface Field {
  shown: boolean;
  answer: string;
  answer2?: string;
  answer3?: string;
  explanation?: string;
  options?: string[];
  includeQuestionMark?: boolean;
}

interface Row {
  fields: Field[];
}

interface Section {
  title: string;
  left: string[];
  top: string[];
  rows: Row[];
}

interface Eje2Props {
  exercise: Exercise;
}

export default function Eje2({ exercise: initialExercise }: Eje2Props) {
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: string }>({});
  const [verificationState, setVerificationState] = useState<{ [key: string]: boolean | null }>({});
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [grade, setGrade] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // Type guard to check if sections are type 2
  const sections = (initialExercise.sections || []).filter((s): s is Section => 
    'title' in s && 'left' in s && 'top' in s && 'rows' in s
  );

  const handleInputChange = (sectionIndex: number, rowIndex: number, fieldIndex: number, value: string) => {
    const key = `${sectionIndex}-${rowIndex}-${fieldIndex}`;
    setUserAnswers(prev => ({
      ...prev,
      [key]: value
    }));
    // Clear verification state for this field
    setVerificationState(prev => ({
      ...prev,
      [key]: null
    }));
  };

  const handleVerify = () => {
    const newVerificationState: { [key: string]: boolean | null } = {};
    let correctCount = 0;
    let totalCount = 0;

    sections.forEach((section, sectionIndex) => {
      section.rows.forEach((row, rowIndex) => {
        row.fields.forEach((field, fieldIndex) => {
          if (!field.shown) {
            totalCount++;
            const key = `${sectionIndex}-${rowIndex}-${fieldIndex}`;
            const userAnswer = userAnswers[key] || '';
            
            const validAnswers = [
              field.answer,
              field.answer2,
              field.answer3
            ].filter(Boolean);

            const isCorrect = checkAnswer(userAnswer, validAnswers);
            newVerificationState[key] = isCorrect;
            if (isCorrect) correctCount++;
          }
        });
      });
    });

    setVerificationState(newVerificationState);
    
    const calculatedGrade = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
    setGrade(calculatedGrade);
    setShowGradeModal(true);
  };

  const handleSaveGrade = async () => {
    setIsSaving(true);
    try {
      await postUserGrade(
        (initialExercise.number || 0).toString(),
        grade,
        (initialExercise.unidad || 0).toString()
      );
      await postUserPosition({
        unidad: initialExercise.unidad || 0,
        position: initialExercise.number || 0
      });
    } catch (error) {
      console.error('Error saving grade:', error);
    } finally {
      setIsSaving(false);
      setShowGradeModal(false);
    }
  };

  const renderField = (field: Field, sectionIndex: number, rowIndex: number, fieldIndex: number) => {
    const key = `${sectionIndex}-${rowIndex}-${fieldIndex}`;
    const userAnswer = userAnswers[key] || '';
    const verificationStatus = verificationState[key];

    if (field.shown) {
      return (
        <div className="px-3 py-2 text-sm font-medium bg-muted/50 rounded">
          {field.answer}
        </div>
      );
    }

    // If field has options, render as dropdown
    if (field.options && field.options.length > 0) {
      return (
        <div className="relative">
          <Select
            value={userAnswer}
            onValueChange={(value) => handleInputChange(sectionIndex, rowIndex, fieldIndex, value)}
          >
            <SelectTrigger 
              className={`
                ${verificationStatus === true ? 'border-green-500 bg-green-50' : ''}
                ${verificationStatus === false ? 'border-red-500 bg-red-50' : ''}
              `}
            >
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              {field.options.map((option, idx) => (
                <SelectItem key={idx} value={option}>
                  {option}
                </SelectItem>
              ))}</SelectContent>
          </Select>
          {verificationStatus === true && (
            <CheckCircle2 className="absolute right-10 top-1/2 -translate-y-1/2 h-4 w-4 text-green-600" />
          )}
          {verificationStatus === false && (
            <XCircle className="absolute right-10 top-1/2 -translate-y-1/2 h-4 w-4 text-red-600" />
          )}
        </div>
      );
    }

    // Otherwise render as input
    return (
      <div className="relative">
        <Input
          type="text"
          value={userAnswer}
          onChange={(e) => handleInputChange(sectionIndex, rowIndex, fieldIndex, e.target.value)}
          className={`
            ${verificationStatus === true ? 'border-green-500 bg-green-50' : ''}
            ${verificationStatus === false ? 'border-red-500 bg-red-50' : ''}
          `}
          placeholder={field.includeQuestionMark ? "Respuesta?" : "Respuesta"}
        />
        {verificationStatus === true && (
          <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-600" />
        )}
        {verificationStatus === false && (
          <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-600" />
        )}
        {field.explanation && verificationStatus === false && (
          <div className="mt-1 text-xs text-muted-foreground flex items-start gap-1">
            <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
            <span>{field.explanation}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{initialExercise.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <AlertDescription>{initialExercise.description || initialExercise.question}</AlertDescription>
          </Alert>

          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-8">
              <h3 className="text-xl font-bold mb-4 text-primary">{section.title}</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-border">
                  <thead>
                    <tr>
                      <th className="border border-border bg-muted p-3 text-left font-semibold"></th>
                      {section.top.map((topLabel, idx) => (
                        <th key={idx} className="border border-border bg-muted p-3 text-center font-semibold">
                          {topLabel}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {section.rows.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        <td className="border border-border bg-muted p-3 font-semibold">
                          {section.left[rowIndex]}
                        </td>
                        {row.fields.map((field, fieldIndex) => (
                          <td key={fieldIndex} className="border border-border p-3">
                            {renderField(field, sectionIndex, rowIndex, fieldIndex)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          <div className="flex justify-center mt-6">
            <Button onClick={handleVerify} size="lg">
              Verificar Respuestas
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showGradeModal} onOpenChange={setShowGradeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Calificación del Ejercicio</DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <div className="text-6xl font-bold text-primary mb-4">
              {grade}%
            </div>
            <p className="text-muted-foreground mb-6">
              {grade >= 70 ? '¡Buen trabajo!' : 'Sigue practicando'}
            </p>
            <Button 
              onClick={handleSaveGrade} 
              disabled={isSaving}
              size="lg"
            >
              {isSaving ? 'Guardando...' : 'Guardar Calificación'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

