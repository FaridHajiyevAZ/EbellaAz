import { useEffect, useState } from 'react';
import { Outlet, ScrollRestoration, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopbar } from './AdminTopbar';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/app/store/authStore';

export function AdminLayout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const setAdmin = useAuthStore((s) => s.setAdmin);

  // Validate the stored session on mount. If the token is stale, the axios
  // interceptor either refreshes it or clears the store (which triggers
  // RequireAdmin to redirect to /admin/login).
  const me = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.me,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (me.data) setAdmin(me.data);
  }, [me.data, setAdmin]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="flex min-h-full bg-bg">
      <AdminSidebar
        admin={admin}
        onLogout={handleLogout}
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 p-6 md:p-8">
          <Outlet />
        </main>
      </div>

      <ScrollRestoration />
    </div>
  );
}
