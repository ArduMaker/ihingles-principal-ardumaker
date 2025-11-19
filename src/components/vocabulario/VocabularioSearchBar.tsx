import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface VocabularioSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearch: () => void;
}

export const VocabularioSearchBar = ({ 
  searchQuery, 
  onSearchChange, 
  onSearch 
}: VocabularioSearchBarProps) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-3xl font-bold text-heading mb-2">Buscar vocabulario</h2>
      <p className="text-muted-foreground mb-6">
        Encuentra palabras y expresiones para expandir tu vocabulario
      </p>
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Buscar palabras o expresiones..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pr-10"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        </div>
        <Button 
          onClick={onSearch}
          className="px-8 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Buscar
        </Button>
      </div>
    </div>
  );
};
