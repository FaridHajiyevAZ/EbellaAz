import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import type { SiteSettingAdminDto, UpsertSiteSettingRequest } from '@/types/api';

export const adminSiteSettingApi = {
  list: () =>
    apiClient.get<SiteSettingAdminDto[]>(endpoints.adminSettings).then((r) => r.data),

  get: (key: string) =>
    apiClient.get<SiteSettingAdminDto>(endpoints.adminSetting(key)).then((r) => r.data),

  upsert: (key: string, body: UpsertSiteSettingRequest) =>
    apiClient.put<SiteSettingAdminDto>(endpoints.adminSetting(key), body).then((r) => r.data),

  delete: (key: string) =>
    apiClient.delete<void>(endpoints.adminSetting(key)).then(() => undefined),
};
