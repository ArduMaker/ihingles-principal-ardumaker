import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface BibliotecaSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearch: () => void;
}

export const BibliotecaSearchBar = ({ 
  searchQuery, 
  onSearchChange, 
  onSearch 
}: BibliotecaSearchBarProps) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-3xl font-bold text-heading mb-2">Buscar documentos</h2>
      <p className="text-muted-foreground mb-6">
        Encuentra documentos, PDFs e imágenes en nuestra biblioteca digital
      </p>
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Buscar documentos, Pdfs o Imágenes ..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pr-10"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        </div>
        <Button 
          onClick={onSearch}
          className="px-8 bg-[#2D5016] hover:bg-[#234010] text-white"
        >
          Buscar
        </Button>
      </div>
    </div>
  );
};
