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
    <div className={`${colors.unitBg} rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3`}>
      <div className="flex-1 min-w-0">
        <h3 className={`font-semibold ${colors.unitText} text-sm sm:text-base truncate`}>
          Unidad {unit.number}: {unit.title}
        </h3>
        <p className={`text-xs sm:text-sm ${colors.unitText} opacity-80 line-clamp-2`}>
          {unit.description}
        </p>
      </div>
      <Button
        size="sm"
        className={`${colors.buttonBg} ${colors.buttonText} font-semibold hover:opacity-90 text-xs sm:text-sm whitespace-nowrap w-full sm:w-auto`}
        onClick={onClick}
        disabled={unit.isLocked}
      >
        {config.label}
      </Button>
    </div>
  );
};
