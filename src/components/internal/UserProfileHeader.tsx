import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useEffect, useState } from 'react';
import { get_user_profile } from '@/data/profile';
import { UserProfile } from '@/types/auth';

export const UserProfileHeader = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const data = await get_user_profile('1');
      if (data) {
        setProfile(data);
      }
    };
    loadProfile();
  }, []);

  if (!profile) {
    return null;
  }

  const initials = profile.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="p-4 border-b border-sidebar-border">
      <div className="flex items-center gap-3">
        <Avatar className="w-12 h-12 border-2 border-sidebar-border">
          <AvatarImage src={profile.avatar} alt={profile.name} />
          <AvatarFallback className="text-sm font-bold bg-primary text-primary-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-sidebar-foreground truncate">
            {profile.name}
          </p>
          <p className="text-xs text-sidebar-foreground/60 truncate">
            {profile.subtitle}
          </p>
        </div>
      </div>
    </div>
  );
};
