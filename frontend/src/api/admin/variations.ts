import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import type {
  CreateVariationRequest,
  ImageAdminDto,
  ReorderRequest,
  UpdateVariationRequest,
  UUID,
  VariationAdminDto,
} from '@/types/api';

export const adminVariationApi = {
  listForProduct: (productId: UUID) =>
    apiClient
      .get<VariationAdminDto[]>(endpoints.adminVariationsOf(productId))
      .then((r) => r.data),

  create: (productId: UUID, body: CreateVariationRequest) =>
    apiClient
      .post<VariationAdminDto>(endpoints.adminVariationsOf(productId), body)
      .then((r) => r.data),

  get: (id: UUID) =>
    apiClient.get<VariationAdminDto>(endpoints.adminVariation(id)).then((r) => r.data),

  update: (id: UUID, body: UpdateVariationRequest) =>
    apiClient.put<VariationAdminDto>(endpoints.adminVariation(id), body).then((r) => r.data),

  delete: (id: UUID) =>
    apiClient.delete<void>(endpoints.adminVariation(id)).then(() => undefined),

  setDefault: (id: UUID) =>
    apiClient
      .patch<VariationAdminDto>(endpoints.adminVariationDefault(id))
      .then((r) => r.data),

  uploadImage: (variationId: UUID, file: File, altText?: string) => {
    const form = new FormData();
    form.append('file', file);
    if (altText) form.append('altText', altText);
    return apiClient
      .post<ImageAdminDto>(endpoints.adminVariationImages(variationId), form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data);
  },

  deleteImage: (variationId: UUID, imageId: UUID) =>
    apiClient
      .delete<void>(endpoints.adminVariationImage(variationId, imageId))
      .then(() => undefined),

  reorderImages: (variationId: UUID, body: ReorderRequest) =>
    apiClient
      .patch<VariationAdminDto>(endpoints.adminVariationImageReorder(variationId), body)
      .then((r) => r.data),

  setPrimaryImage: (variationId: UUID, imageId: UUID) =>
    apiClient
      .patch<VariationAdminDto>(endpoints.adminVariationImagePrimary(variationId, imageId))
      .then((r) => r.data),
};
