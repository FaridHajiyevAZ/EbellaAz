import { apiClient } from './client';
import { endpoints } from './endpoints';
import type { ContactInfoPublic, HomePagePayload, PublicSettings } from '@/types/api';

export const cmsApi = {
  home: () => apiClient.get<HomePagePayload>(endpoints.publicHome).then((r) => r.data),
  contact: (locale?: string) =>
    apiClient
      .get<ContactInfoPublic>(endpoints.publicContact, { params: locale ? { locale } : undefined })
      .then((r) => r.data),
  settings: () => apiClient.get<PublicSettings>(endpoints.publicSettings).then((r) => r.data),
};
