import { useState, useRef } from 'react';
import { Plan } from '@/types/planes';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StripeForm, StripeFormRef } from './StripeForm';

interface PaymentFormProps {
  plan: Plan;
  paymentMethod: string;
  setPaymentMethod: (v: 'card' | 'paypal') => void;
  stripeFormRef?: React.RefObject<StripeFormRef>;
}

export const PaymentForm = ({ plan, paymentMethod, setPaymentMethod, stripeFormRef }: PaymentFormProps) => {
  const [sameAddress, setSameAddress] = useState(false);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Payment Method Card */}
      <Card className="p-4 md:p-6 bg-[#C8D5B9]">
        <h2 className="text-xl md:text-2xl font-bold text-[#2C4A2C] mb-4 md:mb-6">{plan.name}</h2>

        {/* Payment Method */}
        <div className="mb-6">
          <Label className="text-base font-semibold text-[#2C4A2C] mb-3 block">
            Método de Pago
          </Label>
          <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as 'card' | 'paypal')}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card" className="font-normal cursor-pointer text-sm md:text-base">
                  Tarjeta de Crédito/Débito
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="paypal" id="paypal" />
                <Label htmlFor="paypal" className="font-normal cursor-pointer text-sm md:text-base">
                  PayPal
                </Label>
              </div>
            </div>
          </RadioGroup>

          {/* Payment Icons */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <div className="w-10 h-6 md:w-12 md:h-8 bg-[#1434CB] rounded flex items-center justify-center text-white text-[10px] md:text-xs font-bold">
              VISA
            </div>
            <div className="w-10 h-6 md:w-12 md:h-8 bg-[#EB001B] rounded flex items-center justify-center">
              <div className="w-4 h-4 md:w-6 md:h-6 rounded-full bg-[#FF5F00] opacity-80"></div>
            </div>
            <div className="w-10 h-6 md:w-12 md:h-8 bg-[#00457C] rounded flex items-center justify-center text-white text-[6px] md:text-[8px] font-bold">
              AMEX
            </div>
            <div className="w-10 h-6 md:w-12 md:h-8 bg-[#003087] rounded flex items-center justify-center text-white text-[10px] md:text-xs font-bold">
              PayPal
            </div>
          </div>
        </div>

        {/* Card Details - Stripe Elements */}
        {paymentMethod === 'card' && stripeFormRef && (
          <StripeForm ref={stripeFormRef} />
        )}

        {/* PayPal Message */}
        {paymentMethod === 'paypal' && (
          <div className="p-4 bg-[#B5C7A7] rounded-lg">
            <p className="text-sm text-[#2C4A2C] text-center">
              Serás redirigido a PayPal para completar el pago de forma segura.
            </p>
          </div>
        )}
      </Card>

      {/* Billing Address Card */}
      <Card className="p-4 md:p-6 bg-[#C8D5B9]">
        <h3 className="text-lg md:text-xl font-bold text-[#2C4A2C] mb-4 md:mb-6">Dirección de Facturación</h3>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="country" className="text-[#2C4A2C] text-sm md:text-base">
                País
              </Label>
              <Select defaultValue="es">
                <SelectTrigger id="country" className="mt-1 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white z-50">
                  <SelectItem value="es">España</SelectItem>
                  <SelectItem value="mx">México</SelectItem>
                  <SelectItem value="ar">Argentina</SelectItem>
                  <SelectItem value="co">Colombia</SelectItem>
                  <SelectItem value="us">Estados Unidos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="postalCode" className="text-[#2C4A2C] text-sm md:text-base">
                Código Postal *
              </Label>
              <Input
                id="postalCode"
                placeholder="28001"
                className="mt-1 bg-white"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address" className="text-[#2C4A2C] text-sm md:text-base">
              Dirección *
            </Label>
            <Input
              id="address"
              placeholder="Calle, número, piso..."
              className="mt-1 bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city" className="text-[#2C4A2C] text-sm md:text-base">
                Ciudad
              </Label>
              <Input
                id="city"
                placeholder="Madrid"
                className="mt-1 bg-white"
              />
            </div>
            <div>
              <Label htmlFor="state" className="text-[#2C4A2C] text-sm md:text-base">
                Provincia/Estado
              </Label>
              <Input
                id="state"
                placeholder="Madrid"
                className="mt-1 bg-white"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="sameAddress"
              checked={sameAddress}
              onCheckedChange={(checked) => setSameAddress(checked as boolean)}
            />
            <Label htmlFor="sameAddress" className="text-xs md:text-sm font-normal cursor-pointer">
              La dirección de facturación es la misma que la dirección de envío
            </Label>
          </div>
        </div>
      </Card>
    </div>
  );
};
