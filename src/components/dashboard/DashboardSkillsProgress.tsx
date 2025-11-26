import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { SkillProgress } from '@/types';

interface DashboardSkillsProgressProps {
  data: SkillProgress[];
}

export const DashboardSkillsProgress = ({ data }: DashboardSkillsProgressProps) => {
  return (
    <Card className="p-4 md:p-6 bg-card border-border">
      <h2 className="text-lg md:text-xl font-bold text-heading mb-4 md:mb-6">Áreas de Habilidades</h2>
      <div className="space-y-3 md:space-y-4">
        {data.map((skill) => (
          <div key={skill.id} className="flex items-center justify-between gap-3 md:gap-4">
            <span className="text-xs md:text-sm text-foreground min-w-[80px] md:min-w-[100px]">{skill.name}</span>
            <div className="flex-1">
              <Progress 
                value={skill.userProgress} 
                className="h-1.5 md:h-2 bg-[#E0E0E0]"
              />
            </div>
            <span className="text-xs md:text-sm font-semibold text-heading min-w-[40px] md:min-w-[45px] text-right">
              {skill.userProgress}%
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};
