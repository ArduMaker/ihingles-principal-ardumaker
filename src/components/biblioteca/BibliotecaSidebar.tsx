import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { BibliotecaUnit } from '@/types';

interface BibliotecaSidebarProps {
  units: BibliotecaUnit[];
  selectedUnit: string;
  selectedTypes: string[];
  onUnitChange: (unitId: string) => void;
  onTypeToggle: (type: string) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

export const BibliotecaSidebar = ({
  units,
  selectedUnit,
  selectedTypes,
  onUnitChange,
  onTypeToggle,
  onApplyFilters,
  onClearFilters,
}: BibliotecaSidebarProps) => {
  const documentTypes = [
    { id: 'all', label: 'Todos' },
    { id: 'pdf', label: 'PDF' },
    { id: 'word', label: 'DOC/DOCX' },
    { id: 'image', label: 'Imágenes' },
  ];

  const selectedUnitName = units.find(u => u.id === selectedUnit)?.name || 'Todos las Unidades';

  return (
    <div className="w-64 bg-[#E8F5E9] rounded-lg p-6 space-y-6">
      <h3 className="text-xl font-bold text-heading">Filtros de Búsquedas</h3>
      
      {/* Unit Selector */}
      <div>
        <Button
          variant="outline"
          className="w-full justify-between bg-white border-2 border-[#C8E6C9] text-heading hover:bg-[#F1F8F2]"
          onClick={() => onUnitChange('all')}
        >
          {selectedUnitName}
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Document Type Filters */}
      <div>
        <h4 className="font-semibold text-heading mb-4">Tipo de Documento</h4>
        <div className="space-y-3">
          {documentTypes.map((type) => (
            <div key={type.id} className="flex items-center space-x-3">
              <Checkbox
                id={type.id}
                checked={selectedTypes.includes(type.id)}
                onCheckedChange={() => onTypeToggle(type.id)}
              />
              <label
                htmlFor={type.id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {type.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-4">
        <Button
          onClick={onApplyFilters}
          className="w-full bg-[#2D5016] hover:bg-[#234010] text-white font-semibold"
        >
          Aplicar Filtros
        </Button>
        <Button
          onClick={onClearFilters}
          variant="outline"
          className="w-full border-2 border-[#2D5016] text-[#2D5016] hover:bg-[#2D5016] hover:text-white font-semibold"
        >
          Aplicar Filtros
        </Button>
      </div>
    </div>
  );
};
