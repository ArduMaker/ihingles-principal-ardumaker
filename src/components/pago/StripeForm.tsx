import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { forwardRef, useImperativeHandle, useState } from 'react';
import { Label } from '@/components/ui/label';

export interface StripeFormRef {
  createPaymentMethod: () => Promise<{ paymentMethodId: string | null; error: string | null }>;
}

interface StripeFormProps {
  disabled?: boolean;
}

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#2C4A2C',
      fontFamily: '"Inter", sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#6B7280',
      },
    },
    invalid: {
      color: '#ef4444',
      iconColor: '#ef4444',
    },
  },
  hidePostalCode: true,
};

export const StripeForm = forwardRef<StripeFormRef, StripeFormProps>(({ disabled = false }, ref) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);

  useImperativeHandle(ref, () => ({
    createPaymentMethod: async () => {
      if (!stripe || !elements) {
        return { paymentMethodId: null, error: 'Stripe no está inicializado' };
      }

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        return { paymentMethodId: null, error: 'No se encontró el elemento de tarjeta' };
      }

      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        setError(error.message || 'Error al procesar la tarjeta');
        return { paymentMethodId: null, error: error.message || 'Error al procesar la tarjeta' };
      }

      setError(null);
      return { paymentMethodId: paymentMethod?.id || null, error: null };
    },
  }));

  const handleCardChange = (event: any) => {
    if (event.error) {
      setError(event.error.message);
    } else {
      setError(null);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-[#2C4A2C] mb-2 block">Datos de la tarjeta *</Label>
        <div className="bg-white rounded-md border border-input p-3">
          <CardElement 
            options={CARD_ELEMENT_OPTIONS} 
            onChange={handleCardChange}
          />
        </div>
        {error && (
          <p className="text-sm text-red-500 mt-2">{error}</p>
        )}
      </div>
    </div>
  );
});

StripeForm.displayName = 'StripeForm';
