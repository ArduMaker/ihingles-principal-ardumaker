import { LevelProgress, OverallProgress } from '@/types';

// Mock async function to get units by level
export const get_units_by_level = async (): Promise<LevelProgress[]> => {
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
export const get_overall_progress = async (): Promise<OverallProgress> => {
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
