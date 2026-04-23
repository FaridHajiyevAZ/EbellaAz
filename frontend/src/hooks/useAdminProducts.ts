import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminProductApi, AdminProductListParams } from '@/api/admin/products';
import type { CreateProductRequest, UpdateProductRequest, UUID } from '@/types/api';

const keys = {
  all:    ['admin', 'products'] as const,
  list:   (p: AdminProductListParams) => ['admin', 'products', 'list', p] as const,
  detail: (id: UUID) => ['admin', 'products', 'detail', id] as const,
};

export function useAdminProductList(params: AdminProductListParams) {
  return useQuery({
    queryKey: keys.list(params),
    queryFn: () => adminProductApi.list(params),
  });
}

export function useAdminProduct(id: UUID | undefined) {
  return useQuery({
    queryKey: id ? keys.detail(id) : ['admin', 'products', 'detail', 'empty'],
    queryFn: () => adminProductApi.get(id as UUID),
    enabled: Boolean(id),
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateProductRequest) => adminProductApi.create(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.all });
    },
  });
}

export function useUpdateProduct(id: UUID) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateProductRequest) => adminProductApi.update(id, body),
    onSuccess: (data) => {
      qc.setQueryData(keys.detail(id), data);
      void qc.invalidateQueries({ queryKey: keys.all });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: UUID) => adminProductApi.delete(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.all });
    },
  });
}
