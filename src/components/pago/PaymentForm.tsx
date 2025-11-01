import { useState } from 'react';
import { Plan } from '@/types/planes';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard } from 'lucide-react';

interface PaymentFormProps {
  plan: Plan;
}

export const PaymentForm = ({ plan }: PaymentFormProps) => {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [sameAddress, setSameAddress] = useState(false);

  return (
    <div className="space-y-6">
      {/* Payment Method Card */}
      <Card className="p-6 bg-[#C8D5B9]">
        <h2 className="text-2xl font-bold text-[#2C4A2C] mb-6">{plan.name}</h2>

        {/* Payment Method */}
        <div className="mb-6">
          <Label className="text-base font-semibold text-[#2C4A2C] mb-3 block">
            Método de Pago
          </Label>
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card" className="font-normal cursor-pointer">
                  Tarjeta de Crédito/Débito
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="paypal" id="paypal" />
                <Label htmlFor="paypal" className="font-normal cursor-pointer">
                  PayPal
                </Label>
              </div>
            </div>
          </RadioGroup>

          {/* Payment Icons */}
          <div className="flex items-center gap-2 mt-3">
            <div className="w-12 h-8 bg-[#1434CB] rounded flex items-center justify-center text-white text-xs font-bold">
              VISA
            </div>
            <div className="w-12 h-8 bg-[#EB001B] rounded flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-[#FF5F00] opacity-80"></div>
            </div>
            <div className="w-12 h-8 bg-[#00457C] rounded flex items-center justify-center text-white text-[8px] font-bold">
              AMEX
            </div>
            <div className="w-12 h-8 bg-[#003087] rounded flex items-center justify-center text-white text-xs font-bold">
              PayPal
            </div>
          </div>
        </div>

        {/* Card Details */}
        {paymentMethod === 'card' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="cardNumber" className="text-[#2C4A2C]">
                  No de Tarjeta *
                </Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  className="mt-1 bg-white"
                />
              </div>
              <div>
                <Label htmlFor="cardHolder" className="text-[#2C4A2C]">
                  Titular de la tarjeta*
                </Label>
                <Input
                  id="cardHolder"
                  placeholder="Nombre y Apellidos"
                  className="mt-1 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              <div>
                <Label htmlFor="expiry" className="text-[#2C4A2C]">
                  Fecha de Expedición *
                </Label>
                <Input
                  id="expiry"
                  placeholder="MM/AA"
                  className="mt-1 bg-white"
                />
              </div>
              <div>
                <Label htmlFor="cvv" className="text-[#2C4A2C]">
                  CVV *
                </Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  maxLength={4}
                  className="mt-1 bg-white"
                />
              </div>
              <div className="flex items-end">
                <div className="flex items-center space-x-2">
                  <Checkbox id="saveCard" />
                  <Label htmlFor="saveCard" className="text-sm font-normal cursor-pointer">
                    Guardar tarjeta
                  </Label>
                </div>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Billing Address Card */}
      <Card className="p-6 bg-[#C8D5B9]">
        <h3 className="text-2xl font-bold text-[#2C4A2C] mb-6">Dirección de Facturación</h3>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="country" className="text-[#2C4A2C]">
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
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="postalCode" className="text-[#2C4A2C]">
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
            <Label htmlFor="address" className="text-[#2C4A2C]">
              Dirección *
            </Label>
            <Input
              id="address"
              placeholder="Nombre y Apellidos"
              className="mt-1 bg-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city" className="text-[#2C4A2C]">
                Ciudad
              </Label>
              <Select defaultValue="madrid">
                <SelectTrigger id="city" className="mt-1 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white z-50">
                  <SelectItem value="madrid">Madrid</SelectItem>
                  <SelectItem value="barcelona">Barcelona</SelectItem>
                  <SelectItem value="valencia">Valencia</SelectItem>
                  <SelectItem value="sevilla">Sevilla</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="state" className="text-[#2C4A2C]">
                Provincia/Estado
              </Label>
              <Select defaultValue="alcobendas">
                <SelectTrigger id="state" className="mt-1 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white z-50">
                  <SelectItem value="alcobendas">Alcobendas</SelectItem>
                  <SelectItem value="madrid-centro">Madrid Centro</SelectItem>
                  <SelectItem value="pozuelo">Pozuelo de Alarcón</SelectItem>
                  <SelectItem value="majadahonda">Majadahonda</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="sameAddress"
              checked={sameAddress}
              onCheckedChange={(checked) => setSameAddress(checked as boolean)}
            />
            <Label htmlFor="sameAddress" className="text-sm font-normal cursor-pointer">
              La dirección de facturación es la misma que la dirección de envío
            </Label>
          </div>
        </div>
      </Card>
    </div>
  );
};
