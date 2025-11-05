import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';

export const UserProfileHeader = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-sidebar-border animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-sidebar-border rounded animate-pulse" />
            <div className="h-3 bg-sidebar-border rounded w-3/4 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="p-4 border-b border-sidebar-border">
      <div className="flex items-center gap-3">
        <Avatar className="w-12 h-12 border-2 border-sidebar-border">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback className="text-sm font-bold bg-primary text-primary-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-sidebar-foreground truncate">
            {user.name}
          </p>
          <p className="text-xs text-sidebar-foreground/60 truncate">
            {user.subtitle}
          </p>
        </div>
      </div>
    </div>
  );
};
