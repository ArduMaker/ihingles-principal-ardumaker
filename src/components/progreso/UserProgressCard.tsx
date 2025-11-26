import { Card } from '@/components/ui/card';

interface UserProgressCardProps {
  name: string;
  level: number;
  title: string;
  xp: string;
  percentage: number;
  avatar?: string;
  shield?: string;
}

export const UserProgressCard = ({
  name,
  level,
  title,
  xp,
  percentage,
  avatar,
  shield
}: UserProgressCardProps) => {
  return (
    <Card className="bg-[#C8E6C9]/95 border-[#7CB342] border-4 p-4 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-20 h-20 rounded-lg overflow-hidden border-4 border-[#DFB400] bg-white">
            {avatar ? (
              <img 
                src={avatar} 
                alt={name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#7CB342] text-white text-2xl font-bold">
                {name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* User info */}
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-[#2C5F2D] mb-0.5 truncate">{name}</h2>
          <p className="text-xs text-[#4A7C59] mb-1 truncate">{title}</p>
          <p className="text-xs text-[#4A7C59] mb-2">{xp}</p>
          
          {/* Progress bar */}
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-[#A5D6A7] rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-[#2C5F2D] h-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-xs font-bold text-[#2C5F2D] min-w-[40px]">
              {percentage}%
            </span>
          </div>
        </div>

        {/* Level badge */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <div className="text-base font-bold text-[#2C5F2D]">Nvl: {level}</div>
          {shield && (
            <img 
              src={shield} 
              alt="Shield"
              className="w-8 h-8 object-contain"
            />
          )}
        </div>
      </div>
    </Card>
  );
};
