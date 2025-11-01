import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserProfile } from '@/types/auth';

interface PerfilUserCardProps {
  user: UserProfile;
}

export const PerfilUserCard = ({ user }: PerfilUserCardProps) => {
  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="flex items-center gap-6 mb-8">
      <Avatar className="w-32 h-32 border-4 border-background shadow-lg">
        <AvatarImage src={user.avatar} alt={user.name} />
        <AvatarFallback className="text-3xl font-bold bg-primary text-primary-foreground">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-heading mb-2">
          Mi Perfil ({user.name})
        </h2>
      </div>
    </div>
  );
};
