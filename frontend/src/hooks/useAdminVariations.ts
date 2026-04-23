import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminVariationApi } from '@/api/admin/variations';
import type {
  CreateVariationRequest,
  ImageAdminDto,
  ProductAdminDetailDto,
  ReorderRequest,
  UpdateVariationRequest,
  UUID,
  VariationAdminDto,
} from '@/types/api';

const keys = {
  product:     (productId: UUID) => ['admin', 'products', 'detail', productId] as const,
  variations:  (productId: UUID) => ['admin', 'products', productId, 'variations'] as const,
};

export function useVariationsForProduct(productId: UUID | undefined) {
  return useQuery({
    queryKey: productId ? keys.variations(productId) : ['admin', 'variations', 'empty'],
    queryFn: () => adminVariationApi.listForProduct(productId as UUID),
    enabled: Boolean(productId),
  });
}

/* --------------------------- variation CRUD --------------------------- */

export function useCreateVariation(productId: UUID) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateVariationRequest) => adminVariationApi.create(productId, body),
    onSuccess: () => invalidateAround(qc, productId),
  });
}

export function useUpdateVariation(productId: UUID, variationId: UUID) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateVariationRequest) => adminVariationApi.update(variationId, body),
    onSuccess: () => invalidateAround(qc, productId),
  });
}

export function useDeleteVariation(productId: UUID) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (variationId: UUID) => adminVariationApi.delete(variationId),
    // Optimistic: drop the variation from both the product detail and the
    // list cache before the server round-trip.
    onMutate: async (variationId) => {
      await qc.cancelQueries({ queryKey: keys.variations(productId) });
      const prevDetail = qc.getQueryData<ProductAdminDetailDto>(keys.product(productId));
      const prevList = qc.getQueryData<VariationAdminDto[]>(keys.variations(productId));
      if (prevDetail) {
        qc.setQueryData<ProductAdminDetailDto>(keys.product(productId), {
          ...prevDetail,
          variations: prevDetail.variations.filter((v) => v.id !== variationId),
        });
      }
      if (prevList) {
        qc.setQueryData<VariationAdminDto[]>(
          keys.variations(productId),
          prevList.filter((v) => v.id !== variationId),
        );
      }
      return { prevDetail, prevList };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prevDetail) qc.setQueryData(keys.product(productId), ctx.prevDetail);
      if (ctx?.prevList)   qc.setQueryData(keys.variations(productId), ctx.prevList);
    },
    onSettled: () => invalidateAround(qc, productId),
  });
}

export function useSetDefaultVariation(productId: UUID) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (variationId: UUID) => adminVariationApi.setDefault(variationId),
    onMutate: async (variationId) => {
      await qc.cancelQueries({ queryKey: keys.variations(productId) });
      const prev = qc.getQueryData<VariationAdminDto[]>(keys.variations(productId));
      const prevDetail = qc.getQueryData<ProductAdminDetailDto>(keys.product(productId));
      if (prev) {
        qc.setQueryData<VariationAdminDto[]>(
          keys.variations(productId),
          prev.map((v) => ({ ...v, isDefault: v.id === variationId })),
        );
      }
      if (prevDetail) {
        qc.setQueryData<ProductAdminDetailDto>(keys.product(productId), {
          ...prevDetail,
          variations: prevDetail.variations.map((v) => ({
            ...v,
            isDefault: v.id === variationId,
          })),
        });
      }
      return { prev, prevDetail };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev)       qc.setQueryData(keys.variations(productId), ctx.prev);
      if (ctx?.prevDetail) qc.setQueryData(keys.product(productId),   ctx.prevDetail);
    },
    onSettled: () => invalidateAround(qc, productId),
  });
}

/* ----------------------------- image ops ----------------------------- */

export function useUploadVariationImage(productId: UUID) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      variationId,
      file,
      altText,
    }: {
      variationId: UUID;
      file: File;
      altText?: string;
    }) => adminVariationApi.uploadImage(variationId, file, altText),
    onSuccess: (created, { variationId }) => {
      patchImages(qc, productId, variationId, (imgs) => [...imgs, created]);
    },
    onSettled: () => invalidateAround(qc, productId),
  });
}

export function useDeleteVariationImage(productId: UUID) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ variationId, imageId }: { variationId: UUID; imageId: UUID }) =>
      adminVariationApi.deleteImage(variationId, imageId),
    onMutate: async ({ variationId, imageId }) => {
      await qc.cancelQueries({ queryKey: keys.variations(productId) });
      const snapshot = snapshotAll(qc, productId);
      patchImages(qc, productId, variationId, (imgs) => imgs.filter((i) => i.id !== imageId));
      return snapshot;
    },
    onError: (_err, _vars, ctx) => restoreAll(qc, productId, ctx),
    onSettled: () => invalidateAround(qc, productId),
  });
}

export function useReorderVariationImages(productId: UUID) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ variationId, body }: { variationId: UUID; body: ReorderRequest }) =>
      adminVariationApi.reorderImages(variationId, body),
    onMutate: async ({ variationId, body }) => {
      await qc.cancelQueries({ queryKey: keys.variations(productId) });
      const snapshot = snapshotAll(qc, productId);
      const orderById = new Map(body.items.map((i) => [i.id, i.sortOrder]));
      patchImages(qc, productId, variationId, (imgs) =>
        [...imgs]
          .map((i) => ({ ...i, sortOrder: orderById.get(i.id) ?? i.sortOrder }))
          .sort((a, b) => a.sortOrder - b.sortOrder),
      );
      return snapshot;
    },
    onError: (_err, _vars, ctx) => restoreAll(qc, productId, ctx),
    onSettled: () => invalidateAround(qc, productId),
  });
}

export function useSetPrimaryVariationImage(productId: UUID) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ variationId, imageId }: { variationId: UUID; imageId: UUID }) =>
      adminVariationApi.setPrimaryImage(variationId, imageId),
    onMutate: async ({ variationId, imageId }) => {
      await qc.cancelQueries({ queryKey: keys.variations(productId) });
      const snapshot = snapshotAll(qc, productId);
      patchVariation(qc, productId, variationId, (v) => ({ ...v, primaryImageId: imageId }));
      return snapshot;
    },
    onError: (_err, _vars, ctx) => restoreAll(qc, productId, ctx),
    onSettled: () => invalidateAround(qc, productId),
  });
}

/* ------------------------------ helpers ------------------------------ */

function invalidateAround(qc: ReturnType<typeof useQueryClient>, productId: UUID) {
  void qc.invalidateQueries({ queryKey: keys.product(productId) });
  void qc.invalidateQueries({ queryKey: keys.variations(productId) });
  // Public product detail caches the same shape — refresh it too.
  void qc.invalidateQueries({ queryKey: ['public', 'products', 'detail'] });
}

interface CacheSnapshot {
  list?: VariationAdminDto[];
  detail?: ProductAdminDetailDto;
}

function snapshotAll(qc: ReturnType<typeof useQueryClient>, productId: UUID): CacheSnapshot {
  return {
    list:   qc.getQueryData<VariationAdminDto[]>(keys.variations(productId)),
    detail: qc.getQueryData<ProductAdminDetailDto>(keys.product(productId)),
  };
}

function restoreAll(
  qc: ReturnType<typeof useQueryClient>,
  productId: UUID,
  snap: CacheSnapshot | undefined,
) {
  if (!snap) return;
  if (snap.list)   qc.setQueryData(keys.variations(productId), snap.list);
  if (snap.detail) qc.setQueryData(keys.product(productId),   snap.detail);
}

function patchVariation(
  qc: ReturnType<typeof useQueryClient>,
  productId: UUID,
  variationId: UUID,
  fn: (v: VariationAdminDto) => VariationAdminDto,
) {
  const apply = (v: VariationAdminDto) => (v.id === variationId ? fn(v) : v);
  const list = qc.getQueryData<VariationAdminDto[]>(keys.variations(productId));
  if (list) qc.setQueryData(keys.variations(productId), list.map(apply));
  const detail = qc.getQueryData<ProductAdminDetailDto>(keys.product(productId));
  if (detail) {
    qc.setQueryData<ProductAdminDetailDto>(keys.product(productId), {
      ...detail,
      variations: detail.variations.map(apply),
    });
  }
}

function patchImages(
  qc: ReturnType<typeof useQueryClient>,
  productId: UUID,
  variationId: UUID,
  fn: (imgs: ImageAdminDto[]) => ImageAdminDto[],
) {
  patchVariation(qc, productId, variationId, (v) => ({ ...v, images: fn(v.images) }));
}
