import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderTree,
  Package,
  Images,
  FileText,
  LogOut,
  Settings,
} from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button';

const NAV = [
  { to: '/admin',             label: 'Dashboard',    icon: LayoutDashboard, end: true },
  { to: '/admin/categories',  label: 'Categories',   icon: FolderTree },
  { to: '/admin/products',    label: 'Products',     icon: Package },
  { to: '/admin/media',       label: 'Media',        icon: Images },
  { to: '/admin/content',     label: 'Content',      icon: FileText },
  { to: '/admin/settings',    label: 'Settings',     icon: Settings },
];

export function AdminLayout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="grid min-h-full grid-cols-1 bg-bg md:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="hidden border-r border-border bg-surface md:flex md:flex-col">
        <div className="flex h-16 items-center px-5">
          <Logo />
        </div>
        <nav className="flex-1 space-y-0.5 px-3 py-2 text-sm">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded px-3 py-2 text-muted transition-colors hover:bg-bg-alt hover:text-fg',
                  isActive && 'bg-bg-alt text-fg',
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-border p-4">
          <div className="mb-2">
            <div className="truncate text-sm font-medium text-fg">{admin?.fullName}</div>
            <div className="truncate text-xs text-muted">{admin?.email}</div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="w-full">
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>
      </aside>

      <div className="flex flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-bg/85 px-6 backdrop-blur md:px-8">
          <span className="font-display text-heading text-fg">Admin</span>
          {admin && (
            <span className="text-sm text-muted">
              Signed in as <strong className="text-fg">{admin.email}</strong>
            </span>
          )}
        </header>
        <main className="flex-1 p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
