import { useState } from 'react';
import { InternalLayout } from '@/components/internal/InternalLayout';
import { VocabularioSearchBar } from '@/components/vocabulario/VocabularioSearchBar';
import { VocabularioCard } from '@/components/vocabulario/VocabularioCard';
import { getVocabulary, VocabularyItem } from '@/lib/api';
import { useApiState } from '@/hooks/useApiState';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

const Vocabulario = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [vocabularyItems, setVocabularyItems] = useState<VocabularyItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const { isLoading, error, executeApi } = useApiState();

  const handleSearch = async () => {
    const result = await executeApi(() => getVocabulary(searchQuery, 1));
    if (result) {
      setVocabularyItems(result.data);
      setTotalCount(result.count);
    }
  };

  return (
    <InternalLayout>
      <div className="p-8 max-w-7xl mx-auto">
        <VocabularioSearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearch={handleSearch}
        />

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {!isLoading && vocabularyItems.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No se encontraron resultados</p>
          </div>
        )}

        {!isLoading && vocabularyItems.length === 0 && !searchQuery && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Usa el buscador para encontrar vocabulario</p>
          </div>
        )}

        {!isLoading && vocabularyItems.length > 0 && (
          <>
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                {totalCount} resultado{totalCount !== 1 ? 's' : ''} encontrado{totalCount !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {vocabularyItems.map((item, index) => (
                <VocabularioCard key={index} item={item} />
              ))}
            </div>
          </>
        )}
      </div>
    </InternalLayout>
  );
};

export default Vocabulario;
