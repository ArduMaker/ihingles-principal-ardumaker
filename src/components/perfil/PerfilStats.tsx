import { Card } from '@/components/ui/card';

interface PerfilStatsProps {
  unitsCompleted: number;
  totalUnits: number;
  consecutiveDays: number;
}

export const PerfilStats = ({ unitsCompleted, totalUnits, consecutiveDays }: PerfilStatsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 mt-6">
      <Card className="p-6 bg-[#7CB342] border-[#7CB342] text-center">
        <p className="text-sm text-white font-medium mb-2">Unidades completadas</p>
        <p className="text-4xl font-bold text-white">
          {unitsCompleted}/{totalUnits}
        </p>
      </Card>
      
    </div>
  );
};
