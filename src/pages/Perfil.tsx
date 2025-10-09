import { InternalLayout } from '@/components/internal/InternalLayout';

const Perfil = () => {
  return (
    <InternalLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-heading">Perfil de Usuario</h1>
        <p className="text-muted-foreground mt-2">
          Administra tu información personal y preferencias
        </p>
      </div>
    </InternalLayout>
  );
};

export default Perfil;
