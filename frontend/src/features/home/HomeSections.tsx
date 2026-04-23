import type { CategoryTreeNode, HomeSectionPublic, ProductCard } from '@/types/api';
import { FeaturedCategories } from './FeaturedCategories';
import { FeaturedProducts } from './FeaturedProducts';
import { PromoBanner } from './PromoBanner';
import { TextBlock } from './TextBlock';
import { CtaStrip } from './CtaStrip';

interface Props {
  sections: HomeSectionPublic[] | undefined;
  isLoading?: boolean;
  /** Pool of categories the CMS can reference via config.categoryIds. */
  categories?: CategoryTreeNode[];
  /** Pool of featured products the CMS can reference via config.productIds. */
  featuredProducts?: ProductCard[];
}

/**
 * Renders editable homepage sections in the order the CMS returned them.
 * Unknown section types are ignored — the frontend is forward-compatible
 * with future section types added on the backend.
 */
export function HomeSections({ sections, isLoading, categories, featuredProducts }: Props) {
  if (!sections || sections.length === 0) return null;

  return (
    <>
      {sections.map((s) => {
        switch (s.type) {
          case 'FEATURED_CATEGORIES':
            return (
              <FeaturedCategories
                key={s.id}
                title={s.title ?? 'Shop by room'}
                subtitle={s.subtitle ?? undefined}
                categories={pickCategories(categories, s.config?.categoryIds as string[] | undefined)}
                isLoading={isLoading}
                limit={(s.config?.limit as number | undefined) ?? 3}
              />
            );
          case 'FEATURED_PRODUCTS':
            return (
              <FeaturedProducts
                key={s.id}
                title={s.title ?? 'Featured'}
                subtitle={s.subtitle ?? undefined}
                products={pickProducts(featuredProducts, s.config?.productIds as string[] | undefined)}
                isLoading={isLoading}
                moreHref="/category/home-furniture"
              />
            );
          case 'PROMO_BANNER':
            return <PromoBanner key={s.id} section={s} />;
          case 'TEXT_BLOCK':
            return <TextBlock key={s.id} section={s} />;
          case 'CTA_STRIP':
            return <CtaStrip key={s.id} section={s} />;
          // IMAGE_GRID / HERO_BANNER intentionally deferred to a later milestone.
          default:
            return null;
        }
      })}
    </>
  );
}

function pickCategories(pool: CategoryTreeNode[] | undefined, ids: string[] | undefined) {
  if (!pool) return undefined;
  if (!ids || ids.length === 0) return pool;
  const set = new Set(ids);
  return pool.filter((c) => set.has(c.id));
}

function pickProducts(pool: ProductCard[] | undefined, ids: string[] | undefined) {
  if (!pool) return undefined;
  if (!ids || ids.length === 0) return pool;
  const set = new Set(ids);
  return pool.filter((p) => set.has(p.id));
}
