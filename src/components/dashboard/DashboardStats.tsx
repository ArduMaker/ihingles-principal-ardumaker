import { Card } from '@/components/ui/card';
import { DashboardStat } from '@/types';

interface DashboardStatsProps {
  stats: DashboardStat[];
}

export const DashboardStats = ({ stats }: DashboardStatsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
      {stats.map((stat) => (
        <Card 
          key={stat.id} 
          className="bg-[#E8F3E8] border-[#E8F3E8] p-4 relative overflow-hidden hover:shadow-md transition-shadow"
        >
          <div className="flex flex-col gap-2">
            <p className="text-sm text-[#4A4A4A] font-medium">{stat.label}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold text-[#2C2C2C]">{stat.value}</h3>
              <span className="text-sm font-semibold text-[#028C3C]">{stat.change}</span>
            </div>
            <p className="text-xs text-[#6B6B6B]">{stat.subtitle}</p>
          </div>
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <img src={stat.icon} alt="" className="w-16 h-16 object-contain opacity-90" />
          </div>
        </Card>
      ))}
    </div>
  );
};
