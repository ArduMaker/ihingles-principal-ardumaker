import { InternalLayout } from '@/components/internal/InternalLayout';

const Facturacion = () => {
  return (
    <InternalLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-heading">Planes y Facturación</h1>
        <p className="text-muted-foreground mt-2">
          Gestiona tu suscripción y métodos de pago
        </p>
      </div>
    </InternalLayout>
  );
};

export default Facturacion;
