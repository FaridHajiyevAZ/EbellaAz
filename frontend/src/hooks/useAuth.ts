import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/app/store/authStore';

export function useAuth() {
  const admin = useAuthStore((s) => s.admin);
  const accessToken = useAuthStore((s) => s.accessToken);
  const setTokens = useAuthStore((s) => s.setTokens);
  const clear = useAuthStore((s) => s.clear);

  const login = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (data) => setTokens(data.accessToken, data.refreshToken, data.admin),
  });

  return {
    admin,
    isAuthenticated: Boolean(accessToken && admin),
    login,
    logout: clear,
  };
}
