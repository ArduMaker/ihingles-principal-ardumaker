import { useState, useEffect, useRef } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MessageCircle } from 'lucide-react';
import DashboardLoader from '@/components/dashboard/DashboardLoader';

const COMMON_SELECT_OPTIONS = [
  'Adjetivo',
  'Adverbio',
  'Artículo',
  'Conjunción',
  'Preposición',
  'Pronombre',
  'Sustantivo',
  'Verbo',
];

const PRONOUNS = ['I', 'You', 'He', 'She', 'It', 'We', 'You', 'They'];

interface Field {
  shown: boolean;
  value: string;
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
  explanation?: string;
  useCommonSelect?: boolean;
}

interface Column {
  title?: string;
  fields: Field[];
}

interface Section {
  title?: string;
  includeSeparator?: number;
  includePronouns?: number;
  includeQuestionMark?: boolean;
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
  const [userResponses, setUserResponses] = useState<string[]>([]);
  const [verified, setVerified] = useState(false);
  const [responses, setResponses] = useState<boolean[]>([]);
  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [grade, setGrade] = useState(0);
  const [explanationModalOpen, setExplanationModalOpen] = useState(false);
  const [currentExplanation, setCurrentExplanation] = useState('');

  // Initialize states based on total fields
  useEffect(() => {
    if (initialExercise && initialExercise.sections) {
      const initialStates: string[] = [];
      initialExercise.sections.forEach((section) =>
        section.columns.forEach((column) =>
          column.fields.forEach(() => initialStates.push(''))
        )
      );
      setUserResponses(initialStates);
      setResponses(new Array(initialStates.length).fill(false));
    }
  }, [initialExercise]);

  // Helper functions
  const getFieldByIndex = (generalIndex: number): Field | undefined => {
    let current = 0;
    for (const section of exercise?.sections || []) {
      for (const column of section.columns) {
        for (const field of column.fields) {
          if (current === generalIndex) return field;
          else current++;
        }
      }
    }
  };

  const getIndex = (iSection: number, iColumn: number, i: number): number => {
    if (!exercise) return 0;
    const sizes: number[] = [];
    exercise.sections
      .slice(0, iSection)
      .forEach((section) =>
        section.columns.forEach((column) => sizes.push(column.fields.length))
      );
    exercise.sections[iSection].columns
      .slice(0, iColumn)
      .forEach((column) => sizes.push(column.fields.length));
    return sizes.reduce((a, b) => a + b, 0) + i;
  };

  const isShown = (generalIndex: number): boolean => {
    const field = getFieldByIndex(generalIndex);
    return field?.shown || false;
  };

  const shouldShowColumnTitle = (section: Section): boolean =>
    section.columns.some((column) => column.title);

  const shouldShowAnswer = (): boolean => 
    verified && responses.some((x) => !x);

  const getFontSize = (length: number): string => {
    if (length < 10) return '16px';
    switch (length) {
      case 11:
        return '15px';
      case 12:
        return '14px';
      default:
        return '13px';
    }
  };

  const checkAnswer = (
    userAnswer: string,
    ...correctAnswers: (string | undefined)[]
  ): boolean => {
    const normalizedUser = normalizeAnswer(userAnswer);
    return correctAnswers.some(
      (answer) => answer && normalizeAnswer(answer) === normalizedUser
    );
  };

  const handleChange = (i: number, value: string) => {
    setUserResponses((old) => {
      const copy = [...old];
      copy[i] = value;
      return copy;
    });
  };

  const handleVerify = () => {
    if (!exercise) return;

    const answers: Field[] = [];
    exercise.sections.forEach((section) =>
      section.columns.forEach((column) =>
        column.fields.forEach((field) => answers.push(field))
      )
    );

    const responsesCheck: boolean[] = [];
    answers.forEach((answer, iAns) => {
      if (answer.shown) return responsesCheck.push(true);
      responsesCheck.push(
        checkAnswer(
          userResponses[iAns],
          answer.value,
          answer.answer2,
          answer.answer3,
          answer.answer4,
          answer.answer5,
          answer.answer6,
          answer.answer7,
          answer.answer8,
          answer.answer9,
          answer.answer10,
          answer.answer11,
          answer.answer12
        )
      );
    });

    setResponses(responsesCheck);
    setVerified(true);

    // Calculate grade
    const computableResults = responsesCheck.filter((_, i) => !isShown(i));
    const total = computableResults.length;
    const successes = computableResults.filter((x) => x).length;
    const calculatedGrade = total > 0 ? successes / total : 1;
    
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
    if (exercise) {
      const initialStates: string[] = [];
      exercise.sections.forEach((section) =>
        section.columns.forEach((column) =>
          column.fields.forEach(() => initialStates.push(''))
        )
      );
      setUserResponses(initialStates);
      setResponses(new Array(initialStates.length).fill(false));
      setVerified(false);
    }
  };

  const showExplanation = (text?: string) => {
    if (text) {
      setCurrentExplanation(text);
      setExplanationModalOpen(true);
    }
  };

  if (!exercise) {
    return <DashboardLoader />;
  }

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

        {/* Sections */}
        <div className="space-y-8">
          {exercise.sections.map((section, iSection) => (
            <div key={iSection}>
              {section.title && (
                <h4 className="text-xl font-semibold text-center mb-4">{section.title}</h4>
              )}
              
              <div className="bg-card rounded-lg border overflow-x-auto">
                <div className="flex">
                  {section.columns.map((column, iColumn) => (
                    <>
                      {/* Include Pronouns Column */}
                      {section.includePronouns === iColumn && (
                        <div className="flex-shrink-0 border-r">
                          {shouldShowColumnTitle(section) && (
                            <div className="p-4 text-center font-semibold bg-muted border-b">
                              Pronombres
                            </div>
                          )}
                          <div>
                            {PRONOUNS.map((pronoun, idx) => (
                              <div key={pronoun}>
                                <div className={`p-3 text-center ${idx % 2 === 0 ? 'bg-background' : 'bg-muted/30'}`}>
                                  {pronoun}
                                </div>
                                {shouldShowAnswer() && <div className="h-6"></div>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Include Separator Column */}
                      {section.includeSeparator === iColumn && (
                        <div className="flex-shrink-0 border-r">
                          {shouldShowColumnTitle(section) && (
                            <div className="p-4 text-center font-semibold bg-muted border-b">/</div>
                          )}
                          <div>
                            {column.fields.map((_, idx) => (
                              <div key={idx}>
                                <div className={`p-3 text-center font-semibold ${idx % 2 === 0 ? 'bg-background' : 'bg-muted/30'}`}>
                                  /
                                </div>
                                {shouldShowAnswer() && <div className="h-6"></div>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Regular Column */}
                      <div key={iColumn} className="flex-1 border-r last:border-r-0 min-w-[150px]">
                        {shouldShowColumnTitle(section) && (
                          <div className="p-4 text-center font-semibold bg-muted border-b">
                            {column.title}
                          </div>
                        )}
                        <div>
                          {column.fields.map((field, i) => {
                            const fieldIndex = getIndex(iSection, iColumn, i);
                            const isCorrect = responses[fieldIndex];
                            const showResult = verified && !field.shown;

                            return (
                              <div key={fieldIndex}>
                                <div className={`p-2 ${i % 2 === 0 ? 'bg-background' : 'bg-muted/30'}`}>
                                  {field.shown ? (
                                    <div 
                                      className="text-center py-2 px-3 bg-muted/50 rounded"
                                      style={{ fontSize: getFontSize(field.value.length) }}
                                    >
                                      {field.value}
                                    </div>
                                  ) : field.useCommonSelect ? (
                                    <Select
                                      value={userResponses[fieldIndex] || ''}
                                      onValueChange={(value) => handleChange(fieldIndex, value)}
                                      disabled={verified}
                                    >
                                      <SelectTrigger 
                                        className={`${
                                          showResult
                                            ? isCorrect
                                              ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                                              : 'border-red-500 bg-red-50 dark:bg-red-950/20'
                                            : ''
                                        }`}
                                      >
                                        <SelectValue placeholder="Elegir" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {COMMON_SELECT_OPTIONS.map((option) => (
                                          <SelectItem key={option} value={option}>
                                            {option}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  ) : (
                                    <Input
                                      value={userResponses[fieldIndex] || ''}
                                      onChange={(e) => handleChange(fieldIndex, e.target.value)}
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
                                </div>
                                {shouldShowAnswer() && (
                                  <div className="px-2 pb-2">
                                    <div 
                                      className={`text-xs text-center py-1 flex items-center justify-center gap-2 ${
                                        isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                      }`}
                                    >
                                      {!field.shown && (
                                        <>
                                          <span>Correcto: {field.value}</span>
                                          {field.explanation && (
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-5 w-5 p-0"
                                              onClick={() => showExplanation(field.explanation)}
                                            >
                                              <MessageCircle className="h-3 w-3" />
                                            </Button>
                                          )}
                                        </>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Include Question Mark Column */}
                      {section.includeQuestionMark && iColumn + 1 === section.columns.length && (
                        <div className="flex-shrink-0">
                          {shouldShowColumnTitle(section) && (
                            <div className="p-4 text-center font-semibold bg-muted border-b"></div>
                          )}
                          <div>
                            {column.fields.map((_, idx) => (
                              <div key={idx}>
                                <div className={`p-3 text-center ${idx % 2 === 0 ? 'bg-background' : 'bg-muted/30'}`}>
                                  ?
                                </div>
                                {shouldShowAnswer() && <div className="h-6"></div>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center mt-8">
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
