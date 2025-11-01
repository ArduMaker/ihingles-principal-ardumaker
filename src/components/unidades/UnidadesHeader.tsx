interface UnidadesHeaderProps {
  totalUnits: number;
}

export const UnidadesHeader = ({ totalUnits }: UnidadesHeaderProps) => {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-heading mb-2">Unidades de Aprendizaje</h1>
      <p className="text-muted-foreground">
        Explora las {totalUnits} unidades divididas en tres niveles para dominar el inglés.
      </p>
    </div>
  );
};
