import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { InternalLayout } from '@/components/internal/InternalLayout';
import { UnidadHero } from '@/components/unidad/UnidadHero';
import { UnidadSearchBar } from '@/components/unidad/UnidadSearchBar';
import { UnidadGrid } from '@/components/unidad/UnidadGrid';
import { get_units_by_level_id } from '@/data/unidades';
import { LevelProgress, UnitDetail } from '@/types';
import { useApiState } from '@/hooks/useApiState';
import { Skeleton } from '@/components/ui/skeleton';
import EjercicioView from "@/pages/ejercicio/EjercicioView";

const Unidad = () => {
  const { levelId } = useParams<{ levelId: string }>();
  const { isLoading, executeApi } = useApiState();
  const [levelData, setLevelData] = useState<LevelProgress | null>(null);
  const [filteredUnits, setFilteredUnits] = useState<UnitDetail[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!levelId) return;
      
      const data = await executeApi(() => get_units_by_level_id(levelId));
      if (data) {
        setLevelData(data);
        setFilteredUnits(data.units);
      }
    };

    fetchData();
  }, [levelId]);

  const handleSearch = (query: string) => {
    if (!levelData) return;
    
    const filtered = levelData.units.filter(unit =>
      unit.title.toLowerCase().includes(query.toLowerCase()) ||
      unit.description.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredUnits(filtered);
  };

  if (isLoading || !levelData) {
    return (
      <InternalLayout>
        <div className="p-4 md:p-8 space-y-6">
          <Skeleton className="h-48 md:h-64 w-full rounded-lg" />
          <Skeleton className="h-24 w-full" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {[...Array(12)].map((_, i) => (
              <Skeleton key={i} className="h-80" />
            ))}
          </div>
        </div>
      </InternalLayout>
    );
  }

  return (
    <InternalLayout>
      <div className="p-4 md:p-8 space-y-6">
        <UnidadHero 
          levelName={levelData.levelName} 
          levelImage={levelData.levelImage} 
        />
        
        <UnidadSearchBar
          description={levelData.levelDescription}
          completedUnits={levelData.completedUnits}
          totalUnits={levelData.totalUnits}
          onSearch={handleSearch}
        />

        <UnidadGrid units={filteredUnits} />
      </div>
    </InternalLayout>
  );
};

export default Unidad;
