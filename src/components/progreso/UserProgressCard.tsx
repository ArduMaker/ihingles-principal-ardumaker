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
    <Card className="bg-[#C8E6C9]/90 border-[#7CB342] border-4 p-6 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Avatar */}
        <div className="relative">
          <div className="w-24 h-24 rounded-lg overflow-hidden border-4 border-[#DFB400] bg-white">
            {avatar ? (
              <img 
                src={avatar} 
                alt={name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#7CB342] text-white text-3xl font-bold">
                {name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* User info */}
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-2xl font-bold text-[#2C5F2D] mb-1">{name}</h2>
          <p className="text-sm text-[#4A7C59] mb-2">{title}</p>
          <p className="text-xs text-[#4A7C59] mb-3">{xp}</p>
          
          {/* Progress bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-[#A5D6A7] rounded-full h-3 overflow-hidden">
              <div 
                className="bg-[#2C5F2D] h-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-sm font-bold text-[#2C5F2D] min-w-[45px]">
              {percentage}%
            </span>
          </div>
        </div>

        {/* Level badge */}
        <div className="flex flex-col items-center gap-2">
          <div className="text-sm font-medium text-[#4A7C59]">Nvl: {level}</div>
          {shield && (
            <img 
              src={shield} 
              alt="Shield"
              className="w-10 h-10 object-contain"
            />
          )}
        </div>
      </div>
    </Card>
  );
};
