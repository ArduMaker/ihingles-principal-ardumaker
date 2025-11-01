interface BibliotecaHeroProps {
  title?: string;
}

export const BibliotecaHero = ({ title = "Biblioteca" }: BibliotecaHeroProps) => {
  return (
    <div className="relative w-full h-64 overflow-hidden rounded-lg mb-8">
      <img 
        src="/bibloteca/principal.png" 
        alt="Biblioteca" 
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
      <h1 className="absolute bottom-8 right-8 text-5xl font-bold text-white">
        {title}
      </h1>
    </div>
  );
};
