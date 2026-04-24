import { NavLink, useLocation } from 'react-router-dom';
import {
  FileText,
  FolderTree,
  Images,
  LayoutDashboard,
  LogOut,
  Package,
  Palette,
  Settings,
  Sparkles,
} from 'lucide-react';
import { useEffect } from 'react';
import { Logo } from '@/components/common/Logo';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import type { AdminProfile } from '@/types/api';

import type { LucideIcon } from 'lucide-react';

interface AdminNavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

export const ADMIN_NAV: readonly AdminNavItem[] = [
  { to: '/admin',               label: 'Dashboard',          icon: LayoutDashboard, end: true },
  { to: '/admin/categories',    label: 'Categories',         icon: FolderTree },
  { to: '/admin/products',      label: 'Products',           icon: Package },
  { to: '/admin/variations',    label: 'Variations',         icon: Palette },
  { to: '/admin/hero-slides',   label: 'Hero Slides',        icon: Sparkles },
  { to: '/admin/home-sections', label: 'Homepage Content',   icon: FileText },
  { to: '/admin/media',         label: 'Media',              icon: Images },
  { to: '/admin/settings',      label: 'Contact & Settings', icon: Settings },
];

interface Props {
  admin: AdminProfile | null;
  onLogout: () => void;
  /** Controls the mobile drawer open state. Desktop ignores this prop. */
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function AdminSidebar({ admin, onLogout, mobileOpen, onMobileClose }: Props) {
  // Close the mobile drawer automatically on navigation.
  const location = useLocation();
  useEffect(() => {
    if (mobileOpen) onMobileClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    if (!mobileOpen) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden shrink-0 border-r border-border bg-surface md:flex md:w-60 md:flex-col">
        <SidebarContents admin={admin} onLogout={onLogout} />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            aria-label="Close menu"
            onClick={onMobileClose}
            className="absolute inset-0 bg-fg/40 backdrop-blur-[2px]"
          />
          <aside className="absolute left-0 top-0 flex h-full w-[82%] max-w-xs flex-col border-r border-border bg-surface shadow-pop animate-fade-in">
            <SidebarContents admin={admin} onLogout={onLogout} />
          </aside>
        </div>
      )}
    </>
  );
}

function SidebarContents({
  admin,
  onLogout,
}: {
  admin: AdminProfile | null;
  onLogout: () => void;
}) {
  return (
    <>
      <div className="flex h-16 items-center px-5">
        <Logo />
      </div>
      <nav className="flex-1 space-y-0.5 px-3 py-2 text-sm">
        {ADMIN_NAV.map(({ to, label, icon: Icon, end }) => (
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
          <div className="truncate text-sm font-medium text-fg">
            {admin?.fullName ?? '—'}
          </div>
          <div className="truncate text-xs text-muted">{admin?.email ?? ''}</div>
        </div>
        <Button variant="outline" size="sm" onClick={onLogout} className="w-full">
          <LogOut className="h-4 w-4" /> Sign out
        </Button>
      </div>
    </>
  );
}
