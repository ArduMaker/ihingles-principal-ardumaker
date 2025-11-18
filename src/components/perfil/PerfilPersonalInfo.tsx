import { Card } from '@/components/ui/card';
import { UserProfile } from '@/types/auth';

interface PerfilPersonalInfoProps {
  user: UserProfile;
}

const fmtDate = (d?: string | null) => {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleString();
  } catch (e) {
    return String(d);
  }
};

const fmtBool = (v?: boolean | null) => (v ? 'Sí' : 'No');

export const PerfilPersonalInfo = ({ user }: PerfilPersonalInfoProps) => {
  const u: any = user as any;

  return (
    <Card className="p-6 bg-card border-border h-full">
      <h3 className="text-xl font-bold text-heading mb-6">Información Personal</h3>
      <div className="space-y-3 text-sm">
        <div>
          <label className="text-xs font-semibold text-heading block mb-1">Nombre</label>
          <p className="text-foreground">{u.name ?? '—'}</p>
        </div>

        <div>
          <label className="text-xs font-semibold text-heading block mb-1">Correo electrónico</label>
          <p className="text-foreground">{u.email ?? '—'}</p>
        </div>

        <div>
          <label className="text-xs font-semibold text-heading block mb-1">Administrador</label>
          <p className="text-foreground">{fmtBool(u.isAdmin)}</p>
        </div>

        <div>
          <label className="text-xs font-semibold text-heading block mb-1">Unidades compradas (boughtUpTo)</label>
          <p className="text-foreground">{u.boughtUpTo ?? '—'}</p>
        </div>

        <div>
          <label className="text-xs font-semibold text-heading block mb-1">Unidades extra solicitadas</label>
          <p className="text-foreground">{u.extraUnitsRequested ?? 0}</p>
        </div>

        <div>
          <label className="text-xs font-semibold text-heading block mb-1">Unidad actual (atUnit)</label>
          <p className="text-foreground">{u.atUnit ?? '—'}</p>
        </div>

        <div>
          <label className="text-xs font-semibold text-heading block mb-1">Suscripción válida hasta</label>
          <p className="text-foreground">{fmtDate(u.subscriptionValidUntil)}</p>
        </div>

        <div>
          <label className="text-xs font-semibold text-heading block mb-1">Próximo cobro</label>
          <p className="text-foreground">{fmtDate(u.nextBillingTime)}</p>
        </div>

        <div>
          <label className="text-xs font-semibold text-heading block mb-1">Es institución</label>
          <p className="text-foreground">{fmtBool(u.isInstitution)}</p>
        </div>

        <div>
          <label className="text-xs font-semibold text-heading block mb-1">Navegación libre</label>
          <p className="text-foreground">{fmtBool(u.freeNavigation)}</p>
        </div>

        <div>
          <label className="text-xs font-semibold text-heading block mb-1">Creado el</label>
          <p className="text-foreground">{fmtDate(u.createdAt)}</p>
        </div>

        <div>
          <label className="text-xs font-semibold text-heading block mb-1">Prueba gratuita usada</label>
          <p className="text-foreground">{fmtBool(u.freeTrialUsed)}</p>
        </div>
      </div>
    </Card>
  );
};
