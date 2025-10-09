import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Menu, X } from 'lucide-react';
import {
  DashboardIcon,
  UnidadesIcon,
  BibliotecaIcon,
  VocabularioIcon,
  HabilidadesIcon,
  ProductosIcon,
  PlanesIcon,
  PerfilIcon,
  ExitIcon
} from './SidebarIcons';

interface MenuItem {
  label: string;
  path: string;
  icon: React.FC<{ className?: string; active?: boolean }>;
}

const menuItems: { section: string; items: MenuItem[] }[] = [
  {
    section: 'APRENDIZAJE',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: DashboardIcon },
      { label: 'Unidades', path: '/unidades', icon: UnidadesIcon },
      { label: 'Biblioteca', path: '/biblioteca', icon: BibliotecaIcon },
      { label: 'Vocabulario', path: '/vocabulario', icon: VocabularioIcon },
    ],
  },
  {
    section: 'GAMIFICACIÓN',
    items: [
      { label: 'Habilidades', path: '/progreso', icon: HabilidadesIcon },
    ],
  },
  {
    section: 'CONFIGURACIÓN',
    items: [
      { label: 'Productos', path: '/productos', icon: ProductosIcon },
      { label: 'Planes', path: '/facturacion', icon: PlanesIcon },
    ],
  },
];

export const MobileSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuth();
  const location = useLocation();

  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden p-2 text-navbar-foreground hover:bg-muted rounded-md"
        aria-label="Abrir menú"
      >
        <Menu className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={closeSidebar}
          />
          
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
            <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
              <div>
                <p className="text-xl font-semibold text-sidebar-foreground italic" style={{ fontFamily: 'Playfair Display, serif' }}>
                  valles
                </p>
                <p className="text-[11px] mt-0.5 text-sidebar-foreground font-medium">
                  System Formulas
                </p>
              </div>
              <button 
                onClick={closeSidebar}
                className="p-2 hover:bg-sidebar-accent/10 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-4">
              {menuItems.map((group) => (
                <div key={group.section} className="mb-6">
                  <p className="px-4 text-[10px] font-semibold text-sidebar-foreground/60 mb-2">
                    {group.section}
                  </p>
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const isActive = location.pathname === item.path;
                      const Icon = item.icon;
                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          onClick={closeSidebar}
                          className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                            isActive
                              ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                              : 'text-sidebar-foreground hover:bg-sidebar-accent/10'
                          }`}
                        >
                          <Icon className="w-5 h-5 flex-shrink-0" active={isActive} />
                          <span>{item.label}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            <div className="border-t border-sidebar-border p-2">
              <NavLink
                to="/perfil"
                onClick={closeSidebar}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors rounded ${
                  location.pathname === '/perfil'
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/10'
                }`}
              >
                <PerfilIcon className="w-5 h-5 flex-shrink-0" active={location.pathname === '/perfil'} />
                <span>Perfil de usuario</span>
              </NavLink>

              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-sidebar-foreground hover:bg-destructive/10 transition-colors rounded mt-1"
              >
                <ExitIcon className="w-5 h-5 flex-shrink-0" />
                <span>Salir</span>
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};
