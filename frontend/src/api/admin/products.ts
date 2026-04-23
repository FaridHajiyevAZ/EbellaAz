import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import type {
  CreateProductRequest,
  PageResponse,
  ProductAdminDetailDto,
  ProductAdminListItemDto,
  ProductStatus,
  UpdateProductRequest,
  UUID,
} from '@/types/api';

export interface AdminProductListParams {
  q?: string;
  categoryId?: UUID | null;
  subtree?: boolean;
  status?: ProductStatus;
  featured?: boolean;
  page?: number;    // 0-indexed
  size?: number;
  sort?: string;    // e.g. 'updatedAt,desc'
}

export const adminProductApi = {
  list: (params: AdminProductListParams = {}) =>
    apiClient
      .get<PageResponse<ProductAdminListItemDto>>(endpoints.adminProducts, {
        params: normaliseParams(params),
      })
      .then((r) => r.data),

  get: (id: UUID) =>
    apiClient.get<ProductAdminDetailDto>(endpoints.adminProduct(id)).then((r) => r.data),

  create: (body: CreateProductRequest) =>
    apiClient.post<ProductAdminDetailDto>(endpoints.adminProducts, body).then((r) => r.data),

  update: (id: UUID, body: UpdateProductRequest) =>
    apiClient.put<ProductAdminDetailDto>(endpoints.adminProduct(id), body).then((r) => r.data),

  delete: (id: UUID) =>
    apiClient.delete<void>(endpoints.adminProduct(id)).then(() => undefined),
};

function normaliseParams(p: AdminProductListParams): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (p.q)          out.q = p.q;
  if (p.categoryId) out.categoryId = p.categoryId;
  if (p.subtree !== undefined) out.subtree = p.subtree;
  if (p.status)     out.status = p.status;
  if (p.featured !== undefined) out.featured = p.featured;
  if (p.page !== undefined) out.page = p.page;
  if (p.size !== undefined) out.size = p.size;
  if (p.sort)       out.sort = p.sort;
  return out;
}
