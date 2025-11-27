import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import DashboardLoader from '@/components/dashboard/DashboardLoader';

interface Field {
  shown: boolean;
  value: string;
}

interface Column {
  title: string;
  fields: Field[];
}

interface Section {
  includeSeparator?: number;
  columns: Column[];
}

interface ExerciseType1 {
  _id: string;
  skill: string;
  type: number;
  number: number;
  unidad: number;
  title: string;
  description: string;
  sections: Section[];
  completedByUser?: boolean;
  position?: number;
}

interface Eje1Props {
  exercise: any;
}

export default function Eje1({ exercise: initialExercise }: Eje1Props) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exercise, setExercise] = useState<ExerciseType1 | null>(initialExercise);
  const [userAnswers, setUserAnswers] = useState<string[][]>([]);
  const [verified, setVerified] = useState(false);
  const [results, setResults] = useState<boolean[][]>([]);
  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [grade, setGrade] = useState(0);
  const [explanationModalOpen, setExplanationModalOpen] = useState(false);
  const [currentExplanation, setCurrentExplanation] = useState('');

  useEffect(() => {
    if (initialExercise && initialExercise.sections && initialExercise.sections[0]) {
      const numCols = initialExercise.sections[0].columns.length;
      const numRows = initialExercise.sections[0].columns[0].fields.length;
      const initialAnswers = Array(numCols).fill(null).map(() => Array(numRows).fill(''));
      setUserAnswers(initialAnswers);
      setResults(Array(numCols).fill(null).map(() => Array(numRows).fill(false)));
    }
  }, [initialExercise]);

  const handleInputChange = (colIndex: number, rowIndex: number, value: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[colIndex][rowIndex] = value;
    setUserAnswers(newAnswers);
  };

  const handleVerify = () => {
    if (!exercise || !exercise.sections[0]) return;

    const section = exercise.sections[0];
    const newResults: boolean[][] = [];
    let totalComputable = 0;
    let correctAnswers = 0;

    section.columns.forEach((column, colIndex) => {
      const colResults: boolean[] = [];
      column.fields.forEach((field, rowIndex) => {
        if (field.shown) {
          colResults.push(true);
        } else {
          totalComputable++;
          const userAnswer = normalizeAnswer(userAnswers[colIndex][rowIndex]);
          const correctAnswer = normalizeAnswer(field.value);
          const isCorrect = userAnswer === correctAnswer;
          colResults.push(isCorrect);
          if (isCorrect) correctAnswers++;
        }
      });
      newResults.push(colResults);
    });

    setResults(newResults);
    setVerified(true);

    // Calculate grade
    const calculatedGrade = totalComputable > 0 ? correctAnswers / totalComputable : 1;
    setGrade(calculatedGrade);
    setGradeModalOpen(true);
  };

  const handleSaveGrade = async () => {
    if (!exercise) return;

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
      navigate(`/unidad/${id}`);
    } catch (error) {
      console.error('Error saving grade:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar tu progreso',
        variant: 'destructive',
      });
    }
  };

  const handleReset = () => {
    if (exercise && exercise.sections[0]) {
      const numCols = exercise.sections[0].columns.length;
      const numRows = exercise.sections[0].columns[0].fields.length;
      const initialAnswers = Array(numCols).fill(null).map(() => Array(numRows).fill(''));
      setUserAnswers(initialAnswers);
      setResults(Array(numCols).fill(null).map(() => Array(numRows).fill(false)));
      setVerified(false);
    }
  };

  if (!exercise) {
    return (
      <DashboardLoader />
    );
  }

  const section = exercise.sections[0];
  const numRows = section.columns[0].fields.length;
  const separator = section.includeSeparator;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Image */}
      <div className="w-full h-48 bg-cover bg-center" style={{ backgroundImage: 'url(/ejercicio/grammar.png)' }}>
        <div className="h-full flex items-center justify-end px-8">
          <h1 className="text-4xl font-bold text-white">{exercise.skill}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">{exercise.title}</h2>
          <p className="text-muted-foreground mb-4" dangerouslySetInnerHTML={{ __html: exercise.description }} />
        </div>

        {/* Table */}
        <div className="bg-card rounded-lg border overflow-hidden mb-6">
          <table className="w-full">
            <thead>
              <tr className="bg-muted">
                {section.columns.map((column, colIndex) => (
                  <th key={colIndex} className="p-4 text-center font-semibold border-r last:border-r-0">
                    {column.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: numRows }).map((_, rowIndex) => (
                <>
                  <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                    {section.columns.map((column, colIndex) => {
                      const field = column.fields[rowIndex];
                      const isCorrect = results[colIndex]?.[rowIndex];
                      const showResult = verified && !field.shown;
                      
                      return (
                        <td key={colIndex} className="p-2 border-r last:border-r-0">
                          {field.shown ? (
                            <div className="text-center py-2 px-3 bg-muted/50 rounded">
                              {field.value}
                            </div>
                          ) : (
                            <Input
                              value={userAnswers[colIndex]?.[rowIndex] || ''}
                              onChange={(e) => handleInputChange(colIndex, rowIndex, e.target.value)}
                              disabled={verified}
                              className={`text-center ${
                                showResult
                                  ? isCorrect
                                    ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                                    : 'border-red-500 bg-red-50 dark:bg-red-950/20'
                                  : ''
                              }`}
                            />
                          )}
                          {showResult && !isCorrect && (
                            <p className="text-xs text-green-600 dark:text-green-400 text-center mt-1">
                              Correcto: {field.value}
                            </p>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                  {separator && rowIndex === separator - 1 && (
                    <tr>
                      <td colSpan={section.columns.length} className="p-0">
                        <div className="h-1 bg-primary/20" />
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
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
      </div>

      {/* Grade Modal */}
      <Dialog open={gradeModalOpen} onOpenChange={setGradeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resultado del Ejercicio</DialogTitle>
            <DialogDescription>
              Has obtenido una calificación de {(grade * 100).toFixed(0)}%
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="text-center">
              <div className="text-6xl font-bold text-primary mb-2">
                {(grade * 100).toFixed(0)}%
              </div>
              <p className="text-muted-foreground">
                {grade >= 0.7 ? '¡Excelente trabajo!' : 'Sigue practicando'}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGradeModalOpen(false)}>
              Cerrar
            </Button>
            <Button onClick={handleSaveGrade}>
              Guardar y Continuar
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
            <p dangerouslySetInnerHTML={{ __html: currentExplanation }} />
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
