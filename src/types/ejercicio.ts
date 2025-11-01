// Exercise types and interfaces

export type ExerciseType = 'multiple-choice' | 'listening' | 'fill-blank' | 'matching' | 'reading' | 'true-false' | 'dictation' | 'speaking' | 'sentence-analysis';

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

export interface ListeningQuestion {
  id: string;
  questionNumber: number;
  text: string;
  options: string[];
  correctOptionIndex: number;
}

export interface ListeningExercise extends BaseExercise {
  type: 'listening';
  audioUrl: string;
  audioImage: string;
  audioDuration: string;
  attachedFile?: {
    name: string;
    url: string;
  };
  adviceText: string;
  pronunciationTitle: string;
  questions: ListeningQuestion[];
}

export interface TrueFalseQuestion {
  id: string;
  questionNumber: number;
  text: string;
  correctAnswer: boolean;
}

export interface ReadingExercise extends BaseExercise {
  type: 'reading';
  contentImage: string;
  questions: TrueFalseQuestion[];
}

export interface DictationQuestion {
  id: string;
  questionNumber: number;
  correctAnswer: string;
}

export interface DictationExercise extends BaseExercise {
  type: 'dictation';
  audioUrl: string;
  audioImage: string;
  audioDuration: string;
  adviceText?: string;
  questions: DictationQuestion[];
}

export interface SpeakingPhrase {
  id: string;
  phraseNumber: number;
  text: string;
  audioUrl?: string;
}

export interface SpeakingExercise extends BaseExercise {
  type: 'speaking';
  phrases: SpeakingPhrase[];
}

export interface SentencePart {
  id: string;
  text: string;
  syntacticGroup: string;
  sentenceFunction: string;
}

export interface SentenceAnalysisExercise extends BaseExercise {
  type: 'sentence-analysis';
  sentence: string;
  parts: SentencePart[];
  syntacticOptions: string[];
  functionOptions: string[];
}

export type Exercise = MultipleChoiceExercise | ListeningExercise | ReadingExercise | DictationExercise | SpeakingExercise | SentenceAnalysisExercise;

export interface ExerciseAnswer {
  optionId: string;
  selectedAnswer?: string;
  isCorrect?: boolean;
  feedback?: string;
}
