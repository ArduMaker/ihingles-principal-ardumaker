// Exercise types and interfaces

export type ExerciseType = 'multiple-choice' | 'fill-blank' | 'matching' | 'listening' | 'reading';

export interface BaseExercise {
  id: string;
  type: ExerciseType;
  title: string;
  heroImage: string;
  totalExercises: number;
  currentExercise: number;
  category: string;
  categoryProgress: string;
  instructions: string;
}

export interface MultipleChoiceOption {
  id: string;
  label: string;
  text: string;
  isCorrect: boolean;
}

export interface MultipleChoiceExercise extends BaseExercise {
  type: 'multiple-choice';
  options: MultipleChoiceOption[];
}

export type Exercise = MultipleChoiceExercise;

export interface ExerciseAnswer {
  optionId: string;
  selectedAnswer?: string;
  isCorrect?: boolean;
  feedback?: string;
}
