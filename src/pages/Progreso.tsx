import { InternalLayout } from '@/components/internal/InternalLayout';

const Progreso = () => {
  return (
    <InternalLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-heading">Habilidades y Progreso</h1>
        <p className="text-muted-foreground mt-2">
          Visualiza tu progreso y mejora tus habilidades
        </p>
      </div>
    </InternalLayout>
  );
};

export default Progreso;
