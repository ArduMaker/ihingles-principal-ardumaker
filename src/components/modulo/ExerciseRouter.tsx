import { Exercise } from '@/types/ejercicio';
import { MultipleChoiceExerciseComponent } from './exercises/MultipleChoiceExercise';

interface ExerciseRouterProps {
  exercise: Exercise;
}

export const ExerciseRouter = ({ exercise }: ExerciseRouterProps) => {
  switch (exercise.type) {
    case 'multiple-choice':
      return <MultipleChoiceExerciseComponent exercise={exercise} />;
    
    // Add more exercise types here as they are implemented
    // case 'fill-blank':
    //   return <FillBlankExercise exercise={exercise} />;
    // case 'matching':
    //   return <MatchingExercise exercise={exercise} />;
    
    default:
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Tipo de ejercicio no implementado: {exercise.type}
          </p>
        </div>
      );
  }
};
