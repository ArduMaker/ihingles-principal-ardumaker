import { LevelProgress, OverallProgress } from '@/types';

// Mock async function to get units by level
const get_units_by_level_mock = async (): Promise<LevelProgress[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return [
    {
      levelId: 'explorador',
      levelName: 'Explorador',
      levelImage: '/basico.png',
      levelDescription: 'Nivel básico para principiantes. Aprende vocabulario esencial y gramática fundamental.',
      isLocked: false,
      totalUnits: 23,
      completedUnits: 8,
      units: [
        { id: '1', number: 1, title: 'Saludos y Presentaciones', description: 'Aprende a presentarte y saludar en inglés', status: 'completed' },
        { id: '2', number: 2, title: 'Saludos y Presentaciones', description: 'Aprende a presentarte y saludar en inglés', status: 'completed' },
        { id: '3', number: 3, title: 'Saludos y Presentaciones', description: 'Aprende a presentarte y saludar en inglés', status: 'completed' },
        { id: '4', number: 4, title: 'Saludos y Presentaciones', description: 'Aprende a presentarte y saludar en inglés', status: 'completed' }
      ]
    },
    {
      levelId: 'cualificado',
      levelName: 'Cualificado',
      levelImage: '/calificado.png',
      levelDescription: 'Nivel básico para principiantes. Aprende vocabulario esencial y gramática fundamental.',
      isLocked: false,
      totalUnits: 46,
      completedUnits: 0,
      units: [
        { id: '24', number: 1, title: 'Saludos y Presentaciones', description: 'Aprende a presentarte y saludar en inglés', status: 'in-progress' },
        { id: '25', number: 2, title: 'Saludos y Presentaciones', description: 'Aprende a presentarte y saludar en inglés', status: 'in-progress' },
        { id: '26', number: 3, title: 'Saludos y Presentaciones', description: 'Aprende a presentarte y saludar en inglés', status: 'in-progress' },
        { id: '27', number: 4, title: 'Saludos y Presentaciones', description: 'Aprende a presentarte y saludar en inglés', status: 'in-progress' }
      ]
    },
    {
      levelId: 'maestro',
      levelName: 'Maestro',
      levelImage: '/experto.png',
      levelDescription: 'Nivel básico para principiantes. Aprende vocabulario esencial y gramática fundamental.',
      isLocked: true,
      totalUnits: 69,
      completedUnits: 0,
      units: [
        { id: '47', number: 1, title: 'Saludos y Presentaciones', description: 'Aprende a presentarte y saludar en inglés', status: 'locked' },
        { id: '48', number: 2, title: 'Saludos y Presentaciones', description: 'Aprende a presentarte y saludar en inglés', status: 'locked' },
        { id: '49', number: 3, title: 'Saludos y Presentaciones', description: 'Aprende a presentarte y saludar en inglés', status: 'locked' },
        { id: '50', number: 4, title: 'Saludos y Presentaciones', description: 'Aprende a presentarte y saludar en inglés', status: 'locked' }
      ]
    }
  ];
};

// Mock async function to get overall progress
const get_overall_progress_mock = async (): Promise<OverallProgress> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    totalCompleted: 8,
    totalUnits: 69,
    percentage: 33,
    levelProgress: [
      { levelName: 'Explorador', completed: 8, total: 23 },
      { levelName: 'Cualificado', completed: 0, total: 23 },
      { levelName: 'Maestro', completed: 0, total: 23 }
    ]
  };
};

// Mock async function to get all units for a specific level
const get_units_by_level_id_mock = async (levelId: string): Promise<{
  levelName: string;
  levelImage: string;
  description: string;
  totalUnits: number;
  completedUnits: number;
  units: import('@/types').UnitDetail[];
}> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Define image sets for each level
  const imagesByLevel: Record<string, string[]> = {
    explorador: [
      '/basico/case1.png',
      '/basico/case2.png',
      '/basico/case3.png',
      '/basico/case4.png',
      '/basico/case5.png',
      '/basico/case6.png',
      '/basico/case7.png',
      '/basico/case8.png',
      '/basico/case9.png',
      '/basico/case11.png',
      '/basico/case12.png',
      '/basico/case13.png',
      '/basico/principal.png'
    ],
    cualificado: [
      '/calificado/case1.png',
      '/calificado/case2.png',
      '/calificado/case3.png',
      '/calificado/case4.png',
      '/calificado/case5.png',
      '/calificado/case6.png',
      '/calificado/case7.png',
      '/calificado/case8.png',
      '/calificado/case9.png',
      '/calificado/case10.png',
      '/calificado/case11.png',
      '/calificado/case12.png',
      '/calificado/case13.png',
      '/calificado/case14.png',
      '/calificado/case15.png',
      '/calificado/case16.png',
      '/calificado/principal.png'
    ],
    maestro: [
      '/experto/case1.png',
      '/experto/case2.png',
      '/experto/case3.png',
      '/experto/case4.png',
      '/experto/case5.png',
      '/experto/case6.png',
      '/experto/case7.png',
      '/experto/case8.png',
      '/experto/case9.png',
      '/experto/case10.png',
      '/experto/principal.png'
    ]
  };

  const caseImages = imagesByLevel[levelId] || imagesByLevel.explorador;

  // Generate 23 units with random images
  const units = Array.from({ length: 23 }, (_, i) => {
    const unitNumber = i + 1;
    let status: 'completed' | 'in-progress' | 'locked' = 'locked';
    let progress = 0;
    
    if (levelId === 'explorador') {
      if (unitNumber <= 8) {
        status = 'completed';
        progress = 100;
      } else if (unitNumber === 9) {
        status = 'in-progress';
        progress = 45;
      }
    }
    
    return {
      id: `${levelId}-${unitNumber}`,
      number: unitNumber,
      title: 'Saludos y Presentaciones',
      description: 'Aprende a presentarte y saludar en inglés',
      status,
      progress,
      caseImage: caseImages[i % caseImages.length]
    };
  });

  const levelConfig: Record<string, any> = {
    explorador: {
      levelName: 'Explorador',
      levelImage: '/basico/principal.png',
      description: 'Explora las 23 unidades para dominar el inglés Básico.',
      totalUnits: 23,
      completedUnits: 8
    },
    cualificado: {
      levelName: 'Cualificado',
      levelImage: '/calificado/principal.png',
      description: 'Mejora tus habilidades con las 23 unidades del nivel Cualificado.',
      totalUnits: 23,
      completedUnits: 0
    },
    maestro: {
      levelName: 'Maestro',
      levelImage: '/experto/principal.png',
      description: 'Domina el inglés avanzado con las 23 unidades del nivel Maestro.',
      totalUnits: 23,
      completedUnits: 0
    }
  };

  return {
    ...levelConfig[levelId],
    units
  };
};

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

// Intenta mapear la respuesta de /exercises/por-unidad a la estructura del mock
const fetchExercisesPorUnidad = async () => {
  const res = await api<any>('/exercises/por-unidad', { method: 'GET' });
  // Normalizar payload
  const payload = res && typeof res === 'object' && 'data' in res ? decodePayload(res.data) : res;
  // payload esperado: { unidades: { <unitNumber>: { count, startIndex, ... } }, boughtUpTo, position }
  return payload;
};

export const get_units_by_level_real = async (): Promise<LevelProgress[]> => {
  try {
    const payload = await fetchExercisesPorUnidad();

    if (!payload) throw new Error('No payload from backend');

    // Queremos exactamente 64 unidades con los títulos del front antiguo.
    const TOTAL_UNITS = 64;
    const boughtUpTo = payload.boughtUpTo ?? 0;
    const posicionPorUnidad = payload.position ?? {};

    const flatUnits = Array.from({ length: TOTAL_UNITS }, (_, idx) => {
      const unitNumber = idx + 1;
      // try to read backend-provided per-unit info, fallback to defaults
      const unitInfo = payload.unidades && payload.unidades[unitNumber] ? payload.unidades[unitNumber] : null;
      const count = unitInfo?.count ?? 20;
      const startIndex = unitInfo?.startIndex ?? null;

      // compute status and progress
      let status: 'completed' | 'in-progress' | 'locked' = 'locked';
      let progress = 0;
      if (unitNumber <= boughtUpTo) {
        status = 'completed';
        progress = 100;
      } else {
        const unitPos = posicionPorUnidad[unitNumber] ?? 0;
        if (unitPos > 0) {
          status = 'in-progress';
          progress = Math.round((unitPos / Math.max(1, count)) * 100);
        }
      }

      return {
        id: `u-${unitNumber}`,
        number: unitNumber,
        title: unitTitles[idx] ?? `Unidad ${unitNumber}`,
        description: unitInfo?.description ?? '',
        count,
        startIndex,
        status,
        progress,
        caseImage: unitInfo?.caseImage ?? '',
      };
    });

    // Split en 3 niveles: 22, 22, 20 (64 unidades)
    const per = [22, 22, TOTAL_UNITS - 44];
    const levels = [
      { id: 'explorador', name: 'Explorador' },
      { id: 'cualificado', name: 'Cualificado' },
      { id: 'maestro', name: 'Maestro' },
    ];

    const result: LevelProgress[] = levels.map((lvl, idx) => {
      const start = idx === 0 ? 0 : idx === 1 ? per[0] : per[0] + per[1];
      const slice = flatUnits.slice(start, start + per[idx]);
      return {
        levelId: lvl.id,
        levelName: lvl.name,
        levelImage: `/${lvl.id}.png`,
        levelDescription: `${lvl.name} level generated from backend data.`,
        isLocked: lvl.id === 'maestro',
        totalUnits: slice.length,
        completedUnits: slice.filter(u => u.status === 'completed').length,
        units: slice,
      };
    });

    return result;
  } catch (e) {
    console.warn('Falling back to mock get_units_by_level due to error:', e);
    return get_units_by_level_mock();
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
    return get_overall_progress_mock();
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
    return get_units_by_level_id_mock(levelId);
  }
};

// Redirigir las exportadas originales para que intenten la versión real primero
export const get_units_by_level = get_units_by_level_real;
export const get_overall_progress = get_overall_progress_real;
export const get_units_by_level_id = get_units_by_level_id_real;
