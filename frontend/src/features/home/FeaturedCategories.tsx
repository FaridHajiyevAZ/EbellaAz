import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { CategoryTreeNode } from '@/types/api';
import { Container } from '@/components/ui/Container';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

interface Props {
  title?: string;
  subtitle?: string;
  categories: CategoryTreeNode[] | undefined;
  isLoading?: boolean;
  limit?: number;
}

/** Large, editorial category tiles with a restrained caption + arrow affordance. */
export function FeaturedCategories({
  title = 'Shop by room',
  subtitle,
  categories,
  isLoading,
  limit = 3,
}: Props) {
  const items = (categories ?? []).slice(0, limit);

  return (
    <section className="py-20 md:py-28">
      <Container>
        <header className="mb-10 flex items-end justify-between gap-4 md:mb-14">
          <div>
            <span className="text-eyebrow uppercase text-subtle">Collections</span>
            <h2 className="mt-2 font-display text-display text-balance text-fg">{title}</h2>
            {subtitle && <p className="mt-2 max-w-prose text-muted">{subtitle}</p>}
          </div>
        </header>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-3">
            {Array.from({ length: limit }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5]" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            title="No categories to show yet"
            description="Configure your top-level categories from the admin panel."
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {items.map((c, i) => (
              <Link
                key={c.id}
                to={`/category/${c.slug}`}
                className="group focus-ring relative block overflow-hidden rounded-lg bg-bg-alt"
                style={{ aspectRatio: '4 / 5' }}
              >
                {/* Placeholder tint since coverImageUrl isn't in the tree payload today.
                    Admin UI can later upgrade this to real cover images. */}
                <div
                  className="absolute inset-0 transition-transform duration-700 ease-out-smooth group-hover:scale-[1.03]"
                  style={{
                    background: TILE_BG[i % TILE_BG.length],
                  }}
                  aria-hidden
                />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6 text-bg">
                  <div>
                    <span className="text-eyebrow uppercase text-bg/70">Collection</span>
                    <h3 className="mt-1 font-display text-heading text-bg">{c.name}</h3>
                  </div>
                  <ArrowRight className="h-4 w-4 translate-x-0 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}

// Warm neutral gradients — used only when a category has no cover image yet.
const TILE_BG = [
  'linear-gradient(135deg, rgb(79 68 53) 0%, rgb(56 48 38) 100%)',
  'linear-gradient(135deg, rgb(92 82 70) 0%, rgb(64 54 44) 100%)',
  'linear-gradient(135deg, rgb(66 58 49) 0%, rgb(44 37 30) 100%)',
];
