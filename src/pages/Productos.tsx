import { InternalLayout } from '@/components/internal/InternalLayout';

const Productos = () => {
  return (
    <InternalLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-heading">Productos</h1>
        <p className="text-muted-foreground mt-2">
          Explora nuestros productos y servicios
        </p>
      </div>
    </InternalLayout>
  );
};

export default Productos;
