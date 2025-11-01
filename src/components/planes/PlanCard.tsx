import { Plan } from '@/types/planes';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface PlanCardProps {
  plan: Plan;
}

export const PlanCard = ({ plan }: PlanCardProps) => {
  const navigate = useNavigate();

  const handleSelectPlan = () => {
    navigate(`/facturacion/pago/${plan.id}`);
  };

  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      {/* Header with background image */}
      <div className="relative h-[180px]">
        <img
          src={plan.backgroundImage}
          alt={plan.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <h3 className="text-[clamp(2.5rem,5vw,4rem)] font-bold text-white mb-2">
            {plan.price}€
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="bg-[#E8E4D9] p-6">
        <h4 className={`text-2xl font-bold mb-2 ${plan.textColor}`}>
          {plan.nivel}
        </h4>
        <h5 className="text-xl font-semibold mb-3 text-gray-800">
          {plan.name}
        </h5>
        <p className="text-sm text-gray-700 mb-6">
          {plan.description}
        </p>

        {/* Skills grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {plan.skills.map((skill) => (
            <div key={skill.id} className="flex flex-col items-center text-center">
              <div className="w-16 h-16 mb-2 flex items-center justify-center">
                <img
                  src={skill.icon}
                  alt={skill.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-xs font-semibold text-gray-800 mb-1">
                {skill.name}
              </p>
              <p className="text-[10px] text-gray-600">
                {skill.level}
              </p>
            </div>
          ))}
        </div>

        {/* Special badge for Maestro plan */}
        {plan.id === 'maestro' && (
          <div className="bg-white rounded-lg p-4 mb-4">
            <p className="text-xs font-semibold text-center text-gray-800">
              4 + SESIONES PACK INDIVIDUALES
            </p>
          </div>
        )}

        {/* Button */}
        <Button
          onClick={handleSelectPlan}
          className={`w-full ${plan.buttonColor} hover:opacity-90 text-${plan.id === 'maestro' ? 'black' : 'white'} font-semibold py-6`}
        >
          Seleccionar plan
        </Button>
      </div>
    </Card>
  );
};
