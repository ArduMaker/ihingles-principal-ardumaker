import { useAuth } from '@/hooks/useAuth';
import logoUser from '@/assets/icons/logo_user.svg';
import logo from '@/assets/logo.svg';

export const InternalNavbar = () => {
  const { user } = useAuth();

  return (
    <div className="w-full flex items-center justify-between">
      <img src={logo} alt="Valle's Systems" className="h-8 lg:h-9" />
      
      <div className="flex items-center gap-2 lg:gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-xs lg:text-sm font-semibold text-navbar-foreground">
            {user?.name}
          </p>
          {user?.subtitle && (
            <p className="text-[10px] lg:text-xs text-muted-foreground max-w-[200px] truncate">
              {user.subtitle}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 lg:w-11 lg:h-11 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-primary/10">
            <img 
              src={user?.avatar || logoUser} 
              alt={user?.name || 'User'} 
              className="w-full h-full object-cover"
            />
          </div>
          
          {user?.shield && (
            <img 
              src={user.shield} 
              alt="Shield" 
              className="w-7 h-7 lg:w-9 lg:h-9 hidden sm:block"
            />
          )}
        </div>
      </div>
    </div>
  );
};
