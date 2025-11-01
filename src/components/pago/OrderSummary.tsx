import { Plan } from '@/types/planes';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface OrderSummaryProps {
  plan: Plan;
}

export const OrderSummary = ({ plan }: OrderSummaryProps) => {
  const navigate = useNavigate();
  const subtotal = plan.price;
  const discount = 0;
  const tax = Math.round(subtotal * 0.21);
  const total = subtotal - discount + tax;

  const handleConfirmPayment = () => {
    toast.success('Pago procesado correctamente', {
      description: `Tu suscripción al ${plan.name} está activa.`,
    });
    
    // Simulate payment processing
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
  };

  return (
    <div className="space-y-6 sticky top-8">
      {/* Order Summary */}
      <Card className="p-6 bg-[#C8D5B9]">
        <h3 className="text-2xl font-bold text-[#2C4A2C] mb-6">Resumen del pedido</h3>

        <div className="space-y-3 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-[#2C4A2C]">Plan</span>
            <span className="font-semibold text-[#2C4A2C]">{plan.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#2C4A2C]">Duración</span>
            <span className="font-semibold text-[#2C4A2C]">1 año</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#2C4A2C]">Precio</span>
            <span className="font-semibold text-[#2C4A2C]">{subtotal}€</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#2C4A2C]">Descuento promocional</span>
            <span className="font-semibold text-[#2C4A2C]">-{discount}€</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#2C4A2C]">Impuestos (21% IVA)</span>
            <span className="font-semibold text-[#2C4A2C]">{tax}€</span>
          </div>
        </div>

        <div className="border-t-2 border-[#2C4A2C] pt-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-[#2C4A2C]">Total</span>
            <span className="text-3xl font-bold text-[#2C4A2C]">{total}€</span>
          </div>
        </div>

        <Button
          onClick={handleConfirmPayment}
          className="w-full bg-[#2C4A2C] hover:bg-[#1f3520] text-[#C8A960] font-bold py-6 text-lg"
        >
          Confirmar Pago
        </Button>

        <div className="flex items-center justify-center gap-2 mt-4 text-sm text-[#2C4A2C]">
          <Shield className="w-4 h-4" />
          <span>Pago seguro con cifrado SSL</span>
        </div>

        <div className="mt-4 p-3 bg-[#B5C7A7] rounded-lg">
          <p className="text-xs text-[#2C4A2C] text-center">
            <span className="font-semibold">Se te cobrará hoy</span> y se renovará
            automáticamente <span className="font-semibold">cada 12 meses.</span>
          </p>
        </div>
      </Card>

      {/* Skills Included */}
      <Card className="p-6 bg-[#C8D5B9]">
        <h3 className="text-xl font-bold text-[#2C4A2C] mb-4">Resumen del pedido</h3>
        <div className="space-y-3">
          {plan.skills.map((skill) => (
            <div key={skill.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#2C4A2C]" />
                <span className="text-sm font-medium text-[#2C4A2C]">{skill.name}</span>
              </div>
              <span className="text-xs text-[#2C4A2C]">{skill.level}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
