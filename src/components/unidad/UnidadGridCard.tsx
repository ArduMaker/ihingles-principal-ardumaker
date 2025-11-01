import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { UnitDetail } from '@/types';
import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UnidadGridCardProps {
  unit: UnitDetail;
}

const statusConfig = {
  completed: { 
    label: 'Terminado', 
    bgColor: 'bg-red-500',
    textColor: 'text-red-500' 
  },
  'in-progress': { 
    label: 'Continuar', 
    bgColor: 'bg-[#4A6741]',
    textColor: 'text-[#4A6741]' 
  },
  locked: { 
    label: 'Comenzar', 
    bgColor: 'bg-[#4A6741]',
    textColor: 'text-muted-foreground' 
  }
};

export const UnidadGridCard = ({ unit }: UnidadGridCardProps) => {
  const navigate = useNavigate();
  const config = statusConfig[unit.status];
  const isLocked = unit.status === 'locked';

  return (
    <div className={`rounded-lg overflow-hidden border ${isLocked ? 'opacity-70' : ''}`}>
      <div className="relative h-40">
        <img 
          src={unit.caseImage}
          alt={unit.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = '/placeholder.svg';
          }}
        />
        {isLocked && (
          <div className="absolute top-3 right-3 bg-red-500 rounded-full p-2">
            <Lock className="h-4 w-4 text-white" />
          </div>
        )}
      </div>

      <div className="p-4 space-y-3 bg-card">
        <div>
          <h3 className="font-semibold text-sm">
            Unidad {unit.number}: {unit.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {unit.description}
          </p>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs">
            <span className={config.textColor}>{unit.progress}%</span>
          </div>
          <Progress value={unit.progress} className="h-2" />
        </div>

        <Button
          className={`w-full ${config.bgColor} text-white hover:opacity-90`}
          onClick={() => navigate(`/modulo/${unit.id}`)}
          disabled={isLocked}
        >
          {config.label}
        </Button>
      </div>
    </div>
  );
};
