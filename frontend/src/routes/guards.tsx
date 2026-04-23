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

/**
 * Flips the usual relationship: if the user is already signed in, they get
 * redirected away from the auth page (back to the admin home, or wherever
 * they were headed). Used on /admin/login.
 */
export function RedirectIfAuthed({ children }: PropsWithChildren) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const admin = useAuthStore((s) => s.admin);
  const location = useLocation();

  if (accessToken && admin) {
    const from = (location.state as { from?: Location } | null)?.from?.pathname;
    return <Navigate to={from ?? '/admin'} replace />;
  }
  return <>{children}</>;
}
