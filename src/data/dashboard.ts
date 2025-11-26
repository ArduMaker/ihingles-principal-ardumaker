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
    return [];
  }
};

// Mock async function for skills progress
export const get_skills_progress = async (): Promise<SkillProgress[]> => {
  // Intentamos obtener las estadísticas reales del endpoint del backend.
  try {
    const data = await api<any>('/statistics/global/own');

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
            return Math.round(avg * 100);
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
    return [];
  }
};

// Mock async function for recent units
export const get_recent_units = async (): Promise<RecentUnit[]> => {
  return [];
};

// Mock async function for pending exercises
export const get_pending_exercises = async (): Promise<PendingExercise[]> => {
  return [];
};
