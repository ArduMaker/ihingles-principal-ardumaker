import { useState, useEffect } from 'react';
import { Exercise } from '@/data/unidades';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { normalizeAnswer } from '@/lib/exerciseUtils';
import DashboardLoader from '@/components/dashboard/DashboardLoader';
import { ArrowRight, RotateCcw, Check } from 'lucide-react';
import { useExerciseGrade } from '@/hooks/useExerciseGrade';
import { GradeModal } from '@/components/ejercicio/GradeModal';

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

// Color constants
const TIPO7_RED = '#C60000';
const TIPO7_BLUE = '#2148C0';
const TIPO7_GREEN = '#008001';

const colors: { [key: string]: string } = {
  rojo: TIPO7_RED, red: TIPO7_RED,
  azul: TIPO7_BLUE, blue: TIPO7_BLUE,
  verde: TIPO7_GREEN, green: TIPO7_GREEN,
};

const checkAnswer = (userAnswer: string, correctAnswer: string): boolean => {
  if (!userAnswer || userAnswer === 'Elegir') return false;
  return normalizeAnswer(userAnswer) === normalizeAnswer(correctAnswer);
};

export const Eje4 = ({ exercise: initialExercise }: Eje4Props) => {
  const [verified, setVerified] = useState(false);
  const [responses, setResponses] = useState<boolean[]>([]);
  const [userResponses, setUserResponses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const exercise = initialExercise as Type4Exercise;

  // Hook modular para calificación y navegación
  const {
    grade,
    gradeModalOpen,
    saving,
    setGradeModalOpen,
    openGradeModal,
    saveGrade,
    handleClose,
    handleGoBack,
    handleNextExercise,
  } = useExerciseGrade({
    exerciseId: exercise?._id || '',
    unidad: exercise?.unidad || 0,
    exerciseNumber: exercise?.number || 0,
  });

  useEffect(() => {
    if (!isType4Exercise(initialExercise)) return;
    
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

  const getIndex = (iRow: number | null | undefined, i: number): number => {
    if (iRow === null || iRow === undefined) return i;
    let acc = exercise.left.length;
    exercise.right.slice(0, iRow).forEach((row) => (acc += row.length));
    acc += i;
    return acc;
  };

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

    exercise.left.forEach((part, i) => {
      const isCorrect = part.shown || checkAnswer(userResponses[getIndex(null, i)], part.answer);
      results.push(isCorrect);
    });

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
    const gradeValue = total > 0 ? successes / total : 1;

    openGradeModal(gradeValue);
  };

  const handleSaveAndContinue = async () => {
    await saveGrade(true);
  };

  const handleSaveAndBack = async () => {
    await saveGrade(false);
  };

  const getFieldColor = (color?: string): string => {
    if (!color) return '#000000';
    return colors[color.toLowerCase()] || '#000000';
  };

  if (loading) {
    return <DashboardLoader />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Image - Responsive */}
      <div 
        className="w-full h-32 sm:h-40 md:h-48 bg-cover bg-center" 
        style={{ backgroundImage: 'url(/ejercicio/principal1.png)' }}
      >
        <div className="h-full flex items-center justify-end px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
            {exercise.skill}
          </h1>
        </div>
      </div>

      {/* Content - Responsive */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 max-w-6xl">
        <div className="mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2">{exercise.title}</h2>
          {exercise.Description && (
            <p className="text-sm sm:text-base text-muted-foreground whitespace-pre-wrap">{exercise.Description}</p>
          )}
          {exercise.Description2 && (
            <p className="text-xs sm:text-sm text-muted-foreground italic mt-2">{exercise.Description2}</p>
          )}
        </div>

        {/* Structure Title */}
        <h2 className="text-lg sm:text-xl font-bold mb-4" style={{ color: TIPO7_RED }}>Estructura</h2>

        {/* Main Diagram */}
        <div className="border border-border rounded-lg p-3 sm:p-4 md:p-6 bg-card overflow-x-auto">
          <div className="flex flex-col lg:flex-row items-center lg:items-stretch gap-4 min-w-max lg:min-w-0">
            
            {/* Left Column */}
            <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 p-2 sm:p-4 min-w-fit">
              {exercise.left.map((part, i, arr) => (
                <div key={`left-${i}`} className="flex items-center gap-1">
                  {part.shown ? (
                    <span 
                      className={`font-medium px-1.5 sm:px-2 py-1 text-xs sm:text-sm ${part.tachado ? 'line-through' : ''}`}
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
                        className="w-24 sm:w-32 md:w-36 text-xs sm:text-sm h-8 sm:h-10"
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
                          <SelectItem key={io} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {verified && !part.shown && !responses[getIndex(null, i)] && (
                    <span className="text-[10px] sm:text-xs text-green-600 ml-1">({part.answer})</span>
                  )}
                  {i + 1 < arr.length && <span className="mx-0.5 sm:mx-1 font-bold text-sm sm:text-base">+</span>}
                </div>
              ))}
            </div>

            {/* Arrow Section */}
            <ArrowRenderer count={exercise.right.length} />

            {/* Right Column */}
            <div className="flex flex-col justify-center gap-2 sm:gap-4 min-w-fit">
              {exercise.right.map((row, iRow) => (
                <div 
                  key={`right-row-${iRow}`} 
                  className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 p-2 sm:p-3 bg-muted/30 rounded-lg"
                >
                  {row.map((part, i, arr) => (
                    <div key={`right-${iRow}-${i}`} className="flex items-center gap-1">
                      {part.shown ? (
                        <span 
                          className={`font-medium px-1.5 sm:px-2 py-1 text-xs sm:text-sm ${part.tachado ? 'line-through' : ''}`}
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
                            className="w-24 sm:w-32 md:w-36 text-xs sm:text-sm h-8 sm:h-10"
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
                              <SelectItem key={io} value={option}>{option}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      {verified && !part.shown && !responses[getIndex(iRow, i)] && (
                        <span className="text-[10px] sm:text-xs text-green-600 ml-1">({part.answer})</span>
                      )}
                      {i + 1 < arr.length && <span className="mx-0.5 sm:mx-1 font-bold text-sm sm:text-base">+</span>}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons - Responsive */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-6 sm:mt-8">
          <Button 
            onClick={handleReset} 
            variant="outline" 
            className="w-full sm:w-auto gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reintentar
          </Button>
          <Button 
            onClick={handleVerify} 
            className="w-full sm:w-auto gap-2"
            disabled={verified}
          >
            <Check className="h-4 w-4" />
            Verificar
          </Button>
        </div>
      </div>

      {/* Grade Modal */}
      <GradeModal
        open={gradeModalOpen}
        onOpenChange={setGradeModalOpen}
        grade={grade}
        saving={saving}
        onClose={handleClose}
        onGoBack={handleSaveAndBack}
        onNextExercise={handleSaveAndContinue}
      />
    </div>
  );
};

// Arrow component - Responsive
const ArrowRenderer = ({ count }: { count: number }) => {
  const leftHeight: { [key: number]: string } = {
    1: '0px', 2: '60px', 3: '120px', 4: '180px',
  };

  return (
    <div className="flex items-center my-2 sm:my-4 lg:my-0 mx-2 sm:mx-4">
      <div className="w-4 sm:w-8 h-1.5 sm:h-2 bg-foreground rounded-l"></div>
      {count > 1 && (
        <div 
          className="w-1.5 sm:w-2 bg-foreground"
          style={{ height: leftHeight[count] || '120px' }}
        ></div>
      )}
      <div className="flex flex-col justify-center gap-4 sm:gap-8">
        {Array(count).fill('').map((_, i) => (
          <Arrow key={i} />
        ))}
      </div>
    </div>
  );
};

const Arrow = () => (
  <div className="flex items-center">
    <div className="w-6 sm:w-12 h-1.5 sm:h-2 bg-foreground"></div>
    <div 
      className="w-0 h-0"
      style={{
        borderLeft: '12px solid hsl(var(--foreground))',
        borderTop: '6px solid transparent',
        borderBottom: '6px solid transparent',
      }}
    ></div>
  </div>
);

export default Eje4;
