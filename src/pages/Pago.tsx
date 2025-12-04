import { useParams, useNavigate } from 'react-router-dom';
import { InternalLayout } from '@/components/internal/InternalLayout';
import { PaymentForm } from '@/components/pago/PaymentForm';
import { OrderSummary } from '@/components/pago/OrderSummary';
import { StripeProvider } from '@/components/pago/StripeProvider';
import { StripeFormRef } from '@/components/pago/StripeForm';
import { mockPlans } from '@/data/planes';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { getSubscriptionPlanDetailsById } from '@/services/BillingService';
import DashboardLoader from '@/components/dashboard/DashboardLoader';

const PagoContent = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const stripeFormRef = useRef<StripeFormRef>(null);
  
  const [plan, setPlan] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');

  useEffect(() => {
    const load = async () => {
      if (!planId) {
        navigate('/facturacion');
        return;
      }
      
      try {
        const data = await getSubscriptionPlanDetailsById(planId);
        const raw = data && (data.data ?? data);

        const mapped = raw
          ? {
              id: raw.id,
              name: raw.billing_frequency === "YEAR" ? 'Plan Anual' : 'Plan Mensual',
              price: raw.price ?? 0,
              nivel: raw.profile?.nombre ?? raw.name ?? raw.id,
              description: raw.description ?? raw.profile?.descripcion ?? '',
              tagline: raw.tagline ?? '',
              backgroundImage: raw.backgroundImage ?? '/planes/nivel1.png',
              skills: (raw.profile?.skills || []).map((s: any, i: number) => ({ 
                id: `s-${i}`, 
                name: s, 
                icon: '/planes/grammar.svg', 
                level: '' 
              })),
              buttonColor: 'bg-[#2C4A2C]',
              textColor: 'text-white',
            }
          : null;

        if (mapped) {
          setPlan(mapped);
        } else {
          // Fallback to mock
          const mp = mockPlans.find(p => p.id === planId);
          if (!mp) {
            navigate('/facturacion');
            return;
          }
          setPlan(mp);
        }
      } catch (e) {
        // Fallback to mock
        const mp = mockPlans.find(p => p.id === planId);
        if (!mp) {
          navigate('/facturacion');
          return;
        }
        setPlan(mp);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [planId, navigate]);

  if (loading) {
    return <DashboardLoader />;
  }

  if (!plan) {
    return null;
  }

  return (
    <InternalLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
          <div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-heading mb-2">
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
            <span className="hidden sm:inline">Volver a planes</span>
            <span className="sm:hidden">Atrás</span>
          </Button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Payment Form - 2 columns */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <PaymentForm 
              plan={plan} 
              paymentMethod={paymentMethod} 
              setPaymentMethod={setPaymentMethod}
              stripeFormRef={stripeFormRef}
            />
          </div>

          {/* Order Summary - 1 column */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <OrderSummary 
              plan={plan} 
              paymentMethod={paymentMethod}
              stripeFormRef={stripeFormRef}
            />
          </div>
        </div>
      </div>
    </InternalLayout>
  );
};

const Pago = () => {
  return (
    <StripeProvider>
      <PagoContent />
    </StripeProvider>
  );
};

export default Pago;
