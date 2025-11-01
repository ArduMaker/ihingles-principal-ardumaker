import { Exercise } from '@/types/ejercicio';
import { MultipleChoiceExerciseComponent } from './exercises/MultipleChoiceExercise';
import { ListeningExerciseComponent } from './exercises/ListeningExercise';
import { ReadingExerciseComponent } from './exercises/ReadingExercise';
import { DictationExerciseComponent } from './exercises/DictationExercise';
import { SpeakingExerciseComponent } from './exercises/SpeakingExercise';
import { SentenceAnalysisExerciseComponent } from './exercises/SentenceAnalysisExercise';

interface ExerciseRouterProps {
  exercise: Exercise;
}

export const ExerciseRouter = ({ exercise }: ExerciseRouterProps) => {
  switch (exercise.type) {
    case 'multiple-choice':
      return <MultipleChoiceExerciseComponent exercise={exercise} />;
    
    case 'listening':
      return <ListeningExerciseComponent exercise={exercise} />;
    
    case 'reading':
      return <ReadingExerciseComponent exercise={exercise} />;
    
    case 'dictation':
      return <DictationExerciseComponent exercise={exercise} />;
    
    case 'speaking':
      return <SpeakingExerciseComponent exercise={exercise} />;
    
    case 'sentence-analysis':
      return <SentenceAnalysisExerciseComponent exercise={exercise} />;
    
    // Add more exercise types here as they are implemented
    // case 'fill-blank':
    //   return <FillBlankExercise exercise={exercise} />;
    // case 'matching':
    //   return <MatchingExercise exercise={exercise} />;
    
    default:
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Tipo de ejercicio no implementado: {(exercise as Exercise).type}
          </p>
        </div>
      );
  }
};
