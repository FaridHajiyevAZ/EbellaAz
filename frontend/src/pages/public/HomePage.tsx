import { ErrorState } from '@/components/ui/ErrorState';
import { HeroSlider }         from '@/features/home/HeroSlider';
import { FeaturedCategories } from '@/features/home/FeaturedCategories';
import { FeaturedProducts }   from '@/features/home/FeaturedProducts';
import { HomeSections }       from '@/features/home/HomeSections';
import {
  useCategoryTree,
  useHomePayload,
  useProductList,
} from '@/hooks/useCatalog';

/**
 * Homepage composition:
 *  1. Hero slider              (from /public/home)
 *  2. Featured categories      (from /public/categories)
 *  3. Editable content blocks  (from /public/home.sections — text / promo / cta / ...)
 *  4. Featured products grid   (from /public/products?featured=true)
 *
 * Each feature component owns its own loading + empty + error presentation so
 * the page reads linearly.
 */
export function HomePage() {
  const home       = useHomePayload();
  const tree       = useCategoryTree();
  const featured   = useProductList({ featured: true, size: 8, sort: 'publishedAt,desc' });

  if (home.isError) {
    return (
      <div className="py-20">
        <ErrorState onRetry={() => home.refetch()} />
      </div>
    );
  }

  return (
    <>
      <HeroSlider slides={home.data?.heroSlides} isLoading={home.isLoading} />

      <FeaturedCategories
        categories={tree.data}
        isLoading={tree.isLoading}
      />

      <HomeSections
        sections={home.data?.sections}
        isLoading={home.isLoading}
        categories={tree.data}
        featuredProducts={featured.data?.items}
      />

      <FeaturedProducts
        products={featured.data?.items}
        isLoading={featured.isLoading}
        moreHref="/category/home-furniture"
        moreLabel="Browse all"
      />
    </>
  );
}
