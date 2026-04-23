import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminCategoryApi, AdminCategoryListParams } from '@/api/admin/categories';
import type {
  CreateCategoryRequest,
  ReorderRequest,
  UpdateCategoryRequest,
  UUID,
} from '@/types/api';

const keys = {
  all:    ['admin', 'categories'] as const,
  list:   (params: AdminCategoryListParams) => ['admin', 'categories', 'list', params] as const,
  detail: (id: UUID) => ['admin', 'categories', 'detail', id] as const,
};

export function useAdminCategoryList(params: AdminCategoryListParams) {
  return useQuery({
    queryKey: keys.list(params),
    queryFn: () => adminCategoryApi.list(params),
  });
}

export function useAdminCategory(id: UUID | undefined) {
  return useQuery({
    queryKey: id ? keys.detail(id) : ['admin', 'categories', 'detail', 'empty'],
    queryFn: () => adminCategoryApi.get(id as UUID),
    enabled: Boolean(id),
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateCategoryRequest) => adminCategoryApi.create(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.all });
      // Public tree / menu depends on category data too.
      void qc.invalidateQueries({ queryKey: ['public', 'categories'] });
    },
  });
}

export function useUpdateCategory(id: UUID) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateCategoryRequest) => adminCategoryApi.update(id, body),
    onSuccess: (data) => {
      qc.setQueryData(keys.detail(id), data);
      void qc.invalidateQueries({ queryKey: keys.all });
      void qc.invalidateQueries({ queryKey: ['public', 'categories'] });
    },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reassignTo }: { id: UUID; reassignTo?: UUID | null }) =>
      adminCategoryApi.delete(id, reassignTo ?? null),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.all });
      void qc.invalidateQueries({ queryKey: ['public', 'categories'] });
    },
  });
}

export function useReorderCategories() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ parentId, body }: { parentId: UUID | null; body: ReorderRequest }) =>
      adminCategoryApi.reorder(parentId, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.all });
      void qc.invalidateQueries({ queryKey: ['public', 'categories'] });
    },
  });
}
