import { apiClient } from './client';
import { endpoints } from './endpoints';
import type {
  CategoryTreeNode,
  PageResponse,
  ProductCard,
  ProductDetail,
} from '@/types/api';

export interface ProductListParams {
  categoryId?: string;
  subtree?: boolean;
  q?: string;
  featured?: boolean;
  page?: number;
  size?: number;
  sort?: string;
}

export const catalogApi = {
  categoryTree: () =>
    apiClient.get<CategoryTreeNode[]>(endpoints.publicCategories).then((r) => r.data),

  productList: (params: ProductListParams = {}) =>
    apiClient
      .get<PageResponse<ProductCard>>(endpoints.publicProducts, { params })
      .then((r) => r.data),

  productDetail: (slug: string) =>
    apiClient.get<ProductDetail>(endpoints.publicProduct(slug)).then((r) => r.data),
};
