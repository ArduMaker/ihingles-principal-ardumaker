import { DashboardStat, SkillProgress, RecentUnit, PendingExercise } from '@/types';
import { api } from '@/lib/api';
import { get_overall_progress } from '@/data/unidades';

// Mock async function to simulate API call for dashboard stats
export const get_dashboard_stats = async (): Promise<DashboardStat[]> => {
  try {
    // Intentamos calcular Promedio Global a partir de las skills reales
    const skills = await get_skills_progress();

    const skillCount = skills.length || 1;
    const userSum = skills.reduce((acc, s) => acc + (s.userProgress ?? 0), 0);
    const platformSum = skills.reduce((acc, s) => acc + (s.averageProgress ?? 0), 0);

    const userAvg = Math.round(userSum / skillCount);
    const platformAvg = Math.round(platformSum / skillCount);

    // Obtener el progreso por unidades
    const overall = await get_overall_progress();
    const totalUnits = overall?.totalUnits ?? 0;
    const totalCompleted = overall?.totalCompleted ?? 0;
    const percentage = overall?.percentage ?? 0;

    const stats: DashboardStat[] = [
      {
        id: 'promedio',
        label: 'Promedio Global',
        value: `${userAvg}%`,
        change: userAvg - platformAvg >= 0 ? `+${userAvg - platformAvg}%` : `${userAvg - platformAvg}%`,
        subtitle: `Media plataforma: ${platformAvg}%`,
        icon: '/Porcentaje Globnal-01.png'
      },
      {
        id: 'unidades',
        label: 'Unidades Terminados',
        value: `${totalCompleted} / ${totalUnits}`,
        change: `${percentage}%`,
        subtitle: 'Progreso del curso actual',
        icon: '/unidades-01-01.png'
      },
    ];

    return stats;
  } catch (e) {
    // Fallback a valores mock si algo falla
    await new Promise(resolve => setTimeout(resolve, 300));
    return [
      {
        id: 'promedio',
        label: 'Promedio Global',
        value: '85%',
        change: '+5%',
        subtitle: 'Comparado con el mes anterior',
        icon: '/Porcentaje Globnal-01.png'
      },
      {
        id: 'unidades',
        label: 'Unidades Terminados',
        value: '4 / 69',
        change: '33%',
        subtitle: 'Progreso del curso actual',
        icon: '/unidades-01-01.png'
      },
    ];
  }
};

const CACHE = {};

// Mock async function for skills progress
export const get_skills_progress = async (): Promise<SkillProgress[]> => {
  // Intentamos obtener las estadísticas reales del endpoint del backend.
  try {
    const data = await api<any>('/statistics/global/own');

    // El backend devuelve valores en 0..1 por skill. Normalizamos a 0..100.
    let CACHE: { [key: string]: number } = {};
    const getPlatformValue = async (key: string) => {

      // Si la respuesta ya contiene `platform`, la usamos.
      if (data?.platform && data.platform[key] != null) return Math.round(Number(data.platform[key]) * 100);

      // Si no viene la `platform`, pedimos los datos por unidad y calculamos la media por habilidad.
      try {
        const unitsData = await api<any>('/statistics/global/unidades');
        if (Array.isArray(unitsData) && unitsData.length > 0) {
          const values: number[] = [];
          for (const entry of unitsData) {
            if (entry?.platform && entry.platform[key] != null) values.push(Number(entry.platform[key]));
          }
          if (values.length > 0) {
            const avg = values.reduce((a, b) => a + b, 0) / values.length;
            CACHE[key] = Math.round(avg * 100);
            return CACHE[key];
          }
        }
      } catch (e) {
        // ignore and fallback to 0
      }

      return 0;
    };

    const mapSkill = async (key: string, id: string, label?: string) => ({
      id,
      name: label ?? id.charAt(0).toUpperCase() + id.slice(1),
      userProgress: data?.[key] != null ? Math.round(Number(data[key]) * 100) : 0,
      averageProgress: await getPlatformValue(key),
    });

    // Keys esperadas según backend: Grammar, Listening, Pronunciation, Reading, Speaking, Writing, Vocabulary, total
    const skillPromises: Promise<SkillProgress>[] = [
      mapSkill('Grammar', 'grammar', 'Grammar'),
      mapSkill('Listening', 'listening', 'Listening'),
      mapSkill('Pronunciation', 'pronunciation', 'Pronunciation'),
      mapSkill('Reading', 'reading', 'Reading'),
      mapSkill('Speaking', 'speaking', 'Speaking'),
      mapSkill('Writing', 'writing', 'Writing'),
      mapSkill('Vocabulary', 'vocabulary', 'Vocabulary'),
    ];

    const skills = await Promise.all(skillPromises);
    return skills;
  } catch (e) {
    // Fallback al mock local si falla la petición
    await new Promise(resolve => setTimeout(resolve, 300));
    return [
      { id: 'grammar', name: 'Grammar', userProgress: 10, averageProgress: 40 },
      { id: 'listening', name: 'Listening', userProgress: 50, averageProgress: 30 },
      { id: 'pronunciation', name: 'Pronunciation', userProgress: 60, averageProgress: 45 },
      { id: 'reading', name: 'Reading', userProgress: 20, averageProgress: 65 },
      { id: 'speaking', name: 'Speaking', userProgress: 80, averageProgress: 55 },
      { id: 'writing', name: 'Writing', userProgress: 70, averageProgress: 50 }
    ];
  }
};

// Mock async function for recent units
export const get_recent_units = async (): Promise<RecentUnit[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return [
    { id: '1', name: 'Unidad 1: Nombre de la unidad', progress: 80 },
    { id: '2', name: 'Unidad 2: Nombre de la unidad', progress: 60 },
    { id: '3', name: 'Unidad 3: Nombre de la unidad', progress: 75 }
  ];
};

// Mock async function for pending exercises
export const get_pending_exercises = async (): Promise<PendingExercise[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return [
    { id: '1', title: 'Past Perfect Tense', type: 'grammar', timeAgo: 'Hace 2 días' },
    { id: '2', title: 'Past Perfect Tense', type: 'listening', timeAgo: 'Hace 3 días' },
    { id: '3', title: 'Past Perfect Tense', type: 'reading', timeAgo: 'Hace 8 días' }
  ];
};
