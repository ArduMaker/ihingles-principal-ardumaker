import { InternalLayout } from '@/components/internal/InternalLayout';
import { PlanesHero } from '@/components/planes/PlanesHero';
import { PlanCard } from '@/components/planes/PlanCard';
import { mockPlans } from '@/data/planes';
import { useEffect, useState } from 'react';
import { getPublishedSubscriptionPlans, getUserBillingData } from '@/services/BillingService';
import DashboardLoader from '@/components/dashboard/DashboardLoader';

// Mapea frecuencia de facturación a nombre de plan
const getPlanName = (frequency: string) => {
  const map: Record<string, string> = {
    'YEAR': 'Plan Anual',
    'MONTH': 'Plan Mensual',
    'WEEK': 'Plan Semanal',
    'DAY': 'Plan Diario',
  };
  return map[frequency] || frequency;
};

// Mapea frecuencia a nivel (explorador, cualificado, maestro)
const getPlanLevel = (price: number, frequency: string) => {
  // Lógica basada en precio para determinar nivel
  if (frequency === 'YEAR') {
    if (price >= 1000) return 'Maestro';
    if (price >= 700) return 'Cualificado';
    return 'Explorador';
  } else if (frequency === 'MONTH') {
    if (price >= 100) return 'Maestro';
    if (price >= 60) return 'Cualificado';
    return 'Explorador';
  }
  return 'Explorador';
};

// Obtiene imagen según nivel
const getLevelImage = (nivel: string) => {
  const map: Record<string, string> = {
    'Maestro': '/planes/nivel3.png',
    'Cualificado': '/planes/nivel2.png',
    'Explorador': '/planes/nivel1.png',
  };
  return map[nivel] || '/planes/nivel1.png';
};

// Skills por defecto según nivel
const getSkillsByLevel = (nivel: string) => {
  const skills = [
    { id: 's-1', name: 'Grammar', icon: '/planes/grammar.svg', level: 'Básico' },
    { id: 's-2', name: 'Vocabulary', icon: '/planes/vocabulary.svg', level: 'Básico' },
    { id: 's-3', name: 'Listening', icon: '/planes/listening.svg', level: 'Básico' },
    { id: 's-4', name: 'Reading', icon: '/planes/reading.svg', level: 'Básico' },
    { id: 's-5', name: 'Speaking', icon: '/planes/speaking.svg', level: 'Básico' },
    { id: 's-6', name: 'Pronunciation', icon: '/planes/pronunciation.svg', level: 'Básico' },
  ];
  
  if (nivel === 'Maestro') {
    return skills.map(s => ({ ...s, level: 'Avanzado' }));
  } else if (nivel === 'Cualificado') {
    return skills.map(s => ({ ...s, level: 'Intermedio' }));
  }
  return skills;
};

// helper to map backend plan to local Plan type
const mapBackendPlan = (p: any) => {
  const nivel = getPlanLevel(p.price, p.billing_frequency);
  const frequency = p.billing_frequency === 'YEAR' ? 'año' : p.billing_frequency === 'MONTH' ? 'mes' : 'periodo';
  
  return {
    id: p._id || p.id,
    name: getPlanName(p.billing_frequency),
    price: p.price ?? 0,
    nivel,
    description: `Acceso completo a la plataforma durante 1 ${frequency}. ${p.hasFreeTrial ? 'Incluye prueba gratuita.' : ''}`,
    tagline: p.hasFreeTrial ? 'Prueba gratis' : '',
    backgroundImage: getLevelImage(nivel),
    skills: getSkillsByLevel(nivel),
    buttonColor: nivel === 'Maestro' ? 'bg-[#FFD700]' : 'bg-[#2C4A2C]',
    textColor: nivel === 'Maestro' ? 'text-black' : 'text-white',
  };
};

const Facturacion = () => {
  const [plans, setPlans] = useState<any[] | null>(null);
  const [userBilling, setUserBilling] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
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
      setLoading(false);
    };
    load();
  }, []);

  if (loading || !plans) {
    return (
      <InternalLayout>
        <DashboardLoader />
      </InternalLayout>
    );
  }

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8 mb-8 md:mb-12">
          {(plans).map((plan: any) => (
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
