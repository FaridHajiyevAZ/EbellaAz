import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import type {
  ContactInfoAdminDto,
  CreateContactInfoRequest,
  UpdateContactInfoRequest,
  UUID,
} from '@/types/api';

export const adminContactInfoApi = {
  list: () =>
    apiClient.get<ContactInfoAdminDto[]>(endpoints.adminContactInfo).then((r) => r.data),

  get: (id: UUID) =>
    apiClient
      .get<ContactInfoAdminDto>(`${endpoints.adminContactInfo}/${id}`)
      .then((r) => r.data),

  create: (body: CreateContactInfoRequest) =>
    apiClient.post<ContactInfoAdminDto>(endpoints.adminContactInfo, body).then((r) => r.data),

  update: (id: UUID, body: UpdateContactInfoRequest) =>
    apiClient
      .put<ContactInfoAdminDto>(`${endpoints.adminContactInfo}/${id}`, body)
      .then((r) => r.data),

  delete: (id: UUID) =>
    apiClient.delete<void>(`${endpoints.adminContactInfo}/${id}`).then(() => undefined),
};
