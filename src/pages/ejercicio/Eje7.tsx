import { useState, useEffect, Fragment } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Exercise } from '@/data/unidades';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { postUserGrade, postUserPosition } from '@/lib/api';
import { toast } from 'sonner';
import { Calculate_index_exercise } from '@/hooks/calculate_index';
import DashboardLoader from '@/components/dashboard/DashboardLoader';
import { ArrowRight, RotateCcw, Check } from 'lucide-react';

// Colors from old code
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
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [verified, setVerified] = useState(false);
  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [grade, setGrade] = useState(0);
  const [loading, setLoading] = useState(true);

  // Aside state
  const [asideGrades, setAsideGrades] = useState<number[]>([]);
  const [asideFormulaResponses, setAsideFormulaResponses] = useState<string[][]>([]);
  const [asideFormulaResults, setAsideFormulaResults] = useState<boolean[][]>([]);
  const [asidePiramideResponses, setAsidePiramideResponses] = useState<[string, string][]>([]);
  const [asidePiramideResults, setAsidePiramideResults] = useState<[boolean, boolean][]>([]);

  // FormulasPage state
  const [formulasPageGrades, setFormulasPageGrades] = useState<number[]>([]);
  const [formulasPageResponses, setFormulasPageResponses] = useState<string[][]>([]);
  const [formulasPageResults, setFormulasPageResults] = useState<boolean[][]>([]);

  // Get exercise data
  const exercise = initialExercise as Type7Exercise;
  const aside = exercise.aside || { formulas: DEFAULT_ASIDE_FORMULAS, piramides: DEFAULT_ASIDE_PIRAMIDES };
  const formulas = aside.formulas || DEFAULT_ASIDE_FORMULAS;
  const piramides = aside.piramides || DEFAULT_ASIDE_PIRAMIDES;

  // Get formulas page data
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

  // Initialize states
  useEffect(() => {
    if (!isType7Exercise(initialExercise)) {
      setLoading(false);
      return;
    }

    // Initialize aside formula responses
    const initialFormulaResponses = formulas.map(formula => formula.map(() => ''));
    setAsideFormulaResponses(initialFormulaResponses);
    setAsideFormulaResults(formulas.map(formula => formula.map(() => false)));

    // Initialize aside piramide responses
    const initialPiramideResponses: [string, string][] = piramides.map(() => ['', '']);
    setAsidePiramideResponses(initialPiramideResponses);
    setAsidePiramideResults(piramides.map(() => [false, false]));

    // Initialize aside grades
    setAsideGrades(Array(formulas.length + piramides.length).fill(0));

    // Initialize formulas page responses
    const fpToComplete = formulasPageData.toComplete || [];
    setFormulasPageResponses(fpToComplete.map(formula => formula.map(() => '')));
    setFormulasPageResults(fpToComplete.map(formula => formula.map(() => false)));
    setFormulasPageGrades(Array(fpToComplete.length).fill(0));

    setLoading(false);
  }, [initialExercise]);

  if (!isType7Exercise(initialExercise)) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Estructura de ejercicio tipo 7 no válida</p>
      </div>
    );
  }

  // Aside formula change handler
  const handleAsideFormulaChange = (formulaIndex: number, partIndex: number, value: string) => {
    setAsideFormulaResponses(old => {
      const data = old.map(arr => [...arr]);
      data[formulaIndex][partIndex] = value;
      return data;
    });
  };

  // Aside piramide change handler
  const handleAsidePiramideChange = (piramideIndex: number, side: 0 | 1, value: string) => {
    setAsidePiramideResponses(old => {
      const data = old.map(arr => [...arr] as [string, string]);
      data[piramideIndex][side] = value;
      return data;
    });
  };

  // FormulasPage change handler
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
    setAsideGrades(Array(formulas.length + piramides.length).fill(0));

    const fpToComplete = formulasPageData.toComplete || [];
    setFormulasPageResponses(fpToComplete.map(formula => formula.map(() => '')));
    setFormulasPageResults(fpToComplete.map(formula => formula.map(() => false)));
    setFormulasPageGrades(Array(fpToComplete.length).fill(0));

    setVerified(false);
  };

  const handleVerify = () => {
    // Verify aside formulas
    const newAsideFormulaResults = formulas.map((formula, fi) =>
      formula.map((part, pi) => asideFormulaResponses[fi]?.[pi] === part)
    );
    setAsideFormulaResults(newAsideFormulaResults);

    // Verify aside piramides
    const newAsidePiramideResults: [boolean, boolean][] = piramides.map((piramide, pi) => [
      asidePiramideResponses[pi]?.[0] === piramide.izquierda,
      asidePiramideResponses[pi]?.[1] === piramide.derecha,
    ]);
    setAsidePiramideResults(newAsidePiramideResults);

    // Verify formulas page
    const fpToComplete = formulasPageData.toComplete || [];
    const newFormulasPageResults = fpToComplete.map((formula, fi) =>
      formula.map((part, pi) => formulasPageResponses[fi]?.[pi] === part)
    );
    setFormulasPageResults(newFormulasPageResults);

    // Calculate aside grades
    const formulaGrades = newAsideFormulaResults.map(results => 
      results.filter(r => r).length / results.length
    );
    const piramideGrades = newAsidePiramideResults.map(results => 
      results.filter(r => r).length / results.length
    );

    const topGrade = formulaGrades.reduce((a, b) => a + b, 0) / formulaGrades.length;
    const bottomGrade = piramideGrades.reduce((a, b) => a + b, 0) / piramideGrades.length;
    const asideGrade = topGrade * 0.8 + bottomGrade * 0.2;

    // Calculate formulas page grades
    const fpGrades = newFormulasPageResults.map(results => 
      results.filter(r => r).length / results.length
    );
    const fpGrade = fpGrades.length > 0 
      ? fpGrades.reduce((a, b) => a + b, 0) / fpGrades.length 
      : 0;

    // Combined grade (50% aside, 50% formulas page if exists)
    let finalGrade: number;
    if (fpToComplete.length > 0) {
      finalGrade = Math.round(((asideGrade + fpGrade) / 2) * 100);
    } else {
      finalGrade = Math.round(asideGrade * 100);
    }

    setGrade(finalGrade);
    setVerified(true);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <DashboardLoader />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      {/* Hero Image */}
      <div className="w-full rounded-xl overflow-hidden mb-6">
        <img 
          src="/ejercicio/grammar.png" 
          alt="Exercise" 
          className="w-full h-32 md:h-48 object-cover"
        />
      </div>

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">{exercise.title}</h1>
        {exercise.description && (
          <p className="text-muted-foreground whitespace-pre-wrap">{exercise.description}</p>
        )}
      </div>

      {/* VerboTotal Section */}
      {formulasPageData.verboTotal && (
        <div className="border border-border rounded-lg p-4 md:p-6 bg-card">
          <h3 className="text-lg font-semibold mb-4 text-center">Verbo Total</h3>
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-4 flex-wrap justify-center">
              <div className="text-center">
                <span className="font-bold" style={{ color: TIPO7_BLUE }}>
                  {formulasPageData.verboTotal.left}
                </span>
                <p className="text-xs font-bold" style={{ color: TIPO7_BLUE }}>Auxiliar</p>
              </div>
              <span className="text-xl">+</span>
              <div className="text-center">
                {Array.isArray(formulasPageData.verboTotal.right) ? (
                  <div className="flex items-center gap-2">
                    {formulasPageData.verboTotal.right.map((text, i, arr) => (
                      <Fragment key={i}>
                        <span className="font-bold" style={{ color: TIPO7_RED }}>{text}</span>
                        {i + 1 < arr.length && <span>+</span>}
                      </Fragment>
                    ))}
                  </div>
                ) : (
                  <span className="font-bold" style={{ color: TIPO7_RED }}>
                    {formulasPageData.verboTotal.right}
                  </span>
                )}
                <p className="text-xs font-bold" style={{ color: TIPO7_RED }}>Verbo Restante (Vr)</p>
              </div>
            </div>
            <hr className="w-full border-border my-2" />
            <span className="font-bold text-lg" style={{ color: '#0076ba' }}>Verbo Total (Vt)</span>
          </div>
        </div>
      )}

      {/* Top Section (if exists) */}
      {exercise.top && (
        <div className="border border-border rounded-lg p-4 md:p-6 bg-card">
          <div className="flex flex-col gap-2">
            {exercise.top.map((text, i) => (
              <p
                key={i}
                className="font-bold text-lg"
                style={{ color: i === 0 || i === 2 ? TIPO7_BLUE : TIPO7_RED }}
              >
                {text}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Showed Formulas */}
      {formulasPageData.showed && formulasPageData.showed.length > 0 && (
        <div className="border border-border rounded-lg p-4 md:p-6 bg-card">
          <h3 className="text-lg font-semibold mb-4">Fórmulas de Referencia</h3>
          <div className="space-y-3">
            {formulasPageData.showed.map((formula, i) => (
              <div key={i} className="flex items-center gap-2 flex-wrap" style={{ color: i === 0 ? TIPO7_BLUE : i === 1 ? TIPO7_RED : TIPO7_GREEN }}>
                <span className="text-foreground font-semibold min-w-[40px]">
                  {i === 0 ? 'Aff' : i === 1 ? 'Neg' : '?'}:
                </span>
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
      <div className="border border-border rounded-lg p-4 md:p-6 bg-card">
        <h3 className="text-lg font-semibold mb-4">Completa las Fórmulas</h3>
        <div className="space-y-4">
          {formulas.map((formula, fi) => (
            <div 
              key={fi} 
              className="flex items-center gap-2 flex-wrap"
              style={{ color: getFormulaColor(fi) }}
            >
              <span className="font-semibold min-w-[50px]">{getFormulaTitle(fi)}:</span>
              {formula.map((part, pi, arr) => (
                <Fragment key={pi}>
                  <Select
                    value={asideFormulaResponses[fi]?.[pi] || ''}
                    onValueChange={(value) => handleAsideFormulaChange(fi, pi, value)}
                    disabled={verified}
                  >
                    <SelectTrigger 
                      className="w-24 h-9"
                      style={{
                        color: getFormulaColor(fi),
                        borderColor: !verified ? 'hsl(var(--border))' :
                          asideFormulaResults[fi]?.[pi] ? '#22c55e' : '#ef4444',
                        borderWidth: verified ? '2px' : '1px',
                        backgroundColor: !verified ? 'transparent' :
                          asideFormulaResults[fi]?.[pi] ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      }}
                    >
                      <SelectValue placeholder="Elegir" />
                    </SelectTrigger>
                    <SelectContent>
                      {FORMULA_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {pi + 1 < arr.length && <span className="text-foreground">+</span>}
                </Fragment>
              ))}
              {/* Show correct answer when verified and wrong */}
              {verified && asideFormulaResults[fi]?.some(r => !r) && (
                <span className="text-sm text-green-600 ml-2">
                  ({formula.join(' + ')})
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Aside Piramides Section */}
      <div className="border border-border rounded-lg p-4 md:p-6 bg-card">
        <h3 className="text-lg font-semibold mb-4">Completa las Pirámides</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {piramides.map((piramide, pi) => (
            <div key={pi} className="flex flex-col items-center">
              <div 
                className="px-6 py-2 rounded-full border-2 mb-4"
                style={{ 
                  borderColor: getPiramideColor(pi),
                  backgroundColor: 'hsl(var(--card))'
                }}
              >
                <span 
                  className="font-bold text-lg"
                  style={{ color: getPiramideColor(pi) }}
                >
                  {getPiramideTitle(pi)}
                </span>
              </div>
              <div className="flex items-end gap-4">
                {/* Left select */}
                <div className="flex flex-col items-center">
                  <div className="w-px h-6 bg-border mb-1" />
                  <Select
                    value={asidePiramideResponses[pi]?.[0] || ''}
                    onValueChange={(value) => handleAsidePiramideChange(pi, 0, value)}
                    disabled={verified}
                  >
                    <SelectTrigger 
                      className="w-24 h-9"
                      style={{
                        color: getPiramideColor(pi),
                        borderColor: !verified ? 'hsl(var(--border))' :
                          asidePiramideResults[pi]?.[0] ? '#22c55e' : '#ef4444',
                        borderWidth: verified ? '2px' : '1px',
                        backgroundColor: !verified ? 'transparent' :
                          asidePiramideResults[pi]?.[0] ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      }}
                    >
                      <SelectValue placeholder="Elegir" />
                    </SelectTrigger>
                    <SelectContent>
                      {PIRAMIDE_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {verified && !asidePiramideResults[pi]?.[0] && (
                    <span className="text-xs text-green-600 mt-1">{piramide.izquierda}</span>
                  )}
                </div>
                {/* Right select */}
                <div className="flex flex-col items-center">
                  <div className="w-px h-6 bg-border mb-1" />
                  <Select
                    value={asidePiramideResponses[pi]?.[1] || ''}
                    onValueChange={(value) => handleAsidePiramideChange(pi, 1, value)}
                    disabled={verified}
                  >
                    <SelectTrigger 
                      className="w-24 h-9"
                      style={{
                        color: getPiramideColor(pi),
                        borderColor: !verified ? 'hsl(var(--border))' :
                          asidePiramideResults[pi]?.[1] ? '#22c55e' : '#ef4444',
                        borderWidth: verified ? '2px' : '1px',
                        backgroundColor: !verified ? 'transparent' :
                          asidePiramideResults[pi]?.[1] ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      }}
                    >
                      <SelectValue placeholder="Elegir" />
                    </SelectTrigger>
                    <SelectContent>
                      {PIRAMIDE_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {verified && !asidePiramideResults[pi]?.[1] && (
                    <span className="text-xs text-green-600 mt-1">{piramide.derecha}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FormulasPage ToComplete Section */}
      {formulasPageData.toComplete && formulasPageData.toComplete.length > 0 && (
        <div className="border border-border rounded-lg p-4 md:p-6 bg-card">
          <h3 className="text-lg font-semibold mb-4">Completa las Fórmulas (Página)</h3>
          <div className="space-y-4">
            {formulasPageData.toComplete.map((formula, fi) => (
              <div 
                key={fi} 
                className="flex items-center gap-2 flex-wrap"
                style={{ color: fi === 0 ? TIPO7_BLUE : fi === 1 ? TIPO7_RED : TIPO7_GREEN }}
              >
                <span className="text-foreground font-semibold min-w-[40px]">
                  {fi === 0 ? 'Aff' : fi === 1 ? 'Neg' : '?'}:
                </span>
                {formula.map((part, pi, arr) => (
                  <Fragment key={pi}>
                    <Select
                      value={formulasPageResponses[fi]?.[pi] || ''}
                      onValueChange={(value) => handleFormulasPageChange(fi, pi, value)}
                      disabled={verified}
                    >
                      <SelectTrigger 
                        className="w-36 h-9"
                        style={{
                          color: fi === 0 ? TIPO7_BLUE : fi === 1 ? TIPO7_RED : TIPO7_GREEN,
                          borderColor: !verified ? 'hsl(var(--border))' :
                            formulasPageResults[fi]?.[pi] ? '#22c55e' : '#ef4444',
                          borderWidth: verified ? '2px' : '1px',
                          backgroundColor: !verified ? 'transparent' :
                            formulasPageResults[fi]?.[pi] ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        }}
                      >
                        <SelectValue placeholder="Elegir" />
                      </SelectTrigger>
                      <SelectContent>
                        {formulasPageData.options.map((option) => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {pi + 1 < arr.length && <span className="text-foreground">+</span>}
                  </Fragment>
                ))}
                {/* Show correct answer when verified and wrong */}
                {verified && formulasPageResults[fi]?.some(r => !r) && (
                  <span className="text-sm text-green-600 ml-2">
                    ({formula.join(' + ')})
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

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

export default Eje7;
