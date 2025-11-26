interface ProgresoHeaderProps {
  backgroundImage: string;
}

export const ProgresoHeader = ({ backgroundImage }: ProgresoHeaderProps) => {
  return (
    <div 
      className="relative w-full h-48 md:h-64 bg-cover bg-center flex items-center justify-end px-8 md:px-16"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-lg">
        Árbol de habilidades
      </h1>
    </div>
  );
};
