import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { OverallProgress } from '@/types';

interface ProgressSectionProps {
  progress: OverallProgress;
}

export const ProgressSection = ({ progress }: ProgressSectionProps) => {
  return (
    <Card className="p-6 border-none shadow-lg bg-card">
      <h2 className="text-2xl font-bold text-heading mb-6">Tu progreso actual</h2>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground">Progreso general</span>
          <span className="text-sm font-semibold">{progress.percentage}% Completado</span>
        </div>
        <Progress value={progress.percentage} className="h-3" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {progress.levelProgress.map((level) => (
          <div key={level.levelName} className="text-center">
            <div className="text-4xl font-bold text-heading mb-2">
              {level.completed}/{level.total}
            </div>
            <p className="text-sm text-muted-foreground">
              Unidades completadas en {level.levelName}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          className="flex-1 bg-[#2D5016] text-[#DFB400] hover:bg-[#3D6020] font-semibold"
        >
          Continuar unidad
        </Button>
        <Button 
          variant="outline"
          className="flex-1 border-2 border-border hover:bg-muted"
        >
          Ver insignias
        </Button>
      </div>
    </Card>
  );
};
