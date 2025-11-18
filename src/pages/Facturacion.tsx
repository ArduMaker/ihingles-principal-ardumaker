import { InternalLayout } from '@/components/internal/InternalLayout';
import { PlanesHero } from '@/components/planes/PlanesHero';
import { PlanCard } from '@/components/planes/PlanCard';
import { mockPlans } from '@/data/planes';
import { useEffect, useState } from 'react';
import { getPublishedSubscriptionPlans, getUserBillingData } from '@/services/BillingService';

// helper to map backend plan to local Plan type
const mapBackendPlan = (p: any) => {
  return {
    id: p.id,
    name: p.name || p.id,
    price: p.price ?? 0,
    nivel: p.profile?.nombre ?? p.name ?? p.id,
    description: p.description ?? p.profile?.descripcion ?? '',
    tagline: p.tagline ?? '',
    backgroundImage: p.backgroundImage ?? '/planes/nivel1.png',
    skills: (p.profile?.skills || []).map((s: any, i: number) => ({ id: `s-${i}`, name: s, icon: '/planes/grammar.svg', level: '' })),
    buttonColor: 'bg-[#2C4A2C]',
    textColor: 'text-white',
  };
};

const Facturacion = () => {
  const [plans, setPlans] = useState<any[] | null>(null);
  const [userBilling, setUserBilling] = useState<any | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const published = await getPublishedSubscriptionPlans();
        const maybeArray = (published && (published.data ?? published)) ?? null;
        const mapped = Array.isArray(maybeArray) ? maybeArray.map(mapBackendPlan) : [];
        setPlans(mapped.length ? mapped : null);
      } catch (e) {
        setPlans(null);
      }

      try {
        const ub = await getUserBillingData();
        const ubData = ub && (ub.data ?? ub);
        setUserBilling(ubData ?? null);
      } catch (e) {
        setUserBilling(null);
      }
    };
    load();
  }, []);
  return (
    <InternalLayout>
      <PlanesHero />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 md:pb-16">
        {/* Title section */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-[clamp(1.75rem,4vw,3rem)] font-bold text-heading mb-3 md:mb-4">
            Elige el plan perfecto para ti
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto px-4">
            Descubre nuestros planes diseñados para adaptarse a tus necesidades de aprendiz, desde{' '}
            <span className="font-semibold">principiantes hasta expertos.</span>
          </p>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 mb-8 md:mb-12">
          {(plans ?? mockPlans).map((plan: any) => (
            <PlanCard key={plan.id} plan={plan} userBilling={userBilling} />
          ))}
        </div>

        {/* Footer note */}
        <p className="text-center text-sm md:text-base lg:text-lg text-heading px-4">
          Duración: 1 año de acceso a la plataforma para todos los planes{' '}
          <span className="text-destructive">*</span>
        </p>
      </div>
    </InternalLayout>
  );
};

export default Facturacion;
