import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UnidadSearchBarProps {
  description: string;
  completedUnits: number;
  totalUnits: number;
  onSearch: (query: string) => void;
}

export const UnidadSearchBar = ({ 
  description, 
  completedUnits, 
  totalUnits,
  onSearch 
}: UnidadSearchBarProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/unidades')}
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-xl font-semibold">Unidades para Exploradores</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-semibold">Unidades: {completedUnits}/{totalUnits}</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar unidades"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10"
        />
      </div>
    </div>
  );
};
