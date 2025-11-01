import { Card } from '@/components/ui/card';
import { UserProfile } from '@/types/auth';

interface PerfilPersonalInfoProps {
  user: UserProfile;
}

export const PerfilPersonalInfo = ({ user }: PerfilPersonalInfoProps) => {
  return (
    <Card className="p-6 bg-card border-border h-full">
      <h3 className="text-xl font-bold text-heading mb-6">Información Personal</h3>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-semibold text-heading block mb-1">
            Correo electrónico
          </label>
          <p className="text-foreground">{user.email}</p>
        </div>
        
        <div>
          <label className="text-sm font-semibold text-heading block mb-1">
            Teléfono
          </label>
          <p className="text-foreground">{user.phone}</p>
        </div>
        
        <div>
          <label className="text-sm font-semibold text-heading block mb-1">
            País
          </label>
          <p className="text-foreground">{user.country}</p>
        </div>
        
        <div>
          <label className="text-sm font-semibold text-heading block mb-1">
            Ciudad
          </label>
          <p className="text-foreground">{user.city}</p>
        </div>
      </div>
    </Card>
  );
};
