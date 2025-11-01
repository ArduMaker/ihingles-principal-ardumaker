import { Card } from '@/components/ui/card';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { LearningSkill } from '@/types/auth';

interface PerfilLearningProgressProps {
  skills: LearningSkill[];
}

export const PerfilLearningProgress = ({ skills }: PerfilLearningProgressProps) => {
  return (
    <Card className="p-6 bg-[#C8E6C9] border-[#C8E6C9] h-full">
      <h3 className="text-xl font-bold text-heading mb-6">Progreso de aprendizaje</h3>
      <ResponsiveContainer width="100%" height={350}>
        <RadarChart data={skills}>
          <PolarGrid stroke="#8BC34A" />
          <PolarAngleAxis 
            dataKey="skill" 
            tick={{ fill: '#2C5F2D', fontSize: 14, fontWeight: 500 }}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 100]} 
            tick={{ fill: '#4A7C59', fontSize: 12 }}
          />
          <Radar 
            name="Progress" 
            dataKey="value" 
            stroke="#2C5F2D" 
            fill="#4A7C59" 
            fillOpacity={0.7}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </Card>
  );
};
