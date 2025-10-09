import { useAuth } from '@/hooks/useAuth';
import logoUser from '@/assets/icons/logo_user.svg';
import logo from '@/assets/logo.svg';

export const InternalNavbar = () => {
  const { user } = useAuth();

  return (
    <>
      <img src={logo} alt="Valle's Systems" className="h-8 lg:h-10" />
      
      <div className="flex items-center gap-2 lg:gap-4 ml-auto">
        <div className="text-right hidden sm:block">
          <p className="text-xs lg:text-sm font-semibold text-navbar-foreground">
            {user?.name}
          </p>
          {user?.subtitle && (
            <p className="text-[10px] lg:text-xs text-muted-foreground">
              {user.subtitle}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
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
              className="w-6 h-6 lg:w-8 lg:h-8 hidden sm:block"
            />
          )}
        </div>
      </div>
    </>
  );
};
