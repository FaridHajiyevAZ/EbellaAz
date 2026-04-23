import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { env } from '@/utils/env';
import type { ApiError } from '@/types/api';
import { useAuthStore } from '@/app/store/authStore';

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

/**
 * Single Axios instance for the whole app.
 *
 * - Attaches Bearer token from the auth store.
 * - Transparently refreshes the access token once on a 401, then retries.
 * - Surfaces ApiError-shaped responses so UI can render structured errors.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 15_000,
  withCredentials: false,
});

apiClient.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let refreshInFlight: Promise<string | null> | null = null;

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const status = error.response?.status;
    const original = error.config as RetryableConfig | undefined;

    const isLoginCall =
      original?.url?.includes('/admin/auth/login') ||
      original?.url?.includes('/admin/auth/refresh');

    if (status === 401 && original && !original._retry && !isLoginCall) {
      original._retry = true;
      const refreshed = await tryRefresh();
      if (refreshed) {
        if (original.headers) original.headers.Authorization = `Bearer ${refreshed}`;
        return apiClient(original);
      }
      // Refresh failed — wipe the session and propagate the 401.
      useAuthStore.getState().clear();
    }

    return Promise.reject(toApiError(error));
  },
);

async function tryRefresh(): Promise<string | null> {
  const { refreshToken, setTokens } = useAuthStore.getState();
  if (!refreshToken) return null;
  refreshInFlight ??= axios
    .create({ baseURL: env.apiBaseUrl })
    .post('/admin/auth/refresh', { refreshToken })
    .then((res) => {
      const token = res.data?.accessToken as string | undefined;
      const next = res.data?.refreshToken as string | undefined;
      if (token && next) {
        setTokens(token, next, res.data.admin);
        return token;
      }
      return null;
    })
    .catch(() => null)
    .finally(() => {
      refreshInFlight = null;
    });
  return refreshInFlight;
}

export class AppApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fieldErrors?: ApiError['fieldErrors'];
  readonly original?: unknown;
  constructor(message: string, status: number, code: string, fieldErrors?: ApiError['fieldErrors'], original?: unknown) {
    super(message);
    this.name = 'AppApiError';
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
    this.original = original;
  }
}

function toApiError(error: AxiosError<ApiError>): AppApiError {
  const body = error.response?.data;
  const status = error.response?.status ?? 0;
  if (body && typeof body === 'object') {
    return new AppApiError(body.message ?? error.message, status, body.error ?? 'Error', body.fieldErrors, error);
  }
  if (error.code === 'ERR_NETWORK' || status === 0) {
    return new AppApiError('Network error. Please try again.', 0, 'NetworkError', undefined, error);
  }
  return new AppApiError(error.message, status, 'UnknownError', undefined, error);
}
