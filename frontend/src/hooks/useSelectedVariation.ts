import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ProductDetail, ProductImage, ProductVariationPublic } from '@/types/api';

export interface UseSelectedVariationResult {
  /** Currently selected variation, or null if the product has none yet. */
  selected: ProductVariationPublic | null;
  /** Switch to a different variation id. No-op if the id is not part of the product. */
  selectById: (id: string) => void;
  /** Ordered gallery of the selected variation (primary image first, then sortOrder). */
  images: ProductImage[];
}

/**
 * Owns the "which color is active right now" state for the product page.
 *
 * - Initial value comes from {@code product.defaultVariationId}, falling back
 *   to the first variation in the list.
 * - When the product changes (e.g. navigating to a different slug) the
 *   selection resets to the new default.
 * - If the currently selected variation disappears on refetch (deleted in
 *   the admin, for example), we transparently fall back to the new default.
 * - Images are returned in a stable display order: the variation's primary
 *   image first, then the rest by {@code sortOrder}.
 */
export function useSelectedVariation(
  product: ProductDetail | undefined,
): UseSelectedVariationResult {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const productId = product?.id ?? null;

  useEffect(() => {
    if (!product) return;
    const defaultId =
      product.defaultVariationId ?? product.variations[0]?.id ?? null;
    setSelectedId((prev) => {
      if (prev && product.variations.some((v) => v.id === prev)) return prev;
      return defaultId;
    });
    // Reset whenever the product identity changes, or the backend's default
    // moves to a different variation.
  }, [productId, product?.defaultVariationId, product]);

  const selected = useMemo<ProductVariationPublic | null>(() => {
    if (!product || !selectedId) return null;
    return product.variations.find((v) => v.id === selectedId) ?? null;
  }, [product, selectedId]);

  const images = useMemo<ProductImage[]>(() => {
    if (!selected) return [];
    const primaryId = selected.primaryImageId ?? null;
    return [...selected.images].sort((a, b) => {
      if (a.id === primaryId) return -1;
      if (b.id === primaryId) return 1;
      return a.sortOrder - b.sortOrder;
    });
  }, [selected]);

  const selectById = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  return { selected, selectById, images };
}
