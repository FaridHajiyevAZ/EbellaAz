import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import type {
  CreateHomeSectionRequest,
  HomeSectionAdminDto,
  ReorderRequest,
  UpdateHomeSectionRequest,
  UUID,
} from '@/types/api';

export const adminHomeSectionApi = {
  list: () =>
    apiClient.get<HomeSectionAdminDto[]>(endpoints.adminHomeSections).then((r) => r.data),

  get: (id: UUID) =>
    apiClient
      .get<HomeSectionAdminDto>(`${endpoints.adminHomeSections}/${id}`)
      .then((r) => r.data),

  create: (body: CreateHomeSectionRequest) =>
    apiClient.post<HomeSectionAdminDto>(endpoints.adminHomeSections, body).then((r) => r.data),

  update: (id: UUID, body: UpdateHomeSectionRequest) =>
    apiClient
      .put<HomeSectionAdminDto>(`${endpoints.adminHomeSections}/${id}`, body)
      .then((r) => r.data),

  delete: (id: UUID) =>
    apiClient.delete<void>(`${endpoints.adminHomeSections}/${id}`).then(() => undefined),

  reorder: (body: ReorderRequest) =>
    apiClient
      .patch<void>(`${endpoints.adminHomeSections}/reorder`, body)
      .then(() => undefined),
};
