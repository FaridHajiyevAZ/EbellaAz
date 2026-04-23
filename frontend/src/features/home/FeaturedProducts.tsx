import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { ProductCard as ProductCardDto } from '@/types/api';
import { Container } from '@/components/ui/Container';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProductCard } from '@/features/catalog/ProductCard';

interface Props {
  title?: string;
  subtitle?: string;
  products: ProductCardDto[] | undefined;
  isLoading?: boolean;
  moreHref?: string;
  moreLabel?: string;
}

export function FeaturedProducts({
  title = 'New arrivals',
  subtitle = 'Fresh additions to the catalog',
  products,
  isLoading,
  moreHref,
  moreLabel = 'View all',
}: Props) {
  return (
    <section className="bg-bg-alt/60 py-20 md:py-28">
      <Container>
        <header className="mb-10 flex flex-wrap items-end justify-between gap-4 md:mb-14">
          <div>
            <span className="text-eyebrow uppercase text-subtle">Featured</span>
            <h2 className="mt-2 font-display text-display text-balance text-fg">{title}</h2>
            {subtitle && <p className="mt-2 max-w-prose text-muted">{subtitle}</p>}
          </div>
          {moreHref && (
            <Link
              to={moreHref}
              className="group inline-flex items-center gap-2 text-sm text-fg hover:text-accent"
            >
              {moreLabel}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </header>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5]" />
            ))}
          </div>
        ) : !products || products.length === 0 ? (
          <EmptyState
            title="No featured products yet"
            description="Mark products as featured in the admin panel to show them here."
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.slice(0, 8).map((p, i) => (
              <ProductCard key={p.id} product={p} priority={i < 4} />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
