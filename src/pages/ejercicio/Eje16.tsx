import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, ChevronLeft, RotateCcw } from 'lucide-react';
import DashboardLoader from '@/components/dashboard/DashboardLoader';
import { normalizeAnswer } from '@/lib/exerciseUtils';
import { useExerciseGrade } from '@/hooks/useExerciseGrade';
import { GradeModal } from '@/components/ejercicio/GradeModal';
import { ExplanationModal } from '@/components/ejercicio/ExplanationModal';

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
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [exercise, setExercise] = useState<Type16Exercise | null>(null);
  const [loading, setLoading] = useState(true);

  const currentExerciseIndex = parseInt(searchParams.get('exerciseIndex') || '0');

  // State for user responses and verification
  const [userResponses, setUserResponses] = useState<(string | null)[]>([]);
  const [verified, setVerified] = useState(false);
  const [responses, setResponses] = useState<(boolean | null)[]>([]);

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

    openGradeModal(calculatedGrade);
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
              <CardTitle className="text-xl sm:text-2xl">{exercise.title || 'Ejercicio Tipo 16'}</CardTitle>
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

        <CardContent className="p-4 sm:p-6 pt-0 space-y-6 sm:space-y-8">
          {/* Section Groups */}
          {exercise.sectionGroups.map((group, iGroup) => (
            <div key={`group-${iGroup}`}>
              {/* Group Title */}
              <h2 className="text-lg sm:text-xl font-bold text-center mb-3 sm:mb-4 text-primary">{group.title}</h2>

              {/* Sections within group */}
              <div className="space-y-4 sm:space-y-6">
                {group.sections.map((section, iSection) => (
                  <div key={`section-${iGroup}-${iSection}`} className="bg-muted/20 rounded-lg p-3 sm:p-4">
                    {section.title && (
                      <h4 className="text-base sm:text-lg font-semibold text-center mb-3 sm:mb-4">{section.title}</h4>
                    )}

                    <div className="overflow-x-auto -mx-3 sm:mx-0">
                      <div className="flex min-w-fit px-3 sm:px-0">
                        {section.columns.map((column, iColumn) => (
                          <div key={`col-wrapper-${iColumn}`} className="flex">
                            {/* Include Pronouns Column */}
                            {section.includePronouns === iColumn && (
                              <div className="flex-shrink-0 border-r border-border">
                                {shouldShowColumnTitle(section) && (
                                  <div className="p-2 sm:p-3 text-center font-semibold bg-muted border-b border-border text-xs sm:text-sm">
                                    Pronombres
                                  </div>
                                )}
                                <div>
                                  {PRONOUNS.map((pronoun, idx) => (
                                    <div key={`pronoun-${idx}`}>
                                      <div className={`p-1.5 sm:p-2 text-center text-xs sm:text-sm min-w-[60px] sm:min-w-[80px] ${idx % 2 === 0 ? 'bg-background' : 'bg-muted/30'}`}>
                                        {pronoun}
                                      </div>
                                      {shouldShowAnswer() && <div className="h-5 sm:h-6"></div>}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Include Separator Column */}
                            {section.includeSeparator === iColumn && (
                              <div className="flex-shrink-0 border-r border-border">
                                {shouldShowColumnTitle(section) && (
                                  <div className="p-2 sm:p-3 text-center font-semibold bg-muted border-b border-border text-xs sm:text-sm">/</div>
                                )}
                                <div>
                                  {column.fields.map((_, idx) => (
                                    <div key={`sep-${idx}`}>
                                      <div className={`p-1.5 sm:p-2 text-center font-semibold text-xs sm:text-sm ${idx % 2 === 0 ? 'bg-background' : 'bg-muted/30'}`}>
                                        /
                                      </div>
                                      {shouldShowAnswer() && <div className="h-5 sm:h-6"></div>}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Regular Column */}
                            <div className="flex-1 border-r border-border last:border-r-0 min-w-[90px] sm:min-w-[120px]">
                              {shouldShowColumnTitle(section) && (
                                <div className="p-2 sm:p-3 text-center font-semibold bg-muted border-b border-border text-xs sm:text-sm">
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
                                      <div className={`p-1.5 sm:p-2 ${i % 2 === 0 ? 'bg-background' : 'bg-muted/30'}`}>
                                        {field.shown ? (
                                          <div
                                            className="text-center py-1 px-1 sm:px-2 bg-muted/50 rounded text-xs sm:text-sm"
                                            style={{ fontSize: getFontSize(getPlainValue(field.value).length) }}
                                          >
                                            {getPlainValue(field.value)}
                                          </div>
                                        ) : (
                                          <Input
                                            value={userResponses[fieldIndex] || ''}
                                            onChange={(e) => handleChange(fieldIndex, e.target.value)}
                                            disabled={verified}
                                            className={`text-center text-xs sm:text-sm h-7 sm:h-8 ${getInputBorderColor(fieldIndex)} ${getInputBgColor(fieldIndex)}`}
                                          />
                                        )}
                                      </div>
                                      {shouldShowAnswer() && (
                                        <div className="px-1 sm:px-2 pb-1">
                                          <div
                                            className={`text-xs text-center py-0.5 sm:py-1 flex items-center justify-center gap-1 cursor-pointer ${
                                              isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                            }`}
                                            onClick={() => showExplanation(field.explanation)}
                                          >
                                            {!field.shown && (
                                              <>
                                                <span className="truncate">{getPlainValue(field.value)}</span>
                                                {field.explanation && (
                                                  <MessageCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0" />
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
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
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
            <Button onClick={verified ? () => setGradeModalOpen(true) : handleVerify} className="w-full sm:w-auto">
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
