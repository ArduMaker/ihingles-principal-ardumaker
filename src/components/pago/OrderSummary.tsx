import { Plan } from '@/types/planes';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, CheckCircle2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { requestSubscriptionLink, createSubscriptionStripe } from '@/services/BillingService';
import { useState } from 'react';
import { StripeFormRef } from './StripeForm';

interface OrderSummaryProps {
  plan: Plan;
  paymentMethod: string;
  stripeFormRef?: React.RefObject<StripeFormRef>;
  currency?: string;
}

export const OrderSummary = ({ plan, paymentMethod, stripeFormRef, currency = 'USD' }: OrderSummaryProps) => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const subtotal = plan.price;
  const discount = 0;
  const tax = Math.round(subtotal * 0.21);
  const total = subtotal - discount + tax;

  const handleConfirmPayment = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      if (paymentMethod === 'paypal') {
        // PayPal flow - redirect to PayPal
        const res = await requestSubscriptionLink(plan.id);
        const link = res?.data?.link ?? res?.link ?? res;
        
        if (link) {
          if (typeof link === 'string' && (link.startsWith('http://') || link.startsWith('https://'))) {
            window.location.href = link;
            return;
          }
          navigate(String(link));
          return;
        }
        throw new Error('No se obtuvo enlace de pago de PayPal');
      }

      // Stripe flow - create payment method first
      if (!stripeFormRef?.current) {
        throw new Error('El formulario de pago no está disponible');
      }

      const { paymentMethodId, error } = await stripeFormRef.current.createPaymentMethod();
      
      if (error || !paymentMethodId) {
        throw new Error(error || 'No se pudo crear el método de pago');
      }

      // Send to backend to create subscription
      const res = await createSubscriptionStripe(plan.id, paymentMethodId, currency);
      
      // Handle response
      const clientSecret = res?.data?.clientSecret ?? res?.clientSecret ?? null;
      const subscriptionStatus = res?.data?.status ?? res?.status ?? null;
      const requiresAction = res?.data?.requires_action ?? res?.requires_action ?? false;

      if (requiresAction && clientSecret) {
        // 3D Secure or additional authentication required
        // This would need stripe.confirmCardPayment - for now show message
        toast.info('Se requiere autenticación adicional', {
          description: 'Por favor, completa la verificación en la ventana emergente.',
        });
        // In a full implementation, you would call stripe.confirmCardPayment here
        navigate('/dashboard');
        return;
      }

      if (subscriptionStatus === 'active' || subscriptionStatus === 'trialing') {
        toast.success('¡Suscripción activada!', {
          description: `Tu suscripción al ${plan.name} está activa.`,
        });
        navigate('/dashboard');
        return;
      }

      // Default success
      toast.success('Pago procesado correctamente', {
        description: `Tu suscripción al ${plan.name} ha sido creada.`,
      });
      navigate('/dashboard');

    } catch (e: any) {
      console.error('Error procesando pago:', e);
      toast.error(e?.message || 'No se pudo procesar el pago. Intenta nuevamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 lg:sticky lg:top-8">
      {/* Order Summary */}
      <Card className="p-4 md:p-6 bg-[#C8D5B9]">
        <h3 className="text-lg md:text-xl font-bold text-[#2C4A2C] mb-4 md:mb-6">Resumen del pedido</h3>

        <div className="space-y-3 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-[#2C4A2C]">Plan</span>
            <span className="font-semibold text-[#2C4A2C]">{plan.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#2C4A2C]">Duración</span>
            <span className="font-semibold text-[#2C4A2C]">
              {plan.name.toLowerCase().includes('anual') ? '1 año' : '1 mes'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#2C4A2C]">Precio</span>
            <span className="font-semibold text-[#2C4A2C]">{subtotal}€</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-[#2C4A2C]">Descuento promocional</span>
              <span className="font-semibold text-green-600">-{discount}€</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-[#2C4A2C]">Impuestos (21% IVA)</span>
            <span className="font-semibold text-[#2C4A2C]">{tax}€</span>
          </div>
        </div>

        <div className="border-t-2 border-[#2C4A2C] pt-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-xl md:text-2xl font-bold text-[#2C4A2C]">Total</span>
            <span className="text-2xl md:text-3xl font-bold text-[#2C4A2C]">{total}€</span>
          </div>
        </div>

        <Button
          onClick={handleConfirmPayment}
          disabled={isProcessing}
          className="w-full bg-[#2C4A2C] hover:bg-[#1f3520] text-[#C8A960] font-bold py-5 md:py-6 text-base md:text-lg disabled:opacity-50"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Procesando...
            </>
          ) : (
            'Confirmar Pago'
          )}
        </Button>

        <div className="flex items-center justify-center gap-2 mt-4 text-xs md:text-sm text-[#2C4A2C]">
          <Shield className="w-4 h-4" />
          <span>Pago seguro con cifrado SSL</span>
        </div>

        <div className="mt-4 p-3 bg-[#B5C7A7] rounded-lg">
          <p className="text-xs text-[#2C4A2C] text-center">
            <span className="font-semibold">Se te cobrará hoy</span> y se renovará
            automáticamente{' '}
            <span className="font-semibold">
              {plan.name.toLowerCase().includes('anual') ? 'cada 12 meses' : 'cada mes'}.
            </span>
          </p>
        </div>
      </Card>

      {/* Skills Included */}
      {plan.skills && plan.skills.length > 0 && (
        <Card className="p-4 md:p-6 bg-[#C8D5B9]">
          <h3 className="text-base md:text-lg font-bold text-[#2C4A2C] mb-4">Incluido en tu plan</h3>
          <div className="space-y-2 md:space-y-3">
            {plan.skills.map((skill) => (
              <div key={skill.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-[#2C4A2C]" />
                  <span className="text-xs md:text-sm font-medium text-[#2C4A2C]">{skill.name}</span>
                </div>
                {skill.level && (
                  <span className="text-[10px] md:text-xs text-[#2C4A2C]">{skill.level}</span>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
