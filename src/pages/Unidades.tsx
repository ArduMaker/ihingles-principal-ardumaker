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
        <div className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 lg:space-y-8">
          <Skeleton className="h-16 md:h-20 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 lg:gap-6">
            <Skeleton className="h-[500px] md:h-[550px] lg:h-[600px]" />
            <Skeleton className="h-[500px] md:h-[550px] lg:h-[600px]" />
            <Skeleton className="h-[500px] md:h-[550px] lg:h-[600px] hidden md:block" />
          </div>
          <Skeleton className="h-48 md:h-56 lg:h-64 w-full" />
        </div>
      </InternalLayout>
    );
  }

  return (
    <InternalLayout>
      <div className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 lg:space-y-8">
        <UnidadesHeader totalUnits={progress?.totalUnits || 69} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 lg:gap-6">
          {levels.map((level) => (
            <LevelCard key={level.levelId} level={level} />
          ))}
        </div>

        {progress && <ProgressSection progress={progress} levels={levels} />}
      </div>
    </InternalLayout>
  );
};

export default Unidades;
