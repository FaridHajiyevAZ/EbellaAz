/**
 * Single source of truth for backend URL paths. Keeps string literals out of
 * feature code so renames touch one spot.
 */
export const endpoints = {
  publicCategories: '/public/categories',
  publicProducts: '/public/products',
  publicProduct: (slug: string) => `/public/products/${encodeURIComponent(slug)}`,
  publicHome: '/public/home',
  publicContact: '/public/contact',
  publicSettings: '/public/settings',

  authLogin: '/admin/auth/login',
  authRefresh: '/admin/auth/refresh',
  authMe: '/admin/auth/me',

  adminCategories: '/admin/categories',
  adminCategory: (id: string) => `/admin/categories/${id}`,
  adminCategoriesReorder: '/admin/categories/reorder',

  adminProducts: '/admin/products',
  adminProduct: (id: string) => `/admin/products/${id}`,

  adminVariationsOf: (productId: string) => `/admin/products/${productId}/variations`,
  adminVariation: (id: string) => `/admin/variations/${id}`,
  adminVariationDefault: (id: string) => `/admin/variations/${id}/default`,
  adminVariationImages: (id: string) => `/admin/variations/${id}/images`,
  adminVariationImage: (variationId: string, imageId: string) =>
    `/admin/variations/${variationId}/images/${imageId}`,
  adminVariationImageReorder: (id: string) => `/admin/variations/${id}/images/reorder`,
  adminVariationImagePrimary: (variationId: string, imageId: string) =>
    `/admin/variations/${variationId}/images/${imageId}/primary`,

  adminHeroSlides: '/admin/hero-slides',
  adminHomeSections: '/admin/home-sections',
  adminContactInfo: '/admin/contact-info',
  adminSettings: '/admin/settings',
  adminSetting: (key: string) => `/admin/settings/${encodeURIComponent(key)}`,
} as const;
