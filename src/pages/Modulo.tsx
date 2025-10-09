import { InternalLayout } from '@/components/internal/InternalLayout';
import { useParams } from 'react-router-dom';

const Modulo = () => {
  const { id } = useParams<{ id: string }>();
  
  return (
    <InternalLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-heading">Módulo {id}</h1>
        <p className="text-muted-foreground mt-2">
          Contenido del módulo de aprendizaje
        </p>
      </div>
    </InternalLayout>
  );
};

export default Modulo;
