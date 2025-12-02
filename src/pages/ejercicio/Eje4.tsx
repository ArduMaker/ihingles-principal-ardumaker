import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Exercise } from '@/data/unidades';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { postUserGrade, postUserPosition } from '@/lib/api';
import { toast } from 'sonner';
import { normalizeAnswer } from '@/lib/exerciseUtils';
import { Calculate_index_exercise } from '@/hooks/calculate_index';
import DashboardLoader from '@/components/dashboard/DashboardLoader';
import { ArrowRight, RotateCcw, Check } from 'lucide-react';

interface Eje4Props {
  exercise: Exercise;
}

interface FieldItem {
  answer: string;
  shown?: boolean;
  color?: string;
  options?: string[];
  tachado?: boolean;
  answer2?: string;
  answer3?: string;
  explanation?: string;
}

type Type4Exercise = Exercise & {
  left: FieldItem[];
  right: FieldItem[][];
  Description?: string;
  Description2?: string;
};

const isType4Exercise = (exercise: Exercise): exercise is Type4Exercise => {
  return 'left' in exercise && 'right' in exercise;
};

// Color constants matching the old component
const TIPO7_RED = '#C60000';
const TIPO7_BLUE = '#2148C0';
const TIPO7_GREEN = '#008001';

const colors: { [key: string]: string } = {
  rojo: TIPO7_RED,
  red: TIPO7_RED,
  azul: TIPO7_BLUE,
  blue: TIPO7_BLUE,
  verde: TIPO7_GREEN,
  green: TIPO7_GREEN,
};

// Check answer function matching old logic
const checkAnswer = (userAnswer: string, correctAnswer: string): boolean => {
  if (!userAnswer || userAnswer === 'Elegir') return false;
  return normalizeAnswer(userAnswer) === normalizeAnswer(correctAnswer);
};

export const Eje4 = ({ exercise: initialExercise }: Eje4Props) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [verified, setVerified] = useState(false);
  const [responses, setResponses] = useState<boolean[]>([]);
  const [userResponses, setUserResponses] = useState<string[]>([]);
  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [grade, setGrade] = useState(0);
  const [loading, setLoading] = useState(true);

  // Initialize responses
  useEffect(() => {
    if (!isType4Exercise(initialExercise)) return;
    
    const exercise = initialExercise;
    const initialStates: string[] = [];
    
    exercise.left.forEach(() => initialStates.push('Elegir'));
    exercise.right.forEach((row) =>
      row.forEach(() => initialStates.push('Elegir'))
    );
    
    setUserResponses(initialStates);
    setResponses(initialStates.map(() => false));
    setLoading(false);
  }, [initialExercise]);

  if (!isType4Exercise(initialExercise)) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Estructura de ejercicio tipo 4 no válida</p>
      </div>
    );
  }

  const exercise = initialExercise;

  // Get linear index for a field (matching old logic exactly)
  const getIndex = (iRow: number | null | undefined, i: number): number => {
    if (iRow === null || iRow === undefined) return i;
    let acc = exercise.left.length;
    exercise.right.slice(0, iRow).forEach((row) => (acc += row.length));
    acc += i;
    return acc;
  };

  // Check if a field at given index is shown
  const isShown = (generalIndex: number): boolean => {
    if (generalIndex < exercise.left.length) {
      return !!exercise.left[generalIndex].shown;
    }

    let current = exercise.left.length;
    for (const row of exercise.right) {
      for (const part of row) {
        if (current === generalIndex) return !!part.shown;
        else current++;
      }
    }
    return false;
  };

  const handleChange = (index: number, value: string) => {
    setUserResponses((old) => {
      const data = [...old];
      data[index] = value;
      return data;
    });
  };

  const handleReset = () => {
    const initialStates: string[] = [];
    exercise.left.forEach(() => initialStates.push('Elegir'));
    exercise.right.forEach((row) =>
      row.forEach(() => initialStates.push('Elegir'))
    );
    setUserResponses(initialStates);
    setResponses(initialStates.map(() => false));
    setVerified(false);
  };

  const handleVerify = () => {
    const results: boolean[] = [];

    // Validate left column
    exercise.left.forEach((part, i) => {
      const isCorrect = part.shown || checkAnswer(userResponses[getIndex(null, i)], part.answer);
      results.push(isCorrect);
    });

    // Validate right columns
    exercise.right.forEach((row, iRow) =>
      row.forEach((part, i) => {
        const isCorrect = part.shown || checkAnswer(userResponses[getIndex(iRow, i)], part.answer);
        results.push(isCorrect);
      })
    );

    setVerified(true);
    setResponses(results);

    // Calculate grade (only count non-shown fields)
    const computableResults = results.filter((_, i) => !isShown(i));
    const total = computableResults.length;
    const successes = computableResults.filter((x) => x).length;
    const gradeValue = total > 0 ? Math.round((successes / total) * 100) : 0;

    setGrade(gradeValue);
    setGradeModalOpen(true);
  };

  const handleSaveGrade = async (continueToNext: boolean = false) => {
    try {
      await postUserGrade(
        (exercise.number || 0).toString(),
        grade,
        (exercise.unidad || 0).toString()
      );

      const exerciseIndex = await Calculate_index_exercise(exercise);
      if (exerciseIndex !== -1) {
        await postUserPosition({
          unidad: exercise.unidad,
          position: exerciseIndex
        });
      }

      toast.success('Progreso guardado correctamente');
      setGradeModalOpen(false);

      if (continueToNext) {
        const nextExerciseNumber = (exercise.number || 0) + 1;
        navigate(`/ejercicio/${id}/${nextExerciseNumber}`);
      } else {
        navigate(`/unidad/${id}`);
      }
    } catch (error) {
      console.error('Error saving grade:', error);
      toast.error('Error al guardar el progreso');
    }
  };

  const getFieldColor = (color?: string): string => {
    if (!color) return '#000000';
    return colors[color.toLowerCase()] || '#000000';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <DashboardLoader />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Hero Image */}
      <div className="w-full rounded-xl overflow-hidden mb-6">
        <img 
          src="/ejercicio/principal1.png" 
          alt="Exercise" 
          className="w-full h-32 md:h-48 object-cover"
        />
      </div>

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">{exercise.title}</h1>
        {exercise.Description && (
          <p className="text-muted-foreground whitespace-pre-wrap">{exercise.Description}</p>
        )}
        {exercise.Description2 && (
          <p className="text-muted-foreground text-sm whitespace-pre-wrap italic mt-2">
            {exercise.Description2}
          </p>
        )}
      </div>

      {/* Structure Title */}
      <h2 className="text-xl font-bold" style={{ color: TIPO7_RED }}>Estructura</h2>

      {/* Main Diagram: Left + Arrow + Right */}
      <div className="border border-border rounded-lg p-4 md:p-6 bg-card">
        <div className="flex flex-col lg:flex-row items-center lg:items-stretch gap-4">
          
          {/* Left Column */}
          <div className="flex flex-wrap items-center justify-center gap-2 p-4 min-w-fit">
            {exercise.left.map((part, i, arr) => (
              <div key={`left-${i}`} className="flex items-center gap-1">
                {part.shown ? (
                  <span 
                    className={`font-medium px-2 py-1 ${part.tachado ? 'line-through' : ''}`}
                    style={{ color: getFieldColor(part.color) }}
                  >
                    {part.answer}
                  </span>
                ) : (
                  <Select
                    value={userResponses[getIndex(null, i)] || 'Elegir'}
                    onValueChange={(value) => handleChange(getIndex(null, i), value)}
                    disabled={verified}
                  >
                    <SelectTrigger 
                      className="w-[140px] text-sm"
                      style={{
                        color: getFieldColor(part.color),
                        borderColor: !verified ? 'hsl(var(--border))' : 
                          responses[getIndex(null, i)] ? '#22c55e' : '#ef4444',
                        borderWidth: verified ? '2px' : '1px',
                        backgroundColor: !verified ? 'transparent' : 
                          responses[getIndex(null, i)] ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      }}
                    >
                      <SelectValue placeholder="Elegir" />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      <SelectItem value="Elegir">Elegir</SelectItem>
                      {part.options?.map((option, io) => (
                        <SelectItem key={io} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {/* Show correct answer after verification */}
                {verified && !part.shown && !responses[getIndex(null, i)] && (
                  <span className="text-xs text-green-600 ml-1">({part.answer})</span>
                )}
                {i + 1 < arr.length && (
                  <span className="mx-1 font-bold">+</span>
                )}
              </div>
            ))}
          </div>

          {/* Arrow Section */}
          <ArrowRenderer count={exercise.right.length} />

          {/* Right Column (Multiple Rows) */}
          <div className="flex flex-col justify-center gap-4 min-w-fit">
            {exercise.right.map((row, iRow) => (
              <div 
                key={`right-row-${iRow}`} 
                className="flex flex-wrap items-center justify-center gap-2 p-3 bg-muted/30 rounded-lg"
              >
                {row.map((part, i, arr) => (
                  <div key={`right-${iRow}-${i}`} className="flex items-center gap-1">
                    {part.shown ? (
                      <span 
                        className={`font-medium px-2 py-1 ${part.tachado ? 'line-through' : ''}`}
                        style={{ color: getFieldColor(part.color) }}
                      >
                        {part.answer}
                      </span>
                    ) : (
                      <Select
                        value={userResponses[getIndex(iRow, i)] || 'Elegir'}
                        onValueChange={(value) => handleChange(getIndex(iRow, i), value)}
                        disabled={verified}
                      >
                        <SelectTrigger 
                          className="w-[140px] text-sm"
                          style={{
                            color: getFieldColor(part.color),
                            borderColor: !verified ? 'hsl(var(--border))' : 
                              responses[getIndex(iRow, i)] ? '#22c55e' : '#ef4444',
                            borderWidth: verified ? '2px' : '1px',
                            backgroundColor: !verified ? 'transparent' : 
                              responses[getIndex(iRow, i)] ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          }}
                        >
                          <SelectValue placeholder="Elegir" />
                        </SelectTrigger>
                        <SelectContent className="bg-background z-50">
                          <SelectItem value="Elegir">Elegir</SelectItem>
                          {part.options?.map((option, io) => (
                            <SelectItem key={io} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {/* Show correct answer after verification */}
                    {verified && !part.shown && !responses[getIndex(iRow, i)] && (
                      <span className="text-xs text-green-600 ml-1">({part.answer})</span>
                    )}
                    {i + 1 < arr.length && (
                      <span className="mx-1 font-bold">+</span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 pt-6">
        <Button 
          onClick={handleReset} 
          variant="outline" 
          size="lg"
          className="gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reintentar
        </Button>
        <Button 
          onClick={handleVerify} 
          size="lg"
          className="gap-2"
          disabled={verified}
        >
          <Check className="h-4 w-4" />
          Verificar
        </Button>
      </div>

      {/* Grade Modal */}
      <Dialog open={gradeModalOpen} onOpenChange={setGradeModalOpen}>
        <DialogContent className="bg-background">
          <DialogHeader>
            <DialogTitle>Resultado del Ejercicio</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center py-6">
              <p className="text-5xl font-bold text-primary">{grade}%</p>
              <p className="text-muted-foreground mt-2">
                Respuestas correctas
              </p>
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="ghost" onClick={() => setGradeModalOpen(false)}>
              Cerrar
            </Button>
            <Button variant="outline" onClick={() => handleSaveGrade(false)}>
              Volver al Menú
            </Button>
            <Button onClick={() => handleSaveGrade(true)} className="gap-2">
              Siguiente Ejercicio
              <ArrowRight className="h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Arrow component matching old visual
const ArrowRenderer = ({ count }: { count: number }) => {
  const leftHeight: { [key: number]: string } = {
    1: '0px',
    2: '88px',
    3: '168px',
    4: '248px',
  };

  return (
    <div className="flex items-center my-4 lg:my-0 mx-4">
      {/* Horizontal line from left */}
      <div className="w-8 h-2 bg-foreground rounded-l"></div>
      
      {/* Vertical line (only if multiple rows) */}
      {count > 1 && (
        <div 
          className="w-2 bg-foreground"
          style={{ height: leftHeight[count] || '168px' }}
        ></div>
      )}
      
      {/* Arrow heads */}
      <div className="flex flex-col justify-center gap-8">
        {Array(count).fill('').map((_, i) => (
          <Arrow key={i} />
        ))}
      </div>
    </div>
  );
};

const Arrow = () => {
  return (
    <div className="flex items-center">
      <div className="w-12 h-2 bg-foreground"></div>
      <div 
        className="w-0 h-0"
        style={{
          borderLeft: '20px solid hsl(var(--foreground))',
          borderTop: '10px solid transparent',
          borderBottom: '10px solid transparent',
        }}
      ></div>
    </div>
  );
};

export default Eje4;
