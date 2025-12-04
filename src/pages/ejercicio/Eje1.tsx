import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { normalizeAnswer } from '@/lib/exerciseUtils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MessageCircle } from 'lucide-react';
import DashboardLoader from '@/components/dashboard/DashboardLoader';
import { useExerciseGrade } from '@/hooks/useExerciseGrade';
import { GradeModal } from '@/components/ejercicio/GradeModal';
import { ExplanationModal } from '@/components/ejercicio/ExplanationModal';

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
  const [exercise, setExercise] = useState<ExerciseType1 | null>(initialExercise);
  const [userResponses, setUserResponses] = useState<string[]>([]);
  const [verified, setVerified] = useState(false);
  const [responses, setResponses] = useState<boolean[]>([]);
  const [explanationModalOpen, setExplanationModalOpen] = useState(false);
  const [currentExplanation, setCurrentExplanation] = useState('');

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

  // Initialize states based on total fields
  useEffect(() => {
    if (initialExercise && initialExercise.sections) {
      const initialStates: string[] = [];
      initialExercise.sections.forEach((section: Section) =>
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
    
    openGradeModal(calculatedGrade);
  };

  const handleSaveAndContinue = async () => {
    await saveGrade(true);
  };

  const handleSaveAndBack = async () => {
    await saveGrade(false);
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
      {/* Hero Image - Responsive */}
      <div 
        className="w-full h-32 sm:h-40 md:h-48 bg-cover bg-center" 
        style={{ backgroundImage: 'url(/ejercicio/grammar.png)' }}
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
          <p 
            className="text-sm sm:text-base text-muted-foreground mb-4" 
            dangerouslySetInnerHTML={{ __html: exercise.description }} 
          />
        </div>

        {/* Sections - Responsive */}
        <div className="space-y-6 sm:space-y-8">
          {exercise.sections.map((section, iSection) => (
            <div key={iSection}>
              {section.title && (
                <h4 className="text-base sm:text-lg md:text-xl font-semibold text-center mb-3 sm:mb-4">
                  {section.title}
                </h4>
              )}
              
              <div className="bg-card rounded-lg border overflow-x-auto">
                <div className="flex min-w-max md:min-w-0">
                  {section.columns.map((column, iColumn) => (
                    <div key={iColumn} className="contents">
                      {/* Include Pronouns Column */}
                      {section.includePronouns === iColumn && (
                        <div className="flex-shrink-0 border-r w-20 sm:w-24">
                          {shouldShowColumnTitle(section) && (
                            <div className="p-2 sm:p-4 text-center text-xs sm:text-sm font-semibold bg-muted border-b">
                              Pronombres
                            </div>
                          )}
                          <div>
                            {PRONOUNS.map((pronoun, idx) => (
                              <div key={pronoun}>
                                <div className={`p-2 sm:p-3 text-center text-xs sm:text-sm ${idx % 2 === 0 ? 'bg-background' : 'bg-muted/30'}`}>
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
                        <div className="flex-shrink-0 border-r w-8 sm:w-10">
                          {shouldShowColumnTitle(section) && (
                            <div className="p-2 sm:p-4 text-center font-semibold bg-muted border-b">/</div>
                          )}
                          <div>
                            {column.fields.map((_, idx) => (
                              <div key={idx}>
                                <div className={`p-2 sm:p-3 text-center font-semibold ${idx % 2 === 0 ? 'bg-background' : 'bg-muted/30'}`}>
                                  /
                                </div>
                                {shouldShowAnswer() && <div className="h-5 sm:h-6"></div>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Regular Column */}
                      <div className="flex-1 border-r last:border-r-0 min-w-[100px] sm:min-w-[130px] md:min-w-[150px]">
                        {shouldShowColumnTitle(section) && (
                          <div className="p-2 sm:p-4 text-center text-xs sm:text-sm font-semibold bg-muted border-b">
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
                                <div className={`p-1.5 sm:p-2 ${i % 2 === 0 ? 'bg-background' : 'bg-muted/30'}`}>
                                  {field.shown ? (
                                    <div 
                                      className="text-center py-1.5 sm:py-2 px-2 sm:px-3 bg-muted/50 rounded text-xs sm:text-sm"
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
                                        className={`text-xs sm:text-sm h-8 sm:h-10 ${
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
                                      className={`text-center text-xs sm:text-sm h-8 sm:h-10 ${
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
                                  <div className="px-1.5 sm:px-2 pb-1 sm:pb-2">
                                    <div 
                                      className={`text-[10px] sm:text-xs text-center py-0.5 sm:py-1 flex items-center justify-center gap-1 sm:gap-2 ${
                                        isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                      }`}
                                    >
                                      {!field.shown && (
                                        <>
                                          <span className="truncate">Correcto: {field.value}</span>
                                          {field.explanation && (
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-4 w-4 sm:h-5 sm:w-5 p-0 flex-shrink-0"
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
                        <div className="flex-shrink-0 w-8 sm:w-10">
                          {shouldShowColumnTitle(section) && (
                            <div className="p-2 sm:p-4 text-center font-semibold bg-muted border-b"></div>
                          )}
                          <div>
                            {column.fields.map((_, idx) => (
                              <div key={idx}>
                                <div className={`p-2 sm:p-3 text-center ${idx % 2 === 0 ? 'bg-background' : 'bg-muted/30'}`}>
                                  ?
                                </div>
                                {shouldShowAnswer() && <div className="h-5 sm:h-6"></div>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons - Responsive */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-6 sm:mt-8">
          <Button 
            variant="outline" 
            onClick={handleReset} 
            disabled={!verified}
            className="w-full sm:w-auto"
          >
            Reintentar
          </Button>
          <Button 
            onClick={handleVerify} 
            disabled={verified}
            className="w-full sm:w-auto"
          >
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

      {/* Explanation Modal */}
      <ExplanationModal
        open={explanationModalOpen}
        onOpenChange={setExplanationModalOpen}
        explanation={currentExplanation}
      />
    </div>
  );
}
