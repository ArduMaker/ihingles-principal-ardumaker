import { InternalLayout } from '@/components/internal/InternalLayout';

const Biblioteca = () => {
  return (
    <InternalLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-heading">Biblioteca</h1>
        <p className="text-muted-foreground mt-2">
          Accede a todos tus recursos y materiales de aprendizaje
        </p>
      </div>
    </InternalLayout>
  );
};

export default Biblioteca;
