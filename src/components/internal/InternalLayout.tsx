import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { InternalNavbar } from './InternalNavbar';
import { InternalSidebar } from './InternalSidebar';
import { MobileSidebar } from './MobileSidebar';
import { toast } from 'sonner';
import DashboardLoader from '@/components/dashboard/DashboardLoader';

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
      navigate('/dashboard_login');
    }
  }, [isAuthenticated, isLoading, navigate]);

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
