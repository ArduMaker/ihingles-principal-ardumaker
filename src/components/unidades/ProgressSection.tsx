import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { OverallProgress, LevelProgress } from '@/types';
import { useNavigate } from 'react-router-dom';

interface ProgressSectionProps {
  progress: OverallProgress;
  levels?: LevelProgress[];
}

export const ProgressSection = ({ progress, levels }: ProgressSectionProps) => {
  const navigate = useNavigate();

  const findUnitToContinue = () => {
    if (!levels || levels.length === 0) return null;

    // 1) Buscar la primera unidad con status 'in-progress'
    for (const level of levels) {
      for (const unit of level.units) {
        if (unit.status === 'in-progress') return unit;
      }
    }

    // 2) Si no hay, buscar la primera unidad que no esté completada
    for (const level of levels) {
      for (const unit of level.units) {
        if (unit.status !== 'completed') return unit;
      }
    }

    // 3) Fallback: primera unidad del primer nivel
    return levels[0].units?.[0] ?? null;
  };

  const handleContinue = () => {
    const unit = findUnitToContinue();
    if (unit) {
      navigate(`/modulo/${unit.id}`);
    }
  };
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

      {/* Mostrar lista de unidades en progreso (si existen) */}
      {levels && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Unidades en curso</h3>
          <div className="space-y-3">
            {levels.flatMap(l => l.units).filter(u => u.status === 'in-progress' || ((u as any).progress > 0 && (u as any).progress < 100)).length === 0 && (
              <p className="text-sm text-muted-foreground">No tienes unidades en progreso. Pulsa "Continuar unidad" para comenzar la siguiente.</p>
            )}
            {levels.flatMap(l => l.units).filter(u => u.status === 'in-progress' || ((u as any).progress > 0 && (u as any).progress < 100)).map((u) => (
              <div key={u.id} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">{u.title}</div>
                  <div className="text-xs text-muted-foreground">Unidad {u.number}</div>
                </div>
                <div className="w-1/2">
                  <div className="flex items-center gap-3">
                    <Progress value={(u as any).progress} className="h-2 w-full" />
                    <div className="text-sm font-semibold">{(u as any).progress}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          className="flex-1 bg-[#2D5016] text-[#DFB400] hover:bg-[#3D6020] font-semibold"
          onClick={handleContinue}
        >
          Continuar unidad
        </Button>
      </div>
    </Card>
  );
};
