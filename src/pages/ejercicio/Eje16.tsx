import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { MessageCircle } from 'lucide-react';
import { postUserGrade, postUserPosition } from '@/lib/api';
import { toast } from 'sonner';
import { Calculate_index_exercise } from '@/hooks/calculate_index.ts';
import DashboardLoader from '@/components/dashboard/DashboardLoader';
import { normalizeAnswer } from '@/lib/exerciseUtils';

const PRONOUNS = ['I', 'You', 'He', 'She', 'It', 'We', 'You', 'They'];

interface Field {
  shown: boolean;
  value: string | [string, string[]];
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

interface SectionGroup {
  title: string;
  sections: Section[];
}

interface Type16Exercise {
  _id: string;
  skill?: string;
  type: number;
  number?: number;
  unidad?: number;
  title?: string;
  description?: string;
  sectionGroups: SectionGroup[];
}

interface Eje16Props {
  exercise: Type16Exercise | any;
}

// Get plain value from field value (handles array format)
const getPlainValue = (value: string | [string, string[]] | any): string => {
  if (!value) return '';
  if (Array.isArray(value)) return value[0];
  if (typeof value === 'object' && value.value) return value.value;
  return String(value);
};

// Check answer against multiple valid answers
const checkAnswerType16 = (
  userAnswer: string,
  correctValue: string | [string, string[]] | any,
  answer2?: string,
  answer3?: string,
  answer4?: string,
  answer5?: string,
  answer6?: string,
  answer7?: string,
  answer8?: string,
  answer9?: string,
  answer10?: string,
  answer11?: string,
  answer12?: string
): boolean => {
  if (!userAnswer || userAnswer.trim() === '') return false;

  const normalizedUser = normalizeAnswer(userAnswer);
  const mainAnswer = getPlainValue(correctValue);

  const validAnswers = [
    mainAnswer, answer2, answer3, answer4, answer5, answer6,
    answer7, answer8, answer9, answer10, answer11, answer12
  ].filter(Boolean);

  return validAnswers.some(answer => {
    const normalizedAnswer = normalizeAnswer(answer!);
    return normalizedUser === normalizedAnswer;
  });
};

export function Eje16({ exercise: initialExercise }: Eje16Props) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exercise, setExercise] = useState<Type16Exercise | null>(null);
  const [loading, setLoading] = useState(true);

  // State for user responses and verification
  const [userResponses, setUserResponses] = useState<(string | null)[]>([]);
  const [verified, setVerified] = useState(false);
  const [responses, setResponses] = useState<(boolean | null)[]>([]);

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

      // Count total number of fields across all section groups
      const initialStates: (string | null)[] = [];
      initialExercise.sectionGroups?.forEach((group: SectionGroup) =>
        group.sections.forEach((section: Section) =>
          section.columns.forEach((column: Column) =>
            column.fields.forEach(() => initialStates.push(null))
          )
        )
      );

      setUserResponses(initialStates);
      setResponses(initialStates.map(() => null));
      setLoading(false);
    }
  }, [initialExercise]);

  if (loading || !exercise) {
    return <DashboardLoader />;
  }

  // Get linear index from group, section, column, and field indices
  const getIndex = (iGroup: number, iSection: number, iColumn: number, i: number): number => {
    const sizes: number[] = [];
    exercise.sectionGroups
      .slice(0, iGroup)
      .forEach((group) =>
        group.sections.forEach((section) =>
          section.columns.forEach((column) => sizes.push(column.fields.length))
        )
      );
    exercise.sectionGroups[iGroup].sections
      .slice(0, iSection)
      .forEach((section) =>
        section.columns.forEach((column) => sizes.push(column.fields.length))
      );
    exercise.sectionGroups[iGroup].sections[iSection].columns
      .slice(0, iColumn)
      .forEach((column) => sizes.push(column.fields.length));
    return sizes.reduce((a, b) => a + b, 0) + i;
  };

  // Check if field at index is shown (not editable)
  const isShown = (generalIndex: number): boolean => {
    let current = 0;
    for (const group of exercise.sectionGroups) {
      for (const section of group.sections) {
        for (const column of section.columns) {
          for (const field of column.fields) {
            if (current === generalIndex) return field.shown;
            current++;
          }
        }
      }
    }
    return false;
  };

  // Get field at specific index
  const getFieldByIndex = (generalIndex: number): Field | undefined => {
    let current = 0;
    for (const group of exercise.sectionGroups) {
      for (const section of group.sections) {
        for (const column of section.columns) {
          for (const field of column.fields) {
            if (current === generalIndex) return field;
            current++;
          }
        }
      }
    }
    return undefined;
  };

  const shouldShowColumnTitle = (section: Section): boolean =>
    section.columns.some((column) => column.title);

  const shouldShowAnswer = (): boolean =>
    verified && responses.some((x) => x === false);

  const getFontSize = (length: number): string => {
    if (length < 10) return '14px';
    switch (length) {
      case 11:
        return '13px';
      case 12:
        return '12px';
      default:
        return '11px';
    }
  };

  const handleChange = (i: number, value: string) => {
    setUserResponses((old) => {
      const copy = [...old];
      copy[i] = value;
      return copy;
    });
  };

  const handleVerify = () => {
    const answers: Field[] = [];
    exercise.sectionGroups.forEach((group) =>
      group.sections.forEach((section) =>
        section.columns.forEach((column) =>
          column.fields.forEach((field) => answers.push(field))
        )
      )
    );

    const responsesCheck: boolean[] = [];
    answers.forEach((answer, iAns) => {
      if (answer.shown) return responsesCheck.push(true);
      responsesCheck.push(
        checkAnswerType16(
          userResponses[iAns] || '',
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

    // Calculate grade (excluding shown fields)
    const computableResults = responsesCheck.filter((_, i) => !isShown(i));
    const total = computableResults.length;
    const successes = computableResults.filter((x) => x).length;
    const calculatedGrade = total > 0 ? successes / total : 1;

    setGrade(calculatedGrade);
    setGradeModalOpen(true);
  };

  const handleReset = () => {
    const initialStates: (string | null)[] = [];
    exercise.sectionGroups?.forEach((group: SectionGroup) =>
      group.sections.forEach((section: Section) =>
        section.columns.forEach((column: Column) =>
          column.fields.forEach(() => initialStates.push(null))
        )
      )
    );
    setUserResponses(initialStates);
    setResponses(initialStates.map(() => null));
    setVerified(false);
  };

  const showExplanation = (text?: string) => {
    if (text) {
      setCurrentExplanation(text);
      setExplanationModalOpen(true);
    }
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

  const getInputBorderColor = (index: number): string => {
    if (!verified) return 'border-border';
    if (responses[index] === null) return 'border-border';
    return responses[index] ? 'border-green-500' : 'border-red-500';
  };

  const getInputBgColor = (index: number): string => {
    if (!verified) return '';
    if (responses[index] === null) return '';
    return responses[index] ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20';
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
          <h1 className="text-2xl font-bold text-foreground">{exercise.title || 'Ejercicio Tipo 16'}</h1>
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

      {/* Section Groups */}
      <div className="space-y-8">
        {exercise.sectionGroups.map((group, iGroup) => (
          <div key={`group-${iGroup}`}>
            {/* Group Title */}
            <h2 className="text-xl font-bold text-center mb-4 text-primary">{group.title}</h2>

            {/* Sections within group */}
            <div className="space-y-6">
              {group.sections.map((section, iSection) => (
                <Card key={`section-${iGroup}-${iSection}`}>
                  <CardContent className="p-4">
                    {section.title && (
                      <h4 className="text-lg font-semibold text-center mb-4">{section.title}</h4>
                    )}

                    <div className="overflow-x-auto">
                      <div className="flex min-w-fit">
                        {section.columns.map((column, iColumn) => (
                          <div key={`col-wrapper-${iColumn}`} className="flex">
                            {/* Include Pronouns Column */}
                            {section.includePronouns === iColumn && (
                              <div className="flex-shrink-0 border-r border-border">
                                {shouldShowColumnTitle(section) && (
                                  <div className="p-3 text-center font-semibold bg-muted border-b border-border text-sm">
                                    Pronombres
                                  </div>
                                )}
                                <div>
                                  {PRONOUNS.map((pronoun, idx) => (
                                    <div key={`pronoun-${idx}`}>
                                      <div className={`p-2 text-center text-sm min-w-[80px] ${idx % 2 === 0 ? 'bg-background' : 'bg-muted/30'}`}>
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
                              <div className="flex-shrink-0 border-r border-border">
                                {shouldShowColumnTitle(section) && (
                                  <div className="p-3 text-center font-semibold bg-muted border-b border-border text-sm">/</div>
                                )}
                                <div>
                                  {column.fields.map((_, idx) => (
                                    <div key={`sep-${idx}`}>
                                      <div className={`p-2 text-center font-semibold text-sm ${idx % 2 === 0 ? 'bg-background' : 'bg-muted/30'}`}>
                                        /
                                      </div>
                                      {shouldShowAnswer() && <div className="h-6"></div>}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Regular Column */}
                            <div className="flex-1 border-r border-border last:border-r-0 min-w-[120px]">
                              {shouldShowColumnTitle(section) && (
                                <div className="p-3 text-center font-semibold bg-muted border-b border-border text-sm">
                                  {column.title || ''}
                                </div>
                              )}
                              <div>
                                {column.fields.map((field, i) => {
                                  const fieldIndex = getIndex(iGroup, iSection, iColumn, i);
                                  const isCorrect = responses[fieldIndex];
                                  const showResult = verified && !field.shown;

                                  return (
                                    <div key={`field-${fieldIndex}`}>
                                      <div className={`p-2 ${i % 2 === 0 ? 'bg-background' : 'bg-muted/30'}`}>
                                        {field.shown ? (
                                          <div
                                            className="text-center py-1 px-2 bg-muted/50 rounded text-sm"
                                            style={{ fontSize: getFontSize(getPlainValue(field.value).length) }}
                                          >
                                            {getPlainValue(field.value)}
                                          </div>
                                        ) : (
                                          <Input
                                            value={userResponses[fieldIndex] || ''}
                                            onChange={(e) => handleChange(fieldIndex, e.target.value)}
                                            disabled={verified}
                                            className={`text-center text-sm h-8 ${getInputBorderColor(fieldIndex)} ${getInputBgColor(fieldIndex)}`}
                                          />
                                        )}
                                      </div>
                                      {shouldShowAnswer() && (
                                        <div className="px-2 pb-1">
                                          <div
                                            className={`text-xs text-center py-1 flex items-center justify-center gap-1 cursor-pointer ${
                                              isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                            }`}
                                            onClick={() => showExplanation(field.explanation)}
                                          >
                                            {!field.shown && (
                                              <>
                                                <span>{getPlainValue(field.value)}</span>
                                                {field.explanation && (
                                                  <MessageCircle className="h-3 w-3" />
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
                                  <div className="p-3 text-center font-semibold bg-muted border-b border-border text-sm"></div>
                                )}
                                <div>
                                  {column.fields.map((_, idx) => (
                                    <div key={`qm-${idx}`}>
                                      <div className={`p-2 text-center text-sm ${idx % 2 === 0 ? 'bg-background' : 'bg-muted/30'}`}>
                                        ?
                                      </div>
                                      {shouldShowAnswer() && <div className="h-6"></div>}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

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
