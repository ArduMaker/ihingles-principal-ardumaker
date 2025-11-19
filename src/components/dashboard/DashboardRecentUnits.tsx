import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RecentUnit } from '@/types';
import { useNavigate } from 'react-router-dom';

interface DashboardRecentUnitsProps {
  units: RecentUnit[];
}

export const DashboardRecentUnits = ({ units }: DashboardRecentUnitsProps) => {
  const navigate = useNavigate();

  const handleContinue = (unit: RecentUnit) => {
    // Navigate to module page for the unit. The unit.id is expected to match the format used by the app (e.g. 'u-1' or numeric id)
    navigate(`/modulo/${unit.id}`);
  };
  return (
    <Card className="p-6 bg-card border-border">
      <h2 className="text-xl font-bold text-heading mb-6">Unidades Recientes</h2>
      <div className="space-y-3">
        {units.slice(0, 3).map((unit) => (
          <div 
            key={unit.id} 
            className="flex items-center gap-4 p-4 bg-[#C5DCC8] rounded-lg"
          >
            <div className="w-1 h-12 bg-[#028C3C] rounded-full"></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#2C2C2C] mb-2">{unit.name}</p>
              <div className="flex items-center gap-2">
                <Progress value={unit.progress} className="h-1.5 bg-[#E8F3E8]" />
                <span className="text-xs text-[#4A4A4A] whitespace-nowrap">
                  {unit.progress}% Completado
                </span>
              </div>
            </div>
            <Button 
              size="sm"
              className="bg-[#2C5F2D] hover:bg-[#1F4520] text-[#DFB400] font-semibold shrink-0"
              onClick={() => handleContinue(unit)}
            >
              Continuar
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
};
