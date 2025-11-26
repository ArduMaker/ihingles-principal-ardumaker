interface ProgresoHeroProps {
  title?: string;
}

export const ProgresoHero = ({ title = "Árbol de habilidades" }: ProgresoHeroProps) => {
  return (
    <div className="relative w-full h-64 overflow-hidden rounded-lg mb-8">
      <img 
        src="/habilidades/principal.png" 
        alt="Árbol de habilidades" 
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
      <h1 className="absolute bottom-8 right-8 text-5xl font-bold font-alef text-white">
        {title}
      </h1>
    </div>
  );
};
