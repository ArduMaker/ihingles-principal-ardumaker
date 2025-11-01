import { InternalLayout } from '@/components/internal/InternalLayout';
import { PlanesHero } from '@/components/planes/PlanesHero';
import { PlanCard } from '@/components/planes/PlanCard';
import { mockPlans } from '@/data/planes';

const Facturacion = () => {
  return (
    <InternalLayout>
      <PlanesHero />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Title section */}
        <div className="text-center mb-12">
          <h2 className="text-[clamp(2rem,4vw,3rem)] font-bold text-heading mb-4">
            Elige el plan perfecto para ti
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Descubre nuestros planes diseñados para adaptarse a tus necesidades de aprendiz, desde{' '}
            <span className="font-semibold">principiantes hasta expertos.</span>
          </p>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {mockPlans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>

        {/* Footer note */}
        <p className="text-center text-lg text-heading">
          Duración: 1 año de acceso a la plataforma para todos los planes{' '}
          <span className="text-destructive">*</span>
        </p>
      </div>
    </InternalLayout>
  );
};

export default Facturacion;
