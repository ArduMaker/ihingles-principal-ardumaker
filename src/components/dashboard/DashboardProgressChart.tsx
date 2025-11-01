import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Legend } from 'recharts';
import { SkillProgress } from '@/types';

interface DashboardProgressChartProps {
  data: SkillProgress[];
}

export const DashboardProgressChart = ({ data }: DashboardProgressChartProps) => {
  const chartData = data.map(skill => ({
    name: skill.name,
    'Tu progreso': skill.userProgress,
    'La Media': skill.averageProgress
  }));

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-heading">Progreso Personal</h2>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#8FB896]"></div>
            <span className="text-foreground">Tu progreso</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#2C5F2D]"></div>
            <span className="text-foreground">La Media</span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} barGap={0}>
          <XAxis 
            dataKey="name" 
            tick={{ fill: '#4A4A4A', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
          <Bar dataKey="Tu progreso" fill="#B4D4BA" radius={[4, 4, 0, 0]} />
          <Bar dataKey="La Media" fill="#2C5F2D" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};
