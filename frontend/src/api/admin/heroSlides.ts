import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import type {
  CreateHeroSlideRequest,
  HeroSlideAdminDto,
  ReorderRequest,
  UpdateHeroSlideRequest,
  UUID,
} from '@/types/api';

export const adminHeroSlideApi = {
  list: () =>
    apiClient.get<HeroSlideAdminDto[]>(endpoints.adminHeroSlides).then((r) => r.data),

  get: (id: UUID) =>
    apiClient
      .get<HeroSlideAdminDto>(`${endpoints.adminHeroSlides}/${id}`)
      .then((r) => r.data),

  create: (body: CreateHeroSlideRequest) =>
    apiClient.post<HeroSlideAdminDto>(endpoints.adminHeroSlides, body).then((r) => r.data),

  update: (id: UUID, body: UpdateHeroSlideRequest) =>
    apiClient
      .put<HeroSlideAdminDto>(`${endpoints.adminHeroSlides}/${id}`, body)
      .then((r) => r.data),

  delete: (id: UUID) =>
    apiClient.delete<void>(`${endpoints.adminHeroSlides}/${id}`).then(() => undefined),

  reorder: (body: ReorderRequest) =>
    apiClient
      .patch<void>(`${endpoints.adminHeroSlides}/reorder`, body)
      .then(() => undefined),

  uploadImage: (slideId: UUID, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return apiClient
      .put<HeroSlideAdminDto>(`/admin/media/hero-slides/${slideId}/image`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data);
  },
};
