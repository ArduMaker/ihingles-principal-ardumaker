interface UnidadHeroProps {
  levelName: string;
  levelImage: string;
}

export const UnidadHero = ({ levelName, levelImage }: UnidadHeroProps) => {
  return (
    <div className="relative h-48 md:h-64 rounded-lg overflow-hidden">
      <img 
        src={levelImage}
        alt={levelName}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.currentTarget.src = '/placeholder.svg';
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
        <div className="p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white">{levelName}</h1>
        </div>
      </div>
    </div>
  );
};
