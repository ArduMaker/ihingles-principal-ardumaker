import { InternalLayout } from '@/components/internal/InternalLayout';

const Dashboard = () => {
  return (
    <InternalLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-heading">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Bienvenido a tu panel de control
        </p>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-2">Progreso General</h3>
            <p className="text-muted-foreground text-sm">
              Continúa con tu aprendizaje
            </p>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-2">Unidades Activas</h3>
            <p className="text-muted-foreground text-sm">
              3 unidades en progreso
            </p>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-2">Racha Actual</h3>
            <p className="text-muted-foreground text-sm">
              7 días consecutivos
            </p>
          </div>
        </div>
      </div>
    </InternalLayout>
  );
};

export default Dashboard;
