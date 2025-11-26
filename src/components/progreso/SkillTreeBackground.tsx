import { BookOpen, Volume2, Mic } from 'lucide-react';

interface SkillTreeBackgroundProps {
  backgroundImage: string;
}

export const SkillTreeBackground = ({ backgroundImage }: SkillTreeBackgroundProps) => {
  // Skill icons positioned across the tree
  const skills = [
    { Icon: BookOpen, position: 'top-[25%] left-[20%]', label: 'Reading' },
    { Icon: Volume2, position: 'top-[40%] left-[40%]', label: 'Listening' },
    { Icon: Mic, position: 'top-[40%] right-[40%]', label: 'Speaking' },
    { Icon: BookOpen, position: 'top-[60%] right-[20%]', label: 'Grammar' },
  ];

  return (
    <div 
      className="relative w-full min-h-[400px] md:min-h-[500px] bg-cover bg-center"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {/* Golden path/tree lines - simplified for responsiveness */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 1000 600"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Vertical main trunk */}
        <line x1="500" y1="0" x2="500" y2="600" stroke="#DFB400" strokeWidth="3" opacity="0.5" />
        
        {/* Branches */}
        <line x1="500" y1="150" x2="200" y2="200" stroke="#DFB400" strokeWidth="2" opacity="0.5" />
        <line x1="500" y1="250" x2="400" y2="280" stroke="#DFB400" strokeWidth="2" opacity="0.5" />
        <line x1="500" y1="250" x2="600" y2="280" stroke="#DFB400" strokeWidth="2" opacity="0.5" />
        <line x1="500" y1="400" x2="800" y2="450" stroke="#DFB400" strokeWidth="2" opacity="0.5" />
      </svg>

      {/* Skill icons */}
      {skills.map((skill, index) => (
        <div 
          key={index}
          className={`absolute ${skill.position} transform -translate-x-1/2 -translate-y-1/2`}
        >
          <div className="relative group">
            {/* Shield background */}
            <div className="w-12 h-12 md:w-14 md:h-14 bg-[#1F2937] rounded-lg border-2 border-[#DFB400] flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
              <skill.Icon className="w-6 h-6 md:w-7 md:h-7 text-[#DFB400]" />
            </div>
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/75 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {skill.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
