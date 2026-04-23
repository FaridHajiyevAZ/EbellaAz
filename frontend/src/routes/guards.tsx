import { PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/app/store/authStore';

/**
 * Blocks rendering of protected admin routes until the session contains a
 * valid token + admin profile. Redirects to /admin/login and preserves the
 * intended destination so post-login navigation can resume.
 */
export function RequireAdmin({ children }: PropsWithChildren) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const admin = useAuthStore((s) => s.admin);
  const location = useLocation();

  if (!accessToken || !admin) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }
  return <>{children}</>;
}
