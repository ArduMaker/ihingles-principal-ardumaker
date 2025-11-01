import { DashboardStat, SkillProgress, RecentUnit, PendingExercise } from '@/types';

// Mock async function to simulate API call for dashboard stats
export const get_dashboard_stats = async (): Promise<DashboardStat[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
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
      id: 'xp',
      label: 'Puntos de Experiencia',
      value: '1,250',
      change: '+320 pts',
      subtitle: 'Puntos ganados esta semana',
      icon: '/XP-01.png'
    },
    {
      id: 'unidades',
      label: 'Unidades Terminados',
      value: '4 / 69',
      change: '33%',
      subtitle: 'Progreso del curso actual',
      icon: '/unidades-01-01.png'
    },
    {
      id: 'tiempo',
      label: 'Tiempo de Estudio',
      value: '24h',
      change: '+3h',
      subtitle: 'Este mes',
      icon: '/Tiempo-01.png'
    }
  ];
};

// Mock async function for skills progress
export const get_skills_progress = async (): Promise<SkillProgress[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return [
    { id: 'grammar', name: 'Grammar', userProgress: 10, averageProgress: 40 },
    { id: 'listening', name: 'Listening', userProgress: 50, averageProgress: 30 },
    { id: 'pronunciation', name: 'Pronunciation', userProgress: 60, averageProgress: 45 },
    { id: 'reading', name: 'Reading', userProgress: 20, averageProgress: 65 },
    { id: 'speaking', name: 'Speaking', userProgress: 80, averageProgress: 55 },
    { id: 'writing', name: 'Writing', userProgress: 70, averageProgress: 50 }
  ];
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
