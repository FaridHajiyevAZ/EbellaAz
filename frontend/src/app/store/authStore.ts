import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AdminProfile } from '@/types/api';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  admin: AdminProfile | null;
  setTokens: (access: string, refresh: string, admin: AdminProfile) => void;
  setAdmin: (admin: AdminProfile) => void;
  clear: () => void;
}

/**
 * Persisted in localStorage. We keep the refresh token here for convenience
 * in this phase — for stricter security it should move to an httpOnly cookie
 * issued by the backend.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      admin: null,
      setTokens: (access, refresh, admin) =>
        set({ accessToken: access, refreshToken: refresh, admin }),
      setAdmin: (admin) => set({ admin }),
      clear: () => set({ accessToken: null, refreshToken: null, admin: null }),
    }),
    { name: 'ebella.admin.auth.v1' },
  ),
);
