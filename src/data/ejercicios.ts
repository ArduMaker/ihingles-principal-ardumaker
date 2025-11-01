import { Exercise, MultipleChoiceExercise } from '@/types/ejercicio';

// Mock exercise data
const mockExercises: Record<string, Exercise> = {
  '1': {
    id: '1',
    type: 'multiple-choice',
    title: 'Conocimientos Elementales',
    heroImage: '/ejercicio/principal1.png',
    totalExercises: 12,
    currentExercise: 2,
    category: 'Gramar',
    categoryProgress: '2/6',
    instructions: 'Selecciona qué tipo de palabra (morfología) es cada una de las palabras que ponemos a continuación',
    options: [
      {
        id: 'a',
        label: 'a)',
        text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        isCorrect: true
      },
      {
        id: 'b',
        label: 'b)',
        text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        isCorrect: false
      },
      {
        id: 'c',
        label: 'c)',
        text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        isCorrect: true
      },
      {
        id: 'd',
        label: 'd)',
        text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        isCorrect: true
      },
      {
        id: 'e',
        label: 'e)',
        text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        isCorrect: false
      },
      {
        id: 'f',
        label: 'f)',
        text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        isCorrect: true
      },
      {
        id: 'g',
        label: 'g)',
        text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        isCorrect: false
      },
      {
        id: 'h',
        label: 'h)',
        text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        isCorrect: true
      },
      {
        id: 'i',
        label: 'i)',
        text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        isCorrect: true
      }
    ]
  } as MultipleChoiceExercise
};

export const get_exercise = async (id: string): Promise<Exercise | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockExercises[id] || null;
};
