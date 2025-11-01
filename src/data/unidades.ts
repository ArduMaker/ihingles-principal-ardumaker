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

// Mock async function to get all units for a specific level
export const get_units_by_level_id = async (levelId: string): Promise<{
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
