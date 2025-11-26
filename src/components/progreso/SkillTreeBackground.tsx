import { BookOpen, Volume2, Mic } from 'lucide-react';

interface SkillTreeBackgroundProps {
  backgroundImage: string;
}

export const SkillTreeBackground = ({ backgroundImage }: SkillTreeBackgroundProps) => {
  // Skill icons positioned across the tree
  const skills = [
    { Icon: BookOpen, position: 'top-1/4 left-1/4', label: 'Reading' },
    { Icon: Volume2, position: 'top-1/3 left-1/2', label: 'Listening' },
    { Icon: Mic, position: 'top-2/3 right-1/4', label: 'Speaking' },
    { Icon: BookOpen, position: 'bottom-1/4 right-1/3', label: 'Grammar' },
  ];

  return (
    <div 
      className="relative w-full min-h-[500px] bg-cover bg-center"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {/* Golden path/tree lines - simplified for responsiveness */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 1000 600"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Vertical main trunk */}
        <line x1="500" y1="0" x2="500" y2="600" stroke="#DFB400" strokeWidth="4" opacity="0.6" />
        
        {/* Branches */}
        <line x1="500" y1="150" x2="250" y2="200" stroke="#DFB400" strokeWidth="3" opacity="0.6" />
        <line x1="500" y1="300" x2="750" y2="350" stroke="#DFB400" strokeWidth="3" opacity="0.6" />
        <line x1="500" y1="450" x2="250" y2="500" stroke="#DFB400" strokeWidth="3" opacity="0.6" />
        <line x1="500" y1="450" x2="750" y2="500" stroke="#DFB400" strokeWidth="3" opacity="0.6" />
      </svg>

      {/* Skill icons */}
      {skills.map((skill, index) => (
        <div 
          key={index}
          className={`absolute ${skill.position} transform -translate-x-1/2 -translate-y-1/2`}
        >
          <div className="relative group">
            {/* Shield background */}
            <div className="w-16 h-16 bg-[#1F2937] rounded-lg border-2 border-[#DFB400] flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
              <skill.Icon className="w-8 h-8 text-[#DFB400]" />
            </div>
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/75 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {skill.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
