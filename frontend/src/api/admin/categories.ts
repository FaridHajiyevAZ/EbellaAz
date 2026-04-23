import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import type {
  CategoryAdminDto,
  ContentStatus,
  CreateCategoryRequest,
  PageResponse,
  ReorderRequest,
  UpdateCategoryRequest,
  UUID,
} from '@/types/api';

export interface AdminCategoryListParams {
  q?: string;
  parentId?: UUID | null;
  onlyRoots?: boolean;
  status?: ContentStatus;
  page?: number;       // 0-indexed (matches Spring Pageable)
  size?: number;
  sort?: string;       // e.g. 'sortOrder,asc'
}

export const adminCategoryApi = {
  list: (params: AdminCategoryListParams = {}) =>
    apiClient
      .get<PageResponse<CategoryAdminDto>>(endpoints.adminCategories, { params: normaliseParams(params) })
      .then((r) => r.data),

  get: (id: UUID) =>
    apiClient.get<CategoryAdminDto>(endpoints.adminCategory(id)).then((r) => r.data),

  create: (body: CreateCategoryRequest) =>
    apiClient.post<CategoryAdminDto>(endpoints.adminCategories, body).then((r) => r.data),

  update: (id: UUID, body: UpdateCategoryRequest) =>
    apiClient.put<CategoryAdminDto>(endpoints.adminCategory(id), body).then((r) => r.data),

  delete: (id: UUID, reassignTo?: UUID | null) =>
    apiClient
      .delete<void>(endpoints.adminCategory(id), {
        params: reassignTo ? { reassignTo } : undefined,
      })
      .then(() => undefined),

  reorder: (parentId: UUID | null, body: ReorderRequest) =>
    apiClient
      .patch<void>(endpoints.adminCategoriesReorder, body, {
        params: parentId ? { parentId } : undefined,
      })
      .then(() => undefined),
};

function normaliseParams(params: AdminCategoryListParams): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (params.q)         out.q = params.q;
  if (params.parentId)  out.parentId = params.parentId;
  if (params.onlyRoots) out.onlyRoots = true;
  if (params.status)    out.status = params.status;
  if (params.page !== undefined) out.page = params.page;
  if (params.size !== undefined) out.size = params.size;
  if (params.sort)      out.sort = params.sort;
  return out;
}
