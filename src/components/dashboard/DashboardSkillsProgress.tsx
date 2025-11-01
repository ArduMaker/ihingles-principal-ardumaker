import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { SkillProgress } from '@/types';

interface DashboardSkillsProgressProps {
  data: SkillProgress[];
}

export const DashboardSkillsProgress = ({ data }: DashboardSkillsProgressProps) => {
  return (
    <Card className="p-6 bg-card border-border">
      <h2 className="text-xl font-bold text-heading mb-6">Áreas de Habilidades</h2>
      <div className="space-y-4">
        {data.map((skill) => (
          <div key={skill.id} className="flex items-center justify-between gap-4">
            <span className="text-sm text-foreground min-w-[100px]">{skill.name}</span>
            <div className="flex-1">
              <Progress 
                value={skill.userProgress} 
                className="h-2 bg-[#E0E0E0]"
              />
            </div>
            <span className="text-sm font-semibold text-heading min-w-[45px] text-right">
              {skill.userProgress}%
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};
