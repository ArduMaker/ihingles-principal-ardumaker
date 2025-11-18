import { useState, useEffect } from 'react';
import { InternalLayout } from '@/components/internal/InternalLayout';
import { BibliotecaHero } from '@/components/biblioteca/BibliotecaHero';
import { BibliotecaSearchBar } from '@/components/biblioteca/BibliotecaSearchBar';
import { BibliotecaSidebar } from '@/components/biblioteca/BibliotecaSidebar';
import { BibliotecaDocumentCard } from '@/components/biblioteca/BibliotecaDocumentCard';
import { BibliotecaUnitFilter } from '@/components/biblioteca/BibliotecaUnitFilter';
import { BibliotecaResultsHeader } from '@/components/biblioteca/BibliotecaResultsHeader';
import { BibliotecaResultCard } from '@/components/biblioteca/BibliotecaResultCard';
import { BibliotecaPagination } from '@/components/biblioteca/BibliotecaPagination';
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
  const [showResults, setShowResults] = useState(false);
  const [sortBy, setSortBy] = useState('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 5;

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
    setShowResults(true);
    setCurrentPage(1);
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

    // Apply sorting
    filtered = sortDocuments(filtered, sortBy);

    setFilteredDocuments(filtered);
    setShowResults(true);
    setCurrentPage(1);
  };

  const sortDocuments = (docs: BibliotecaDocument[], sortType: string) => {
    const sorted = [...docs];
    switch (sortType) {
      case 'recent':
        return sorted.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      case 'oldest':
        return sorted.sort((a, b) => a.updatedAt.localeCompare(b.updatedAt));
      case 'name':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return sorted;
    }
  };

  const handleClearFilters = () => {
    setSelectedUnit('all');
    setSelectedTypes(['all']);
    setSearchQuery('');
    setFilteredDocuments(documents);
    setShowResults(false);
    setCurrentPage(1);
  };

  const handleBackToSearch = () => {
    setShowResults(false);
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    const sorted = sortDocuments(filteredDocuments, value);
    setFilteredDocuments(sorted);
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

  // Pagination
  const totalPages = Math.ceil(filteredDocuments.length / resultsPerPage);
  const startIndex = (currentPage - 1) * resultsPerPage;
  const paginatedDocuments = filteredDocuments.slice(startIndex, startIndex + resultsPerPage);

  const selectedUnitName = units.find(u => u.id === selectedUnit)?.name || 'Todos las Unidades';

  return (
    <InternalLayout>
      <div className="p-8">
        {!showResults ? (
          <>
            <BibliotecaHero />
            
            <BibliotecaSearchBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSearch={handleSearch}
            />

            <div className="flex gap-6">

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
                    {documents.slice(0, 4).map(doc => (
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
          </>
        ) : (
          <>
            <BibliotecaResultsHeader
              unitName={selectedUnitName}
              documentCount={filteredDocuments.length}
              onBack={handleBackToSearch}
              sortBy={sortBy}
              onSortChange={handleSortChange}
            />

            {isLoading ? (
              <div className="space-y-6">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-64" />
                ))}
              </div>
            ) : (
              <>
                <div className="space-y-6">
                  {paginatedDocuments.map(doc => (
                    <BibliotecaResultCard
                      key={doc.id}
                      document={doc}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <BibliotecaPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                )}
              </>
            )}
          </>
        )}
      </div>
    </InternalLayout>
  );
};

export default Biblioteca;
