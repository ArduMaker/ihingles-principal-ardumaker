import { useState, useEffect, Fragment } from 'react';
import { Exercise } from '@/data/unidades';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DashboardLoader from '@/components/dashboard/DashboardLoader';
import { RotateCcw, Check } from 'lucide-react';
import { useExerciseGrade } from '@/hooks/useExerciseGrade';
import { GradeModal } from '@/components/ejercicio/GradeModal';

// Colors
const TIPO7_BLUE = "#01a2ff";
const TIPO7_RED = "#f14736";
const TIPO7_GREEN = "#1eb100";

// Options
const FORMULA_OPTIONS = ["(Wh_)", "Aux", "C", "C?", "Not", "Suj", "Vr", "Vt"];
const PIRAMIDE_OPTIONS = ["Be", "Have", "Inf", "P.Part", "V.(ing)", "Will"];

const FORMULAS_PAGE_OPTIONS = [
  ["(Wh)", "Complemento", "Complemento?", "Did", "Do/does", "Not", "Sujeto", "Verbo infinitivo", "Verbo pasado", "Verbo presente", "Will"],
  ["(Wh)", "Am/Are/Is", "Be", "Complemento", "Complemento?", "Going to", "Not", "Sujeto", "Verbo Gerundio", "Verbo Infinitivo", "Was/were", "Will"],
  ["(Wh)", "Been", "Complemento", "Complemento?", "Had", "Have/Has", "Not", "Sujeto", "Verbo Gerundio", "Verbo Past Participle", "Will"],
];

const DEFAULT_ASIDE_FORMULAS = [
  ["Suj", "Vt", "C"],
  ["Aux", "Vr"],
  ["Suj", "Aux", "Not", "Vr", "C"],
  ["(Wh_)", "Aux", "Suj", "Vr", "C?"],
];

const DEFAULT_ASIDE_PIRAMIDES = [
  { izquierda: "Will", derecha: "Inf" },
  { izquierda: "Have", derecha: "P.Part" },
  { izquierda: "Be", derecha: "V.(ing)" },
];

interface Eje7Props {
  exercise: Exercise;
}

interface Piramide {
  izquierda: string;
  derecha: string;
}

interface VerboTotal {
  left: string;
  right: string | string[];
}

interface FormulasPageData {
  toComplete: string[][];
  options: string[];
  showed?: string[][];
  verboTotal?: VerboTotal;
}

interface Type7Exercise extends Exercise {
  template?: number;
  aside?: {
    formulas?: string[][];
    piramides?: Piramide[];
  };
  center?: {
    verboTotal?: VerboTotal;
  };
  formulasPage?: FormulasPageData;
  top?: string[];
}

const isType7Exercise = (exercise: Exercise): exercise is Type7Exercise => {
  return 'template' in exercise;
};

export const Eje7 = ({ exercise: initialExercise }: Eje7Props) => {
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  // Aside state
  const [asideFormulaResponses, setAsideFormulaResponses] = useState<string[][]>([]);
  const [asideFormulaResults, setAsideFormulaResults] = useState<boolean[][]>([]);
  const [asidePiramideResponses, setAsidePiramideResponses] = useState<[string, string][]>([]);
  const [asidePiramideResults, setAsidePiramideResults] = useState<[boolean, boolean][]>([]);

  // FormulasPage state
  const [formulasPageResponses, setFormulasPageResponses] = useState<string[][]>([]);
  const [formulasPageResults, setFormulasPageResults] = useState<boolean[][]>([]);

  const exercise = initialExercise as Type7Exercise;
  const aside = exercise.aside || { formulas: DEFAULT_ASIDE_FORMULAS, piramides: DEFAULT_ASIDE_PIRAMIDES };
  const formulas = aside.formulas || DEFAULT_ASIDE_FORMULAS;
  const piramides = aside.piramides || DEFAULT_ASIDE_PIRAMIDES;

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

  const getFormulasPageData = (): FormulasPageData & { showed: string[][] } => {
    const showed = aside.formulas
      ? [formulas[0], formulas[2], formulas[3]]
      : [DEFAULT_ASIDE_FORMULAS[0], DEFAULT_ASIDE_FORMULAS[2], DEFAULT_ASIDE_FORMULAS[3]];
    return {
      ...exercise.formulasPage,
      toComplete: exercise.formulasPage?.toComplete || [],
      options: exercise.formulasPage?.options || FORMULAS_PAGE_OPTIONS[0],
      verboTotal: exercise.center?.verboTotal,
      showed,
    };
  };

  const formulasPageData = getFormulasPageData();

  useEffect(() => {
    if (!isType7Exercise(initialExercise)) { setLoading(false); return; }

    setAsideFormulaResponses(formulas.map(formula => formula.map(() => '')));
    setAsideFormulaResults(formulas.map(formula => formula.map(() => false)));
    setAsidePiramideResponses(piramides.map(() => ['', '']));
    setAsidePiramideResults(piramides.map(() => [false, false]));

    const fpToComplete = formulasPageData.toComplete || [];
    setFormulasPageResponses(fpToComplete.map(formula => formula.map(() => '')));
    setFormulasPageResults(fpToComplete.map(formula => formula.map(() => false)));

    setLoading(false);
  }, [initialExercise]);

  if (!isType7Exercise(initialExercise)) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Estructura de ejercicio tipo 7 no válida</p>
      </div>
    );
  }

  const handleAsideFormulaChange = (formulaIndex: number, partIndex: number, value: string) => {
    setAsideFormulaResponses(old => {
      const data = old.map(arr => [...arr]);
      data[formulaIndex][partIndex] = value;
      return data;
    });
  };

  const handleAsidePiramideChange = (piramideIndex: number, side: 0 | 1, value: string) => {
    setAsidePiramideResponses(old => {
      const data = old.map(arr => [...arr] as [string, string]);
      data[piramideIndex][side] = value;
      return data;
    });
  };

  const handleFormulasPageChange = (formulaIndex: number, partIndex: number, value: string) => {
    setFormulasPageResponses(old => {
      const data = old.map(arr => [...arr]);
      data[formulaIndex][partIndex] = value;
      return data;
    });
  };

  const handleReset = () => {
    setAsideFormulaResponses(formulas.map(formula => formula.map(() => '')));
    setAsideFormulaResults(formulas.map(formula => formula.map(() => false)));
    setAsidePiramideResponses(piramides.map(() => ['', '']));
    setAsidePiramideResults(piramides.map(() => [false, false]));

    const fpToComplete = formulasPageData.toComplete || [];
    setFormulasPageResponses(fpToComplete.map(formula => formula.map(() => '')));
    setFormulasPageResults(fpToComplete.map(formula => formula.map(() => false)));

    setVerified(false);
  };

  const handleVerify = () => {
    const newAsideFormulaResults = formulas.map((formula, fi) =>
      formula.map((part, pi) => asideFormulaResponses[fi]?.[pi] === part)
    );
    setAsideFormulaResults(newAsideFormulaResults);

    const newAsidePiramideResults: [boolean, boolean][] = piramides.map((piramide, pi) => [
      asidePiramideResponses[pi]?.[0] === piramide.izquierda,
      asidePiramideResponses[pi]?.[1] === piramide.derecha,
    ]);
    setAsidePiramideResults(newAsidePiramideResults);

    const fpToComplete = formulasPageData.toComplete || [];
    const newFormulasPageResults = fpToComplete.map((formula, fi) =>
      formula.map((part, pi) => formulasPageResponses[fi]?.[pi] === part)
    );
    setFormulasPageResults(newFormulasPageResults);

    const formulaGrades = newAsideFormulaResults.map(results => results.filter(r => r).length / results.length);
    const piramideGrades = newAsidePiramideResults.map(results => results.filter(r => r).length / results.length);

    const topGrade = formulaGrades.reduce((a, b) => a + b, 0) / formulaGrades.length;
    const bottomGrade = piramideGrades.reduce((a, b) => a + b, 0) / piramideGrades.length;
    const asideGrade = topGrade * 0.8 + bottomGrade * 0.2;

    const fpGrades = newFormulasPageResults.map(results => results.filter(r => r).length / results.length);
    const fpGrade = fpGrades.length > 0 ? fpGrades.reduce((a, b) => a + b, 0) / fpGrades.length : 0;

    let finalGrade: number;
    if (fpToComplete.length > 0) {
      finalGrade = (asideGrade + fpGrade) / 2;
    } else {
      finalGrade = asideGrade;
    }

    setVerified(true);
    openGradeModal(finalGrade);
  };

  const handleSaveAndContinue = async () => { await saveGrade(true); };
  const handleSaveAndBack = async () => { await saveGrade(false); };

  const getFormulaColor = (index: number): string => {
    if (index === 0 || index === 1) return TIPO7_BLUE;
    if (index === 2) return TIPO7_RED;
    return TIPO7_GREEN;
  };

  const getFormulaTitle = (index: number): string => {
    if (index === 0) return 'Aff';
    if (index === 1) return '*Vt';
    if (index === 2) return 'Neg';
    return '?';
  };

  const getPiramideColor = (index: number): string => {
    if (index === 0) return TIPO7_RED;
    if (index === 1) return TIPO7_GREEN;
    return TIPO7_BLUE;
  };

  const getPiramideTitle = (index: number): string => {
    if (index === 0) return 'Future';
    if (index === 1) return 'Perfect';
    return 'Continuous';
  };

  if (loading) { return <DashboardLoader />; }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Image - Responsive */}
      <div className="w-full h-32 sm:h-40 md:h-48 bg-cover bg-center" style={{ backgroundImage: 'url(/ejercicio/grammar.png)' }}>
        <div className="h-full flex items-center justify-end px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white drop-shadow-lg">{exercise.skill}</h1>
        </div>
      </div>

      {/* Content - Responsive */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 max-w-4xl">
        <div className="mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2">{exercise.title}</h2>
          {exercise.description && <p className="text-sm sm:text-base text-muted-foreground whitespace-pre-wrap">{exercise.description}</p>}
        </div>

        {/* VerboTotal Section */}
        {formulasPageData.verboTotal && (
          <div className="border border-border rounded-lg p-3 sm:p-4 md:p-6 bg-card mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-center">Verbo Total</h3>
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-center">
                <div className="text-center">
                  <span className="font-bold text-sm sm:text-base" style={{ color: TIPO7_BLUE }}>{formulasPageData.verboTotal.left}</span>
                  <p className="text-[10px] sm:text-xs font-bold" style={{ color: TIPO7_BLUE }}>Auxiliar</p>
                </div>
                <span className="text-lg sm:text-xl">+</span>
                <div className="text-center">
                  {Array.isArray(formulasPageData.verboTotal.right) ? (
                    <div className="flex items-center gap-1 sm:gap-2">
                      {formulasPageData.verboTotal.right.map((text, i, arr) => (
                        <Fragment key={i}>
                          <span className="font-bold text-sm sm:text-base" style={{ color: TIPO7_RED }}>{text}</span>
                          {i + 1 < arr.length && <span>+</span>}
                        </Fragment>
                      ))}
                    </div>
                  ) : (
                    <span className="font-bold text-sm sm:text-base" style={{ color: TIPO7_RED }}>{formulasPageData.verboTotal.right}</span>
                  )}
                  <p className="text-[10px] sm:text-xs font-bold" style={{ color: TIPO7_RED }}>Verbo Restante (Vr)</p>
                </div>
              </div>
              <hr className="w-full border-border my-2" />
              <span className="font-bold text-sm sm:text-lg" style={{ color: '#0076ba' }}>Verbo Total (Vt)</span>
            </div>
          </div>
        )}

        {/* Top Section */}
        {exercise.top && (
          <div className="border border-border rounded-lg p-3 sm:p-4 md:p-6 bg-card mb-4 sm:mb-6">
            <div className="flex flex-col gap-1 sm:gap-2">
              {exercise.top.map((text, i) => (
                <p key={i} className="font-bold text-sm sm:text-lg" style={{ color: i === 0 || i === 2 ? TIPO7_BLUE : TIPO7_RED }}>{text}</p>
              ))}
            </div>
          </div>
        )}

        {/* Showed Formulas */}
        {formulasPageData.showed && formulasPageData.showed.length > 0 && (
          <div className="border border-border rounded-lg p-3 sm:p-4 md:p-6 bg-card mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Fórmulas de Referencia</h3>
            <div className="space-y-2 sm:space-y-3">
              {formulasPageData.showed.map((formula, i) => (
                <div key={i} className="flex items-center gap-1 sm:gap-2 flex-wrap text-xs sm:text-sm" style={{ color: i === 0 ? TIPO7_BLUE : i === 1 ? TIPO7_RED : TIPO7_GREEN }}>
                  <span className="text-foreground font-semibold min-w-[30px] sm:min-w-[40px]">{i === 0 ? 'Aff' : i === 1 ? 'Neg' : '?'}:</span>
                  {formula.map((part, pi, arr) => (
                    <Fragment key={pi}>
                      <span className="font-medium">{part}</span>
                      {pi + 1 < arr.length && <span className="text-foreground">+</span>}
                    </Fragment>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Aside Formulas Section */}
        <div className="border border-border rounded-lg p-3 sm:p-4 md:p-6 bg-card mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Completa las Fórmulas</h3>
          <div className="space-y-3 sm:space-y-4">
            {formulas.map((formula, fi) => (
              <div key={fi} className="flex items-center gap-1 sm:gap-2 flex-wrap" style={{ color: getFormulaColor(fi) }}>
                <span className="font-semibold min-w-[35px] sm:min-w-[50px] text-xs sm:text-sm">{getFormulaTitle(fi)}:</span>
                {formula.map((part, pi, arr) => (
                  <Fragment key={pi}>
                    <Select
                      value={asideFormulaResponses[fi]?.[pi] || ''}
                      onValueChange={(value) => handleAsideFormulaChange(fi, pi, value)}
                      disabled={verified}
                    >
                      <SelectTrigger
                        className="w-16 sm:w-20 md:w-24 h-7 sm:h-9 text-[10px] sm:text-sm"
                        style={{
                          color: getFormulaColor(fi),
                          borderColor: !verified ? 'hsl(var(--border))' : asideFormulaResults[fi]?.[pi] ? '#22c55e' : '#ef4444',
                          borderWidth: verified ? '2px' : '1px',
                          backgroundColor: !verified ? 'transparent' : asideFormulaResults[fi]?.[pi] ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        }}
                      >
                        <SelectValue placeholder="Elegir" />
                      </SelectTrigger>
                      <SelectContent>
                        {FORMULA_OPTIONS.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {pi + 1 < arr.length && <span className="text-foreground text-xs sm:text-sm">+</span>}
                  </Fragment>
                ))}
                {verified && asideFormulaResults[fi]?.some(r => !r) && (
                  <span className="text-[10px] sm:text-sm text-green-600 ml-1 sm:ml-2">({formula.join(' + ')})</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Aside Piramides Section */}
        <div className="border border-border rounded-lg p-3 sm:p-4 md:p-6 bg-card mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Completa las Pirámides</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {piramides.map((piramide, pi) => (
              <div key={pi} className="flex flex-col items-center">
                <span className="font-bold text-xs sm:text-sm mb-2 sm:mb-3" style={{ color: getPiramideColor(pi) }}>{getPiramideTitle(pi)}</span>
                <div className="relative w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32">
                  {/* Triangle shape */}
                  <div className="absolute inset-0" style={{
                    clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                    backgroundColor: getPiramideColor(pi),
                    opacity: 0.2,
                  }}></div>
                  {/* Left side select */}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2">
                    <Select
                      value={asidePiramideResponses[pi]?.[0] || ''}
                      onValueChange={(value) => handleAsidePiramideChange(pi, 0, value)}
                      disabled={verified}
                    >
                      <SelectTrigger
                        className="w-14 sm:w-16 md:w-20 h-6 sm:h-8 text-[9px] sm:text-xs"
                        style={{
                          borderColor: !verified ? 'hsl(var(--border))' : asidePiramideResults[pi]?.[0] ? '#22c55e' : '#ef4444',
                          borderWidth: verified ? '2px' : '1px',
                          backgroundColor: !verified ? 'transparent' : asidePiramideResults[pi]?.[0] ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        }}
                      >
                        <SelectValue placeholder="Elegir" />
                      </SelectTrigger>
                      <SelectContent>
                        {PIRAMIDE_OPTIONS.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Right side select */}
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2">
                    <Select
                      value={asidePiramideResponses[pi]?.[1] || ''}
                      onValueChange={(value) => handleAsidePiramideChange(pi, 1, value)}
                      disabled={verified}
                    >
                      <SelectTrigger
                        className="w-14 sm:w-16 md:w-20 h-6 sm:h-8 text-[9px] sm:text-xs"
                        style={{
                          borderColor: !verified ? 'hsl(var(--border))' : asidePiramideResults[pi]?.[1] ? '#22c55e' : '#ef4444',
                          borderWidth: verified ? '2px' : '1px',
                          backgroundColor: !verified ? 'transparent' : asidePiramideResults[pi]?.[1] ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        }}
                      >
                        <SelectValue placeholder="Elegir" />
                      </SelectTrigger>
                      <SelectContent>
                        {PIRAMIDE_OPTIONS.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {verified && (asidePiramideResults[pi]?.some(r => !r)) && (
                  <span className="text-[10px] sm:text-xs text-green-600 mt-1 sm:mt-2">({piramide.izquierda} + {piramide.derecha})</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* FormulasPage ToComplete Section */}
        {formulasPageData.toComplete && formulasPageData.toComplete.length > 0 && (
          <div className="border border-border rounded-lg p-3 sm:p-4 md:p-6 bg-card mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Completa las Fórmulas Extendidas</h3>
            <div className="space-y-3 sm:space-y-4">
              {formulasPageData.toComplete.map((formula, fi) => (
                <div key={fi} className="flex items-center gap-1 sm:gap-2 flex-wrap">
                  <span className="font-semibold min-w-[35px] sm:min-w-[50px] text-xs sm:text-sm">{fi === 0 ? 'Aff' : fi === 1 ? 'Neg' : '?'}:</span>
                  {formula.map((part, pi, arr) => (
                    <Fragment key={pi}>
                      <Select
                        value={formulasPageResponses[fi]?.[pi] || ''}
                        onValueChange={(value) => handleFormulasPageChange(fi, pi, value)}
                        disabled={verified}
                      >
                        <SelectTrigger
                          className="w-20 sm:w-24 md:w-28 h-7 sm:h-9 text-[9px] sm:text-xs"
                          style={{
                            borderColor: !verified ? 'hsl(var(--border))' : formulasPageResults[fi]?.[pi] ? '#22c55e' : '#ef4444',
                            borderWidth: verified ? '2px' : '1px',
                            backgroundColor: !verified ? 'transparent' : formulasPageResults[fi]?.[pi] ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          }}
                        >
                          <SelectValue placeholder="Elegir" />
                        </SelectTrigger>
                        <SelectContent>
                          {formulasPageData.options.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      {pi + 1 < arr.length && <span className="text-foreground text-xs sm:text-sm">+</span>}
                    </Fragment>
                  ))}
                  {verified && formulasPageResults[fi]?.some(r => !r) && (
                    <span className="text-[10px] sm:text-sm text-green-600 ml-1 sm:ml-2">({formula.join(' + ')})</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons - Responsive */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-6 sm:mt-8">
          <Button onClick={handleReset} variant="outline" className="w-full sm:w-auto gap-2">
            <RotateCcw className="h-4 w-4" /> Reintentar
          </Button>
          <Button onClick={handleVerify} className="w-full sm:w-auto gap-2" disabled={verified}>
            <Check className="h-4 w-4" /> Verificar
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

export default Eje7;
