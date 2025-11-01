import { InternalLayout } from '@/components/internal/InternalLayout';
import { PerfilHero } from '@/components/perfil/PerfilHero';
import { PerfilUserCard } from '@/components/perfil/PerfilUserCard';
import { PerfilPersonalInfo } from '@/components/perfil/PerfilPersonalInfo';
import { PerfilLearningProgress } from '@/components/perfil/PerfilLearningProgress';
import { PerfilStats } from '@/components/perfil/PerfilStats';
import { useApiState } from '@/hooks/useApiState';
import { get_user_profile } from '@/data/profile';
import { UserProfile } from '@/types/auth';
import { useEffect, useState } from 'react';

const Perfil = () => {
  const { isLoading, executeApi } = useApiState();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const data = await executeApi(() => get_user_profile('1'));
      if (data) {
        setProfile(data);
      }
    };
    loadProfile();
  }, []);

  if (isLoading || !profile) {
    return (
      <InternalLayout>
        <div className="p-8 flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Cargando perfil...</p>
        </div>
      </InternalLayout>
    );
  }

  return (
    <InternalLayout>
      <div className="p-4 md:p-8">
        <PerfilHero />
        <PerfilUserCard user={profile} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PerfilPersonalInfo user={profile} />
          <div>
            <PerfilLearningProgress skills={profile.skills} />
            <PerfilStats 
              unitsCompleted={profile.unitsCompleted}
              totalUnits={profile.totalUnits}
              consecutiveDays={profile.consecutiveDays}
            />
          </div>
        </div>
      </div>
    </InternalLayout>
  );
};

export default Perfil;
