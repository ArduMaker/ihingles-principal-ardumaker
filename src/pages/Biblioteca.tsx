import { useState, useEffect } from 'react';
import { InternalLayout } from '@/components/internal/InternalLayout';
import { BibliotecaHero } from '@/components/biblioteca/BibliotecaHero';
import { BibliotecaSearchBar } from '@/components/biblioteca/BibliotecaSearchBar';
import { BibliotecaSidebar } from '@/components/biblioteca/BibliotecaSidebar';
import { BibliotecaDocumentCard } from '@/components/biblioteca/BibliotecaDocumentCard';
import { BibliotecaUnitFilter } from '@/components/biblioteca/BibliotecaUnitFilter';
import { Skeleton } from '@/components/ui/skeleton';
import { useApiState } from '@/hooks/useApiState';
import { get_biblioteca_documents, get_biblioteca_units, toggle_document_favorite } from '@/data/biblioteca';
import { BibliotecaDocument, BibliotecaUnit } from '@/types';

const Biblioteca = () => {
  const { isLoading, executeApi } = useApiState();
  const [documents, setDocuments] = useState<BibliotecaDocument[]>([]);
  const [units, setUnits] = useState<BibliotecaUnit[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<BibliotecaDocument[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('all');
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['all']);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [docsResult, unitsResult] = await Promise.all([
      executeApi(get_biblioteca_documents),
      executeApi(get_biblioteca_units),
    ]);

    if (docsResult) {
      setDocuments(docsResult);
      setFilteredDocuments(docsResult);
    }
    if (unitsResult) setUnits(unitsResult);
  };

  const handleSearch = () => {
    applyFilters();
  };

  const handleTypeToggle = (type: string) => {
    if (type === 'all') {
      setSelectedTypes(['all']);
    } else {
      const newTypes = selectedTypes.includes(type)
        ? selectedTypes.filter(t => t !== type && t !== 'all')
        : [...selectedTypes.filter(t => t !== 'all'), type];
      
      setSelectedTypes(newTypes.length === 0 ? ['all'] : newTypes);
    }
  };

  const applyFilters = () => {
    let filtered = documents;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by unit
    if (selectedUnit !== 'all') {
      filtered = filtered.filter(doc => doc.unitId === selectedUnit);
    }

    // Filter by document type
    if (!selectedTypes.includes('all')) {
      filtered = filtered.filter(doc => selectedTypes.includes(doc.type));
    }

    setFilteredDocuments(filtered);
  };

  const handleClearFilters = () => {
    setSelectedUnit('all');
    setSelectedTypes(['all']);
    setSearchQuery('');
    setFilteredDocuments(documents);
  };

  const handleToggleFavorite = async (documentId: string) => {
    await executeApi(() => toggle_document_favorite(documentId));
    // Update local state
    setDocuments(docs =>
      docs.map(doc =>
        doc.id === documentId ? { ...doc, isFavorite: !doc.isFavorite } : doc
      )
    );
    setFilteredDocuments(docs =>
      docs.map(doc =>
        doc.id === documentId ? { ...doc, isFavorite: !doc.isFavorite } : doc
      )
    );
  };

  return (
    <InternalLayout>
      <div className="p-8">
        <BibliotecaHero />
        
        <BibliotecaSearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearch={handleSearch}
        />

        <div className="flex gap-6">
          <BibliotecaSidebar
            units={units}
            selectedUnit={selectedUnit}
            selectedTypes={selectedTypes}
            onUnitChange={setSelectedUnit}
            onTypeToggle={handleTypeToggle}
            onApplyFilters={applyFilters}
            onClearFilters={handleClearFilters}
          />

          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-heading">Documentos Recientes</h3>
              <a href="#" className="text-[#009A47] hover:text-[#007A37] font-semibold">
                Ver todos
              </a>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <Skeleton key={i} className="h-48" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredDocuments.map(doc => (
                  <BibliotecaDocumentCard
                    key={doc.id}
                    document={doc}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            )}

            <BibliotecaUnitFilter
              units={units}
              selectedUnit={selectedUnit}
              onUnitSelect={(unitId) => {
                setSelectedUnit(unitId);
                applyFilters();
              }}
            />
          </div>
        </div>
      </div>
    </InternalLayout>
  );
};

export default Biblioteca;
