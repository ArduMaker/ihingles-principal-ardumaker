import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { UserProfileHeader } from './UserProfileHeader';
import {
  DashboardIcon,
  UnidadesIcon,
  BibliotecaIcon,
  VocabularioIcon,
  HabilidadesIcon,
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
      { label: 'Planes', path: '/facturacion', icon: PlanesIcon },
    ],
  },
];

export const InternalSidebar = () => {
  const { logout } = useAuth();
  const location = useLocation();

  return (
    <aside className="w-48 h-full bg-sidebar border-r border-sidebar-border flex flex-col">
      <UserProfileHeader />

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
  );
};
