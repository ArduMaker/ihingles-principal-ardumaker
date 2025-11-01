import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BibliotecaResultsHeaderProps {
  unitName: string;
  documentCount: number;
  onBack: () => void;
  sortBy: string;
  onSortChange: (value: string) => void;
}

export const BibliotecaResultsHeader = ({
  unitName,
  documentCount,
  onBack,
  sortBy,
  onSortChange,
}: BibliotecaResultsHeaderProps) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <span className="text-heading">Buscar documentos</span>
          <h1 className="text-3xl font-bold text-heading">{unitName}</h1>
        </div>
        <Button
          onClick={onBack}
          className="bg-[#2D5016] hover:bg-[#234010] text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Atrás
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-heading">
          Mostrando {documentCount} documentos de {unitName}
        </p>
        <div className="flex items-center gap-3">
          <span className="text-heading">Ordenar por:</span>
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-48 bg-white">
              <SelectValue placeholder="Seleccionar orden" />
            </SelectTrigger>
            <SelectContent className="bg-white z-50">
              <SelectItem value="recent">Más recientes</SelectItem>
              <SelectItem value="oldest">Más antiguos</SelectItem>
              <SelectItem value="name">Nombre</SelectItem>
              <SelectItem value="downloads">Más descargados</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
