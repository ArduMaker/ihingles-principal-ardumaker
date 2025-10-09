import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { InternalNavbar } from './InternalNavbar';
import { InternalSidebar } from './InternalSidebar';
import { MobileSidebar } from './MobileSidebar';
import { toast } from 'sonner';

interface InternalLayoutProps {
  children: ReactNode;
}

export const InternalLayout = ({ children }: InternalLayoutProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.error('Tu sesión ha expirado', {
        description: 'Por favor, inicia sesión nuevamente'
      });
      navigate('/');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden">
      <nav className="h-16 border-b border-navbar-border bg-navbar flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <MobileSidebar />
          <InternalNavbar />
        </div>
      </nav>
      
      <div className="flex flex-1 overflow-hidden">
        <div className="hidden lg:block">
          <InternalSidebar />
        </div>
        <main className="flex-1 overflow-y-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  );
};
