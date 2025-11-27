interface UnidadesHeaderProps {
  totalUnits: number;
}

export const UnidadesHeader = ({ totalUnits }: UnidadesHeaderProps) => {
  return (
    <div className="mb-6 md:mb-8">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-heading mb-2">
        Unidades de Aprendizaje
      </h1>
      <p className="text-sm sm:text-base text-muted-foreground">
        Explora las {totalUnits} unidades divididas en tres niveles para dominar el inglés.
      </p>
    </div>
  );
};
