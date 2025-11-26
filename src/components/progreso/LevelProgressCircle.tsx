import { Lock } from 'lucide-react';

interface LevelProgressCircleProps {
  level: 'explorador' | 'cualificado' | 'maestro';
  percentage: number;
  icon: string;
  label: string;
  isLocked: boolean;
}

export const LevelProgressCircle = ({ 
  level, 
  percentage, 
  icon, 
  label, 
  isLocked 
}: LevelProgressCircleProps) => {
  const size = 120;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const getColors = () => {
    switch (level) {
      case 'explorador':
        return {
          border: '#DC2626',
          fill: '#FEF08A',
          progress: '#DC2626'
        };
      case 'cualificado':
        return {
          border: '#16A34A',
          fill: '#FEF08A',
          progress: '#16A34A'
        };
      case 'maestro':
        return {
          border: '#DFB400',
          fill: '#1F2937',
          progress: '#DFB400'
        };
    }
  };

  const colors = getColors();

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2 mb-1">
        {isLocked && <Lock className="w-4 h-4 text-muted-foreground" />}
        <span className="text-sm font-medium text-foreground capitalize">{label}</span>
      </div>
      
      <div className="relative" style={{ width: size, height: size }}>
        {/* Outer border circle */}
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={colors.progress}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>

        {/* Inner circle with icon */}
        <div 
          className="absolute inset-0 m-auto rounded-full flex items-center justify-center"
          style={{
            width: size - strokeWidth * 3,
            height: size - strokeWidth * 3,
            backgroundColor: colors.fill,
            border: `4px solid ${colors.border}`
          }}
        >
          <img 
            src={icon} 
            alt={label}
            className="w-12 h-12 object-contain"
          />
        </div>
      </div>

      <div className="text-lg font-bold text-foreground">
        {percentage}%
      </div>
    </div>
  );
};
