import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LevelProgress } from '@/types';
import { UnitCard } from './UnitCard';
import { useNavigate } from 'react-router-dom';

interface LevelCardProps {
  level: LevelProgress;
}

const levelColors = {
  explorador: {
    bg: 'bg-[#FFE5E5]',
    unitBg: 'bg-[#2D1B1B]',
    unitText: 'text-white',
    buttonBg: 'bg-[#FF4D4D]',
    buttonText: 'text-[#1B1B00]',
    buttonBorder: 'border-[#FF4D4D]'
  },
  cualificado: {
    bg: 'bg-[#E8F5E9]',
    unitBg: 'bg-[#C8E6C9]',
    unitText: 'text-[#1B5E20]',
    buttonBg: 'bg-[#8B6914]',
    buttonText: 'text-[#1B1B00]',
    buttonBorder: 'border-[#8B6914]'
  },
  maestro: {
    bg: 'bg-[#E8F5E9]',
    unitBg: 'bg-[#7CB342]',
    unitText: 'text-white',
    buttonBg: 'bg-[#8B6914]',
    buttonText: 'text-[#1B1B00]',
    buttonBorder: 'border-[#8B6914]'
  }
};

export const LevelCard = ({ level }: LevelCardProps) => {
  const navigate = useNavigate();
  const colors = levelColors[level.levelId as keyof typeof levelColors];
  console.log('Rendering LevelCard for level:', level);
  return (
    <Card className={`${colors.bg} border-none shadow-lg p-6 space-y-4`}>
      <div className="relative rounded-lg overflow-hidden">
        <img 
          src={`/${level.levelId}/principal.png`} 
          alt={level.levelName}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.currentTarget.src = '/placeholder.svg';
          }}
        />
        <div className="absolute top-4 right-4">
          <img 
            src={level.isLocked ? '/candado_clouse.svg' : '/candado_open.svg'} 
            alt={level.isLocked ? 'Bloqueado' : 'Desbloqueado'}
            className="w-8 h-8"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">{level.levelDescription}</p>
      </div>

      <div className="space-y-3">
        {level.units.slice(0, 10).map((unit) => (
          <UnitCard 
            key={unit.id} 
            unit={unit}
            colors={colors}
            onClick={() => navigate(`/modulo/${unit.id}`)}
          />
        ))}
      </div>

      <Button 
        variant="outline"
        className={`w-full ${colors.buttonBorder} ${colors.buttonText} hover:bg-opacity-10`}
        onClick={() => navigate(`/unidad/${level.levelId}`)}
      >
        Ver hasta unidad {level.totalUnits}
      </Button>
    </Card>
  );
};
