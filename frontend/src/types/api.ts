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
