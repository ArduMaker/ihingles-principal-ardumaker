import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Menu, X } from 'lucide-react';
import logoVerde from '@/assets/logo_verde.svg';
import dashboardIcon from '@/assets/icons/panes.svg';
import unidadesIcon from '@/assets/icons/bock.svg';
import bibliotecaIcon from '@/assets/icons/ion_library.svg';
import vocabularioIcon from '@/assets/icons/lavios.svg';
import habilidadesIcon from '@/assets/icons/rame.svg';
import productosIcon from '@/assets/icons/paquete.svg';
import planesIcon from '@/assets/icons/panes.svg';
import perfilIcon from '@/assets/icons/user.svg';
import exitIcon from '@/assets/icons/exit.svg';

interface MenuItem {
  label: string;
  path: string;
  icon: string;
}

const menuItems: { section: string; items: MenuItem[] }[] = [
  {
    section: 'APRENDIZAJE',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: dashboardIcon },
      { label: 'Unidades', path: '/unidades', icon: unidadesIcon },
      { label: 'Biblioteca', path: '/biblioteca', icon: bibliotecaIcon },
      { label: 'Vocabulario', path: '/vocabulario', icon: vocabularioIcon },
    ],
  },
  {
    section: 'GAMIFICACIÓN',
    items: [
      { label: 'Habilidades', path: '/progreso', icon: habilidadesIcon },
    ],
  },
  {
    section: 'CONFIGURACIÓN',
    items: [
      { label: 'Productos', path: '/productos', icon: productosIcon },
      { label: 'Planes', path: '/facturacion', icon: planesIcon },
    ],
  },
];

export const MobileSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuth();

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
                <img src={logoVerde} alt="Valle's Systems" className="w-32" />
                <p className="text-xs mt-2 text-sidebar-foreground font-medium">
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
                    {group.items.map((item) => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={closeSidebar}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                            isActive
                              ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                              : 'text-sidebar-foreground hover:bg-sidebar-accent/10'
                          }`
                        }
                      >
                        <img src={item.icon} alt={item.label} className="w-5 h-5" />
                        <span>{item.label}</span>
                      </NavLink>
                    ))}
                  </div>
                </div>
              ))}
            </nav>

            <div className="border-t border-sidebar-border p-2">
              <NavLink
                to="/perfil"
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 text-sm transition-colors rounded ${
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/10'
                  }`
                }
              >
                <img src={perfilIcon} alt="Perfil" className="w-5 h-5" />
                <span>Perfil de usuario</span>
              </NavLink>

              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-sidebar-foreground hover:bg-destructive/10 transition-colors rounded mt-1"
              >
                <img src={exitIcon} alt="Salir" className="w-5 h-5" />
                <span>Salir</span>
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};
