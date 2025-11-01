import { useParams, useNavigate } from 'react-router-dom';
import { InternalLayout } from '@/components/internal/InternalLayout';
import { PaymentForm } from '@/components/pago/PaymentForm';
import { OrderSummary } from '@/components/pago/OrderSummary';
import { mockPlans } from '@/data/planes';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const Pago = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  
  const plan = mockPlans.find(p => p.id === planId);

  if (!plan) {
    navigate('/facturacion');
    return null;
  }

  return (
    <InternalLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-heading mb-2">
              Detalles del {plan.name}
            </h1>
            <p className="text-muted-foreground">
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
            <PaymentForm plan={plan} />
          </div>

          {/* Order Summary - 1 column */}
          <div className="lg:col-span-1">
            <OrderSummary plan={plan} />
          </div>
        </div>
      </div>
    </InternalLayout>
  );
};

export default Pago;
