import { useQuery } from '@tanstack/react-query';
import { catalogApi, ProductListParams } from '@/api/catalog';
import { cmsApi } from '@/api/cms';

const keys = {
  tree: ['public', 'categories'] as const,
  productList: (params: ProductListParams) => ['public', 'products', params] as const,
  productDetail: (slug: string) => ['public', 'products', 'detail', slug] as const,
  home: ['public', 'home'] as const,
  contact: (locale?: string) => ['public', 'contact', locale ?? 'default'] as const,
  settings: ['public', 'settings'] as const,
};

export function useCategoryTree() {
  return useQuery({ queryKey: keys.tree, queryFn: catalogApi.categoryTree, staleTime: 5 * 60_000 });
}

export function useProductList(params: ProductListParams) {
  return useQuery({
    queryKey: keys.productList(params),
    queryFn: () => catalogApi.productList(params),
  });
}

export function useProductDetail(slug: string | undefined) {
  return useQuery({
    queryKey: slug ? keys.productDetail(slug) : ['public', 'products', 'detail', 'empty'],
    queryFn: () => catalogApi.productDetail(slug as string),
    enabled: Boolean(slug),
  });
}

export function useHomePayload() {
  return useQuery({ queryKey: keys.home, queryFn: cmsApi.home, staleTime: 2 * 60_000 });
}

export function useContact(locale?: string) {
  return useQuery({ queryKey: keys.contact(locale), queryFn: () => cmsApi.contact(locale) });
}

export function usePublicSettings() {
  return useQuery({ queryKey: keys.settings, queryFn: cmsApi.settings, staleTime: 10 * 60_000 });
}
