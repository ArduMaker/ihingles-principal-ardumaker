import { UnitDetail } from '@/types';
import { UnidadGridCard } from './UnidadGridCard';

interface UnidadGridProps {
  units: UnitDetail[];
}

export const UnidadGrid = ({ units }: UnidadGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {units.map((unit) => (
        <UnidadGridCard key={unit.id} unit={unit} />
      ))}
    </div>
  );
};
