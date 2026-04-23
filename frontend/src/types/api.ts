// Shared wire types. Mirrors the Spring Boot DTOs; keep in sync with the
// backend (or regenerate from OpenAPI in a follow-up).

export type UUID = string;

export interface PageResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  traceId?: string | null;
  fieldErrors?: { field: string; code: string; message: string }[] | null;
}

// ---- Catalog ----------------------------------------------------------

export interface CategoryTreeNode {
  id: UUID;
  name: string;
  slug: string;
  fullPath: string;
  depth: number;
  sortOrder: number;
  children: CategoryTreeNode[];
}

export interface Breadcrumb {
  id: UUID;
  name: string;
  slug: string;
  fullPath: string;
}

export interface ProductImage {
  id: UUID;
  url: string;
  renditions: Record<string, string>;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
  sortOrder: number;
}

export interface ProductVariationPublic {
  id: UUID;
  colorName: string;
  colorHex: string;
  stockStatusText: string;
  isDefault: boolean;
  sortOrder: number;
  primaryImageId?: UUID | null;
  images: ProductImage[];
}

export interface WhatsAppInquiry {
  phoneNumber: string;
  message: string;
  url: string;
}

export interface ProductCard {
  id: UUID;
  slug: string;
  name: string;
  brand?: string | null;
  shortDescription?: string | null;
  coverImageUrl?: string | null;
  availableColorHexes: string[];
}

export interface ProductDetail {
  id: UUID;
  sku: string;
  slug: string;
  name: string;
  brand?: string | null;
  shortDescription?: string | null;
  longDescription?: string | null;
  dimensions?: Record<string, unknown> | null;
  materials: string[];
  specs: Record<string, unknown>;
  breadcrumbs: Breadcrumb[];
  defaultVariationId?: UUID | null;
  variations: ProductVariationPublic[];
  whatsappInquiry?: WhatsAppInquiry | null;
}

// ---- CMS --------------------------------------------------------------

export type HomeSectionType =
  | 'HERO_BANNER'
  | 'FEATURED_CATEGORIES'
  | 'FEATURED_PRODUCTS'
  | 'PROMO_BANNER'
  | 'TEXT_BLOCK'
  | 'IMAGE_GRID'
  | 'CTA_STRIP';

export interface HeroSlidePublic {
  id: UUID;
  title: string;
  subtitle?: string | null;
  ctaText?: string | null;
  ctaUrl?: string | null;
  imageUrl?: string | null;
  sortOrder: number;
}

export interface HomeSectionPublic {
  id: UUID;
  type: HomeSectionType;
  title?: string | null;
  subtitle?: string | null;
  body?: string | null;
  imageUrl?: string | null;
  config?: Record<string, unknown> | null;
  sortOrder: number;
}

export interface HomePagePayload {
  heroSlides: HeroSlidePublic[];
  sections: HomeSectionPublic[];
  featuredProducts: ProductCard[];
}

export interface ContactInfoPublic {
  label?: string | null;
  phone?: string | null;
  email?: string | null;
  whatsappNumber?: string | null;
  addressLines: string[];
  city?: string | null;
  country?: string | null;
  mapUrl?: string | null;
  workingHours?: Record<string, string> | null;
}

export type PublicSettings = Record<string, unknown>;

// ---- Auth -------------------------------------------------------------

export type AdminRole = 'SUPER_ADMIN' | 'EDITOR';
export type AdminStatus = 'ACTIVE' | 'DISABLED';

export interface AdminProfile {
  id: UUID;
  email: string;
  fullName: string;
  role: AdminRole;
  status: AdminStatus;
  lastLoginAt?: string | null;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  admin: AdminProfile;
}

// ---- Admin: Catalog ----------------------------------------------------

export type ContentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface CategoryAdminDto {
  id: UUID;
  parentId?: UUID | null;
  name: string;
  slug: string;
  description?: string | null;
  coverImageKey?: string | null;
  coverImageUrl?: string | null;
  path?: string | null;
  depth: number;
  sortOrder: number;
  status: ContentStatus;
  metaTitle?: string | null;
  metaDescription?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CreateCategoryRequest {
  parentId?: UUID | null;
  name: string;
  slug: string;
  description?: string | null;
  coverImageKey?: string | null;
  sortOrder?: number | null;
  status?: ContentStatus | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {}

export interface ReorderRequest {
  items: { id: UUID; sortOrder: number }[];
}

// ---- Admin: Products ---------------------------------------------------

export type ProductStatus = 'DRAFT' | 'PUBLISHED' | 'OUT_OF_STOCK' | 'ARCHIVED';
export type VariationStatus = 'ACTIVE' | 'INACTIVE';

export interface ImageAdminDto {
  id: UUID;
  variationId: UUID;
  storageKey: string;
  url: string;
  renditions: Record<string, string>;
  altText?: string | null;
  contentType?: string | null;
  sizeBytes?: number | null;
  width?: number | null;
  height?: number | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface VariationAdminDto {
  id: UUID;
  productId: UUID;
  colorName: string;
  colorHex: string;
  variationSku?: string | null;
  stockStatusText: string;
  isDefault: boolean;
  sortOrder: number;
  status: VariationStatus;
  primaryImageId?: UUID | null;
  images: ImageAdminDto[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface ProductAdminListItemDto {
  id: UUID;
  sku: string;
  slug: string;
  name: string;
  brand?: string | null;
  categoryId: UUID;
  categoryName: string;
  status: ProductStatus;
  featured: boolean;
  sortOrder: number;
  variationsCount: number;
  coverImageUrl?: string | null;
  updatedAt: string;
}

export interface ProductAdminDetailDto {
  id: UUID;
  categoryId: UUID;
  categoryName: string;
  sku: string;
  slug: string;
  name: string;
  brand?: string | null;
  shortDescription?: string | null;
  longDescription?: string | null;
  dimensions?: Record<string, unknown> | null;
  materials: string[];
  specs: Record<string, unknown>;
  status: ProductStatus;
  featured: boolean;
  sortOrder: number;
  metaTitle?: string | null;
  metaDescription?: string | null;
  variations: VariationAdminDto[];
  publishedAt?: string | null;
  createdAt: string;
  createdBy?: UUID | null;
  updatedAt: string;
  updatedBy?: UUID | null;
  deletedAt?: string | null;
}

export interface CreateProductRequest {
  categoryId: UUID;
  sku: string;
  slug: string;
  name: string;
  brand?: string | null;
  shortDescription?: string | null;
  longDescription?: string | null;
  dimensions?: Record<string, unknown> | null;
  materials?: string[] | null;
  specs?: Record<string, unknown> | null;
  status?: ProductStatus | null;
  featured?: boolean | null;
  sortOrder?: number | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {}
