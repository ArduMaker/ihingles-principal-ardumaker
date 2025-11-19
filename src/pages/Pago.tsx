import { useParams, useNavigate } from 'react-router-dom';
import { InternalLayout } from '@/components/internal/InternalLayout';
import { PaymentForm } from '@/components/pago/PaymentForm';
import { OrderSummary } from '@/components/pago/OrderSummary';
import { mockPlans } from '@/data/planes';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getSubscriptionPlanDetailsById } from '@/services/BillingService';

const Pago = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  
  const [plan, setPlan] = useState<any | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');

  useEffect(() => {
    const load = async () => {
      if (!planId) return navigate('/facturacion');
      try {
        const data = await getSubscriptionPlanDetailsById(planId as string);
        // backend may return { data: { ... } } or the plan directly
        const raw = data && (data.data ?? data);

        // Map backend plan to local Plan shape expected by UI

        const mapped = raw
          ? {
              id: raw.id,
              name: raw.billing_frequency == "YEAR" ? 'Plan Anual' : 'Plan Mensual',
              price: raw.price ?? 0,
              nivel: raw.profile?.nombre ?? raw.name ?? raw.id,
              description: raw.description ?? raw.profile?.descripcion ?? '',
              tagline: raw.tagline ?? '',
              backgroundImage: raw.backgroundImage ?? '/planes/nivel1.png',
              skills: (raw.profile?.skills || []).map((s: any, i: number) => ({ id: `s-${i}`, name: s, icon: '/planes/grammar.svg', level: '' })),
              buttonColor: 'bg-[#2C4A2C]',
              textColor: 'text-white',
            }
          : null;

        if (mapped) setPlan(mapped);
      } catch (e) {
        // fallback to mock
        const mp = mockPlans.find(p => p.id === planId);
        if (!mp) return navigate('/facturacion');
        setPlan(mp);
      }
    };
    load();
  }, [planId]);

  if (!plan) return null;

  return (
    <InternalLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-heading mb-2">
              Detalles del {plan.name}
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Revisa los detalles de tu plan seleccionado antes de continuar
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/facturacion')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Atrás
          </Button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form - 2 columns */}
          <div className="lg:col-span-2">
            <PaymentForm plan={plan} paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} />
          </div>

          {/* Order Summary - 1 column */}
          <div className="lg:col-span-1">
            <OrderSummary plan={plan} paymentMethod={paymentMethod} />
          </div>
        </div>
      </div>
    </InternalLayout>
  );
};

export default Pago;
