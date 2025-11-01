import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PendingExercise } from '@/types';

interface DashboardPendingExercisesProps {
  exercises: PendingExercise[];
}

const iconMap = {
  grammar: '/lapiz.svg',
  listening: '/auriculares.svg',
  reading: '/libro.svg'
};

const actionMap = {
  grammar: 'Continuar',
  listening: 'Iniciar',
  reading: 'Continuar'
};

export const DashboardPendingExercises = ({ exercises }: DashboardPendingExercisesProps) => {
  return (
    <Card className="p-6 bg-card border-border">
      <h2 className="text-xl font-bold text-heading mb-6">Ejercicios Pendientes</h2>
      <div className="space-y-3">
        {exercises.map((exercise) => (
          <div 
            key={exercise.id} 
            className="flex items-center gap-4 p-4 bg-[#C5DCC8] rounded-lg"
          >
            <div className="w-10 h-10 bg-[#A8C9AD] rounded-full flex items-center justify-center shrink-0">
              <img src={iconMap[exercise.type]} alt="" className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#2C2C2C]">{exercise.title}</p>
              <p className="text-xs text-[#6B6B6B]">
                {exercise.type.charAt(0).toUpperCase() + exercise.type.slice(1)} • {exercise.timeAgo}
              </p>
            </div>
            <Button 
              size="sm"
              className="bg-[#2C5F2D] hover:bg-[#1F4520] text-[#DFB400] font-semibold shrink-0"
            >
              {actionMap[exercise.type]}
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
};
