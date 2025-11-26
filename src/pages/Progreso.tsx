import { useState, useEffect } from 'react';
import { InternalLayout } from '@/components/internal/InternalLayout';
import { LevelProgressCircle } from '@/components/progreso/LevelProgressCircle';
import { UserProgressCard } from '@/components/progreso/UserProgressCard';
import { ProgresoHero } from '@/components/progreso/ProgresoHero';
import { get_overall_progress } from '@/data/unidades';
import { useAuth } from '@/hooks/useAuth';

const Progreso = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const data = await get_overall_progress();
        setProgress(data);
      } catch (error) {
        console.error('Error loading progress:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, []);

  if (loading) {
    return (
      <InternalLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-pulse text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando progreso...</p>
          </div>
        </div>
      </InternalLayout>
    );
  }

  // Calculate progress per level (22, 22, 20 units)
  const levelUnits = [22, 22, 20];
  const completedByLevel = progress?.levelProgress || [];

  const getLevelPercentage = (levelIndex: number) => {
    const levelData = completedByLevel[levelIndex];
    if (!levelData) return 0;
    return Math.round((levelData.completed / levelData.total) * 100);
  };

  // Calculate overall percentage
  const overallPercentage = progress?.percentage || 0;

  // User XP calculation (you can adjust this formula)
  const totalXP = 80345;
  const currentXP = Math.round((overallPercentage / 100) * totalXP);

  return (
    <InternalLayout>
      <div className="w-full min-h-screen">
        {/* Container with padding */}
        <div className="container mx-auto px-4 py-6">
          {/* Hero section */}
          <ProgresoHero />

          {/* Content section with background */}
          <div 
            className="relative bg-cover bg-center rounded-lg p-8 md:p-12"
            style={{ backgroundImage: 'url(/habilidades/fondo.png)' }}
          >
            {/* Overlay for better readability */}
            <div className="absolute inset-0 bg-black/20 rounded-lg" />
            
            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto">
              <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 justify-center">
                {/* Level circles - left side */}
                <div className="flex flex-wrap justify-center gap-6 md:gap-12">
                  <LevelProgressCircle
                    level="explorador"
                    percentage={getLevelPercentage(0)}
                    icon="/habilidades/explorador.png"
                    label="Explorador"
                    isLocked={false}
                  />
                  <LevelProgressCircle
                    level="cualificado"
                    percentage={getLevelPercentage(1)}
                    icon="/habilidades/cualificado.png"
                    label="Cualificado"
                    isLocked={getLevelPercentage(0) < 100}
                  />
                  <LevelProgressCircle
                    level="maestro"
                    percentage={getLevelPercentage(2)}
                    icon="/habilidades/maestro.png"
                    label="Maestro"
                    isLocked={getLevelPercentage(1) < 100}
                  />
                </div>
                
                {/* User progress card - right side */}
                <div className="w-full lg:w-auto lg:min-w-[400px] lg:max-w-[500px]">
                  <UserProgressCard
                    name={user?.name || 'Alberto González'}
                    level={overallPercentage}
                    title=""
                    xp={`XP: ${currentXP} / ${totalXP}`}
                    percentage={overallPercentage}
                    avatar={user?.avatar}
                    shield={user?.shield}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </InternalLayout>
  );
};

export default Progreso;
