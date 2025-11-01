export const PerfilHero = () => {
  return (
    <div className="relative h-48 md:h-64 rounded-lg overflow-hidden mb-8">
      <img 
        src="/perfil/principal.png"
        alt="Perfil background"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent flex items-center justify-end">
        <div className="p-6 md:p-8">
          <h1 className="text-3xl md:text-5xl font-bold text-white">Perfil de Usuario</h1>
        </div>
      </div>
    </div>
  );
};
