export const PlanesHero = () => {
  return (
    <div className="relative h-[280px] mb-8">
      <img
        src="/planes/principal1.png"
        alt="Productos y servicios"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-bold text-white text-center px-4">
          Productos y servicios
        </h1>
      </div>
    </div>
  );
};
