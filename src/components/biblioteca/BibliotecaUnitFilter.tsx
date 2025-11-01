import { BibliotecaUnit } from '@/types';
import { Button } from '@/components/ui/button';

interface BibliotecaUnitFilterProps {
  units: BibliotecaUnit[];
  selectedUnit: string;
  onUnitSelect: (unitId: string) => void;
}

export const BibliotecaUnitFilter = ({ 
  units, 
  selectedUnit, 
  onUnitSelect 
}: BibliotecaUnitFilterProps) => {
  return (
    <div className="mt-12">
      <h3 className="text-2xl font-bold text-heading mb-6">Unidades disponibles</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {units.map((unit) => (
          <Button
            key={unit.id}
            onClick={() => onUnitSelect(unit.id)}
            className={`h-auto py-6 flex flex-col items-center justify-center gap-2 ${
              selectedUnit === unit.id
                ? 'bg-[#2D5016] hover:bg-[#234010]'
                : 'bg-[#4A6741] hover:bg-[#3A5731]'
            } text-white font-semibold`}
          >
            <span className="text-xl text-[#C5D82E]">{unit.name}</span>
            <span className="text-sm opacity-90">Documentos {unit.documentCount}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};
