import { useState, useEffect } from 'react';
import { InternalLayout } from '@/components/internal/InternalLayout';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { DashboardProgressChart } from '@/components/dashboard/DashboardProgressChart';
import { DashboardSkillsProgress } from '@/components/dashboard/DashboardSkillsProgress';
import { DashboardRecentUnits } from '@/components/dashboard/DashboardRecentUnits';
import { DashboardPendingExercises } from '@/components/dashboard/DashboardPendingExercises';
import { useApiState } from '@/hooks/useApiState';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  get_dashboard_stats, 
  get_skills_progress, 
  get_recent_units, 
  get_pending_exercises 
} from '@/data/dashboard';
import { DashboardStat, SkillProgress, RecentUnit, PendingExercise } from '@/types';

const Dashboard = () => {
  const { isLoading, executeApi } = useApiState();
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [skills, setSkills] = useState<SkillProgress[]>([]);
  const [recentUnits, setRecentUnits] = useState<RecentUnit[]>([]);
  const [pendingExercises, setPendingExercises] = useState<PendingExercise[]>([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      const [statsData, skillsData, unitsData, exercisesData] = await Promise.all([
        executeApi(get_dashboard_stats),
        executeApi(get_skills_progress),
        executeApi(get_recent_units),
        executeApi(get_pending_exercises)
      ]);
      
      if (statsData) setStats(statsData);
      if (skillsData) setSkills(skillsData);
      if (unitsData) setRecentUnits(unitsData);
      if (exercisesData) setPendingExercises(exercisesData);
    };

    loadDashboardData();
  }, []);

  return (
    <InternalLayout>
      <div className="p-4 md:p-6 lg:p-8 space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold text-heading">Dashboard de Aprendizaje</h1>
        
        {isLoading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
            </div>
          </div>
        ) : (
          <>
            <DashboardStats stats={stats} />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <DashboardProgressChart data={skills} />
              </div>
              <div>
                <DashboardSkillsProgress data={skills} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DashboardRecentUnits units={recentUnits} />
              <DashboardPendingExercises exercises={pendingExercises} />
            </div>
          </>
        )}
      </div>
    </InternalLayout>
  );
};

export default Dashboard;
