import { apiClient } from './client';
import { endpoints } from './endpoints';
import type { AdminProfile, TokenResponse } from '@/types/api';

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<TokenResponse>(endpoints.authLogin, { email, password }).then((r) => r.data),
  refresh: (refreshToken: string) =>
    apiClient.post<TokenResponse>(endpoints.authRefresh, { refreshToken }).then((r) => r.data),
  me: () => apiClient.get<AdminProfile>(endpoints.authMe).then((r) => r.data),
};
