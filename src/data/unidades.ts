import { LevelProgress, OverallProgress } from '@/types';

// ---------- Implementación real (intenta obtener datos del backend, falla al mock) ----------
import { api } from '@/lib/api';

const decodePayload = (payload: any) => {
  if (!payload) return null;
  if (typeof payload === 'string') {
    try {
      return JSON.parse(atob(payload));
    } catch (e) {
      try {
        return JSON.parse(payload);
      } catch (e) {
        return payload;
      }
    }
  }
  if (typeof payload === 'object') return payload;
  return payload;
};

// Lista canonical de títulos tomada del front antiguo (primeras 64 entradas)
const unitTitles: string[] = [
  "CONOCIMIENTOS ELEMENTALES",
  "VERBO BE",
  "TIEMPOS VERBALES INGLESES",
  "PRESENT SIMPLE",
  "PRESENT CONTINUOUS",
  "PAST SIMPLE",
  "PAST CONTINUOUS",
  "PREPOSICIONES",
  "TIME LINE",
  "PRONOMBRES",
  "PRESENT PERFECT SIMPLE",
  "PRESENT PERFECT CONTINUOUS",
  "FOR / SINCE / AGO",
  "PAST PERFECT SIMPLE",
  "PAST PERFECT CONTINUOUS",
  "ADJETIVOS",
  "LOS TRES FUTUROS",
  "FUTURE SIMPLE",
  "BE GOING TO (PRESENT)",
  "BE GOING TO (PAST)",
  "PRESENT CONTINUOUS (F.V.)",
  "PRESENT SIMPLE (F.V.)",
  "EJERCICIOS TRES FUTUROS",
  "SUSTANTIVOS",
  "DETERMINANTES",
  "IDENTIFICACIÓN TIEMPOS MÉTODO 1",
  "FUTURE CONTINUOUS",
  "FUTURE PERFECT SIMPLE",
  "MUCH / MANY - FEW / LITTLE",
  "COMPARACIÓN TIEMPOS VERBALES",
  "FUTURE PERFECT CONTINUOUS",
  "PAST TIME CLAUSES",
  "SO / SUCH - TOO / ENOUGH",
  "FUTURE TIME CLAUSES",
  "IDENTIFICACIÓN TIEMPOS MÉTODO 2",
  "TIPOS DE PREGUNTAS",
  "QUESTION TAGS",
  "THERE IS / ARE",
  "PREGUNTAS DE SUJETO",
  "PREGUNTAS DE OBJETO",
  "PREGUNTAS DE PREPOSICIÓN",
  "PREGUNTAS INDIRECTAS",
  "ORACIONES IMPERSONALES",
  "QUIERO QUE VENGAS...",
  "CUÁNTO TIEMPO LLEVA...?",
  "HAVE SOMETHING DONE",
  "MAY / MIGHT",
  "CAN / COULD",
  "SHOULD / OUGHT TO",
  "HAVE / HAVE GOT",
  "MUST / HAVE (GOT) TO",
  "WOULD / COULD",
  "IDENTIFICACIÓN TIEMPOS MÉTODO 3",
  "IMPERATIVOS",
  "USED TO + INFINITIVO",
  "BE USED TO + V(ING)",
  "BE GETTING USED TO + V(ING)",
  "ADVERBIOS",
  "VERBOS",
  "VERBO + VERBO",
  "TO + V(INF) / V(ING) / FOR V(ING)",
  "CONDICIONALES",
  "PREFER",
  "I WISH",
];

// Split en 3 niveles: 22, 22, 20 (64 unidades)
const TOTAL_UNITS = 64;
const per = [22, 22, TOTAL_UNITS - 44];
const levels = [
  { id: 'explorador', name: 'Explorador' },
  { id: 'cualificado', name: 'Cualificado' },
  { id: 'maestro', name: 'Maestro' },
];

// Intenta mapear la respuesta de /exercises/por-unidad a la estructura del mock
const fetchExercisesPorUnidad = async () => {
  const res = await api<any>('/exercises/por-unidad', { method: 'GET' });
  // Normalizar payload
  const payload = res && typeof res === 'object' && 'data' in res ? decodePayload(res.data) : res;
  // payload esperado: { unidades: { <unitNumber>: { count, startIndex, ... } }, boughtUpTo, position }
  return payload;
};

// ======================================================================
// Helpers públicos que replican la lógica del front viejo para calcular
// porcentaje y estado de una unidad. Se colocan aquí para poder usarse
// dentro de `get_units_by_level_real`.
// ======================================================================

/**
 * Calcula el porcentaje completado de una unidad siguiendo la regla del front viejo:
 * - Si `unidadesStatus[unit] === true` => 100
 * - Si `position === 0` => 0
 * - Si position > 0 => Math.round((position / count) * 100)
 */
export const computeUnitProgress = (
  unitNumber: number | string,
  unidadesData: any,
  posicionPorUnidad: any,
  unidadesStatus: any
): number => {
  try {
    const key = String(unitNumber);

    // prioridad: estado completado explícito
    if (unidadesStatus) {
      if (unidadesStatus[key] === true || unidadesStatus[Number(key)] === true) return 100;
    }

    const position = (posicionPorUnidad && (posicionPorUnidad[key] ?? posicionPorUnidad[Number(key)] ?? 0)) ?? 0;

    // obtener tamaño (count) de la unidad
    const unitInfo = unidadesData && (unidadesData[key] ?? unidadesData[Number(key)] ?? null);
    const size = unitInfo && (unitInfo.count ?? unitInfo.size ?? null);

    if (!position || position === 0) return 0;

    if (!size || typeof size !== 'number' || size <= 0) return 0;

    return Math.round((position / size) * 100);
  } catch (e) {
    return 0;
  }
};

/**
 * Devuelve un resumen del estado de la unidad: { percent, status }
 * status: 'completed' | 'in-progress' | 'locked'
 */
export const getUnitState = (
  unitNumber: number | string,
  unidadesData: any,
  posicionPorUnidad: any,
  unidadesStatus: any
) => {
  const percent = computeUnitProgress(unitNumber, unidadesData, posicionPorUnidad, unidadesStatus);
  const key = String(unitNumber);
  let status: 'completed' | 'in-progress' | 'locked' = 'locked';

  if (unidadesStatus && (unidadesStatus[key] === true || unidadesStatus[Number(key)] === true)) {
    status = 'completed';
  } else if (percent >= 100) {
    status = 'completed';
  } else if (percent > 0) {
    status = 'in-progress';
  } else {
    status = 'locked';
  }

  return { percent, status };
};

const getNamelevelUnidad = (unitNumber: number) => {
  // toma el numero de una unidad y devuelve si esta en maestro, cualificado o explorador
  const idx = unitNumber - 1;
  if (idx < 22) return 'explorador';
  if (idx < 44) return 'cualificado';
  return 'maestro';
};

const getIndex = (unitNumber: number) => {
  // toma el numero de una unidad y devuelve su indice (0-based)
  const idx = unitNumber;
  if (idx < 22) return idx - 0;
  if (idx < 44) return idx - 22;
  return idx - 44;
}

const totalCapitulos = (nameLevel: string) => {
  if (nameLevel === 'explorador') return 22;
  if (nameLevel === 'cualificado') return 22 + 22;
  return 20 + 44;
};


export const get_units_by_level_real = async (): Promise<LevelProgress[]> => {
  try {
    const payload = await fetchExercisesPorUnidad();

    if (!payload) throw new Error('No payload from backend');

    // Queremos exactamente 64 unidades con los títulos del front antiguo.
    const posicionPorUnidad = payload.position ?? {};
    console.log('boughtUpTo:', payload);

    const flatUnits = Array.from({ length: TOTAL_UNITS }, (index, idx) => {
      const unitNumber = idx + 1;
      // try to read backend-provided per-unit info, fallback to defaults
      const unitInfo = payload.unidades && payload.unidades[unitNumber] ? payload.unidades[unitNumber] : null;
      const count = unitInfo?.count ?? 20;
      const startIndex = unitInfo?.startIndex ?? null;

      // obtener estado/progreso usando los helpers comunes
      const unidadesStatusFromPayload = payload.unidadesStatus ?? payload.unidades_status ?? null;
      const { percent: progress, status } = getUnitState(unitNumber, payload.unidades, posicionPorUnidad, unidadesStatusFromPayload);

      return {
        id: `u-${unitNumber}`,
        number: unitNumber,
        title: unitTitles[idx] ?? `Unidad ${unitNumber}`,
        description: unitInfo?.description ?? '',
        count,
        startIndex,
        status,
        progress,
        caseImage: `/${getNamelevelUnidad(unitNumber)}/case${getIndex(unitNumber)}.png`,
      };
    });

    const result: LevelProgress[] = levels.map((lvl, idx) => {
      const start = idx === 0 ? 0 : idx === 1 ? per[0] : per[0] + per[1];
      const slice = flatUnits.slice(start, start + per[idx]);
      return {
        levelId: lvl.id,
        levelName: lvl.name,
        levelImage: `/${lvl.id}/principal.png`,
        levelDescription: `${lvl.name} level generated from backend data.`,
        isLocked: lvl.id === 'maestro',
        totalUnits: totalCapitulos(lvl.id),
        completedUnits: slice.filter(u => u.status === 'completed').length,
        units: slice,
      };
    });

    return result;
  } catch (e) {
    console.warn('Falling back to mock get_units_by_level due to error:', e);
    return null as unknown as LevelProgress[]; // for type compatibility
  }
};

export const get_overall_progress_real = async (): Promise<OverallProgress> => {
  try {
    const payload = await fetchExercisesPorUnidad();
    if (!payload || !payload.unidades) throw new Error('No unidades in payload');

    // compute totals
    const unidadesData = payload.unidades;
    let totalUnits = 0;
    let totalCompleted = 0;
    const levelProgress = [];

    const unitKeys = Object.keys(unidadesData).sort((a, b) => Number(a) - Number(b));
    const flatCounts = unitKeys.reduce((acc, key) => acc + (unidadesData[key].count ?? 0), 0);
    totalUnits = flatCounts;

    const boughtUpTo = payload.boughtUpTo ?? 0;
    totalCompleted = boughtUpTo;

    // split into three level buckets for levelProgress
    const per = Math.ceil(totalUnits / 3);
    for (let i = 0; i < 3; i++) {
      const levelCompleted = Math.max(0, Math.min(boughtUpTo - i * per, per));
      levelProgress.push({ levelName: i === 0 ? 'Explorador' : i === 1 ? 'Cualificado' : 'Maestro', completed: levelCompleted, total: per });
    }

    const percentage = totalUnits === 0 ? 0 : Math.round((totalCompleted / totalUnits) * 100);
    return {
      totalCompleted,
      totalUnits,
      percentage,
      levelProgress,
    };
  } catch (e) {
    console.warn('Falling back to mock get_overall_progress due to error:', e);
    return null as unknown as OverallProgress; // for type compatibility
  }
};

export const get_units_by_level_id_real = async (levelId: string) => {
  try {
    const levels = await get_units_by_level_real();
    const found = levels.find(l => l.levelId === levelId);
    if (!found) throw new Error('Level not found');
    return found;
  } catch (e) {
    console.warn('Falling back to mock get_units_by_level_id due to error:', e);
    return null as unknown as LevelProgress; // for type compatibility
  }
};

// Redirigir las exportadas originales para que intenten la versión real primero
export const get_units_by_level = get_units_by_level_real;
export const get_overall_progress = get_overall_progress_real;
export const get_units_by_level_id = get_units_by_level_id_real;
