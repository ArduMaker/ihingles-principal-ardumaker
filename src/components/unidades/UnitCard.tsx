import { Button } from '@/components/ui/button';
import { Unit } from '@/types';

interface UnitCardProps {
  unit: Unit;
  colors: {
    unitBg: string;
    unitText: string;
    buttonBg: string;
    buttonText: string;
  };
  onClick: () => void;
}

const statusConfig = {
  completed: { label: 'Terminado', variant: 'default' as const },
  'in-progress': { label: 'Continuar', variant: 'default' as const },
  locked: { label: 'Comenzar', variant: 'default' as const }
};

export const UnitCard = ({ unit, colors, onClick }: UnitCardProps) => {
  const config = statusConfig[unit.status];
  
  return (
    <div className={`${colors.unitBg} rounded-lg p-4 flex items-center justify-between`}>
      <div className="flex-1">
        <h3 className={`font-semibold ${colors.unitText}`}>
          Unidad {unit.number}: {unit.title}
        </h3>
        <p className={`text-sm ${colors.unitText} opacity-80`}>
          {unit.description}
        </p>
      </div>
      <Button
        className={`${colors.buttonBg} ${colors.buttonText} font-semibold hover:opacity-90`}
        onClick={onClick}
        disabled={unit.status === 'locked'}
      >
        {config.label}
      </Button>
    </div>
  );
};
