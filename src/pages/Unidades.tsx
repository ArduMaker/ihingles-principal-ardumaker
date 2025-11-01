import { useEffect, useState } from 'react';
import { InternalLayout } from '@/components/internal/InternalLayout';
import { UnidadesHeader } from '@/components/unidades/UnidadesHeader';
import { LevelCard } from '@/components/unidades/LevelCard';
import { ProgressSection } from '@/components/unidades/ProgressSection';
import { get_units_by_level, get_overall_progress } from '@/data/unidades';
import { useApiState } from '@/hooks/useApiState';
import { LevelProgress, OverallProgress } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

const Unidades = () => {
  const { isLoading, executeApi } = useApiState();
  const [levels, setLevels] = useState<LevelProgress[]>([]);
  const [progress, setProgress] = useState<OverallProgress | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [levelsData, progressData] = await Promise.all([
        executeApi(get_units_by_level),
        executeApi(get_overall_progress)
      ]);
      
      if (levelsData) setLevels(levelsData);
      if (progressData) setProgress(progressData);
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <InternalLayout>
        <div className="p-4 md:p-8 space-y-8">
          <Skeleton className="h-20 w-full" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-[600px]" />
            <Skeleton className="h-[600px]" />
            <Skeleton className="h-[600px]" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </InternalLayout>
    );
  }

  return (
    <InternalLayout>
      <div className="p-4 md:p-8 space-y-8">
        <UnidadesHeader totalUnits={progress?.totalUnits || 69} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {levels.map((level) => (
            <LevelCard key={level.levelId} level={level} />
          ))}
        </div>

        {progress && <ProgressSection progress={progress} />}
      </div>
    </InternalLayout>
  );
};

export default Unidades;
