interface ProgresoHeaderProps {
  backgroundImage: string;
}

export const ProgresoHeader = ({ backgroundImage }: ProgresoHeaderProps) => {
  return (
    <div 
      className="relative w-full h-40 md:h-48 bg-cover bg-center flex items-center justify-end px-8 md:px-16"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg" style={{ fontFamily: 'serif' }}>
        Árbol de habilidades
      </h1>
    </div>
  );
};
