import { Link, useParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProductGallery } from '@/features/catalog/ProductGallery';
import { ColorVariationSelector } from '@/features/catalog/ColorVariationSelector';
import { WhatsAppInquiryButton } from '@/features/catalog/WhatsAppInquiryButton';
import { useProductDetail } from '@/hooks/useCatalog';
import { useSelectedVariation } from '@/hooks/useSelectedVariation';
import type { ProductDetail, ProductVariationPublic } from '@/types/api';

export function ProductPage() {
  const { slug } = useParams();
  const { data: product, isLoading, isError, refetch } = useProductDetail(slug);

  const { selected, selectById, images } = useSelectedVariation(product);

  if (isLoading) return <ProductPageSkeleton />;

  if (isError) {
    return (
      <Container className="py-16">
        <ErrorState onRetry={() => refetch()} />
      </Container>
    );
  }

  if (!product) {
    return (
      <Container className="py-20">
        <EmptyState
          title="Product not found"
          description="The product you were looking for may have moved or been removed."
          action={<Link to="/" className="text-accent underline underline-offset-4">Back to home</Link>}
        />
      </Container>
    );
  }

  return (
    <>
      <Container className="py-8 pb-24 md:py-12 md:pb-16">
        <Breadcrumbs product={product} />

        <div className="mt-6 grid gap-10 md:grid-cols-2 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          <ProductGallery
            images={images}
            productName={product.name}
            resetKey={selected?.id}
          />

          <InfoPanel product={product} selected={selected} selectById={selectById} />
        </div>

        <DetailsSection product={product} />
      </Container>

      <StickyMobileCta product={product} selected={selected} />
    </>
  );
}

/* ----------------------------- panels ----------------------------- */

function InfoPanel({
  product,
  selected,
  selectById,
}: {
  product: ProductDetail;
  selected: ProductVariationPublic | null;
  selectById: (id: string) => void;
}) {
  return (
    <section className="flex flex-col">
      {product.brand && (
        <span className="text-[11px] uppercase tracking-[0.18em] text-subtle">
          {product.brand}
        </span>
      )}
      <h1 className="mt-2 font-display text-display text-balance text-fg">
        {product.name}
      </h1>

      {product.shortDescription && (
        <p className="mt-4 max-w-prose text-muted">{product.shortDescription}</p>
      )}

      {/* Meta line: SKU + stock label */}
      <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-muted">
        <span>
          <span className="uppercase tracking-wider text-subtle">SKU</span>{' '}
          <span className="text-fg">{product.sku}</span>
        </span>
        {selected?.stockStatusText && (
          <Badge tone="success">{selected.stockStatusText}</Badge>
        )}
      </div>

      {product.variations.length > 0 && (
        <ColorVariationSelector
          className="mt-8"
          variations={product.variations}
          selectedId={selected?.id ?? null}
          onChange={selectById}
        />
      )}

      {/* Actions */}
      <div className="mt-8 space-y-3">
        <WhatsAppInquiryButton product={product} variation={selected} fullWidth />
        <p className="text-xs text-subtle">
          Availability, delivery, and customisation questions answered same day by our team.
        </p>
      </div>
    </section>
  );
}

function DetailsSection({ product }: { product: ProductDetail }) {
  const hasDimensions = product.dimensions && Object.keys(product.dimensions).length > 0;
  const hasMaterials  = product.materials.length > 0;
  const hasSpecs      = Object.keys(product.specs ?? {}).length > 0;

  if (!product.longDescription && !hasDimensions && !hasMaterials && !hasSpecs) return null;

  return (
    <section className="mt-16 grid gap-10 border-t border-border pt-10 md:grid-cols-[1fr_1.4fr]">
      <header>
        <span className="text-eyebrow uppercase text-subtle">Details</span>
        <h2 className="mt-2 font-display text-heading text-fg">Know this piece</h2>
      </header>

      <div className="space-y-10 text-sm">
        {product.longDescription && (
          <p className="whitespace-pre-line text-pretty text-muted">
            {product.longDescription}
          </p>
        )}

        {(hasDimensions || hasMaterials) && (
          <dl className="grid gap-6 sm:grid-cols-2">
            {hasDimensions && (
              <div>
                <dt className="text-[11px] uppercase tracking-[0.14em] text-subtle">Dimensions</dt>
                <dd className="mt-2 text-fg">
                  {Object.entries(product.dimensions ?? {}).map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4 border-b border-border py-1.5 last:border-0">
                      <span className="text-muted">{formatKey(k)}</span>
                      <span className="text-fg">{String(v)}</span>
                    </div>
                  ))}
                </dd>
              </div>
            )}
            {hasMaterials && (
              <div>
                <dt className="text-[11px] uppercase tracking-[0.14em] text-subtle">Materials</dt>
                <dd className="mt-2 text-fg">{product.materials.join(', ')}</dd>
              </div>
            )}
          </dl>
        )}

        {hasSpecs && (
          <div>
            <div className="text-[11px] uppercase tracking-[0.14em] text-subtle">Specifications</div>
            <dl className="mt-2">
              {Object.entries(product.specs).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-border py-2 last:border-0">
                  <dt className="text-muted">{formatKey(k)}</dt>
                  <dd className="text-fg">{String(v)}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>
    </section>
  );
}

/* ------------------------ sticky mobile bar ----------------------- */

function StickyMobileCta({
  product,
  selected,
}: {
  product: ProductDetail;
  selected: ProductVariationPublic | null;
}) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-bg/95 backdrop-blur md:hidden"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.75rem)' }}
      role="region"
      aria-label="Product inquiry"
    >
      <div className="mx-auto flex max-w-screen-md items-center gap-3 px-4 pt-3">
        <div className="min-w-0 flex-1">
          <div className="text-[10px] uppercase tracking-[0.14em] text-subtle">
            {selected?.colorName ? 'Color' : 'Product'}
          </div>
          <div className="truncate text-sm text-fg">{selected?.colorName ?? product.name}</div>
        </div>
        <WhatsAppInquiryButton
          product={product}
          variation={selected}
          compact
          size="md"
          className="shrink-0"
        />
      </div>
    </div>
  );
}

/* ------------------------------ misc ----------------------------- */

function Breadcrumbs({ product }: { product: ProductDetail }) {
  const parentPath: string[] = [];
  return (
    <nav aria-label="Breadcrumb" className="text-xs text-muted">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link to="/" className="hover:text-fg">Home</Link>
        </li>
        {product.breadcrumbs.map((b) => {
          parentPath.push(b.slug);
          return (
            <li key={b.id} className="flex items-center gap-1.5">
              <ChevronRight className="h-3 w-3 text-subtle" />
              <Link to={`/category/${parentPath.join('/')}`} className="hover:text-fg">
                {b.name}
              </Link>
            </li>
          );
        })}
        <li className="flex items-center gap-1.5">
          <ChevronRight className="h-3 w-3 text-subtle" />
          <span className="text-fg">{product.name}</span>
        </li>
      </ol>
    </nav>
  );
}

function ProductPageSkeleton() {
  return (
    <Container className="py-12">
      <Skeleton className="h-3 w-64" />
      <div className="mt-6 grid gap-10 md:grid-cols-2 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-3">
          <Skeleton className="aspect-square" />
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex gap-3 pt-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-10 rounded-full" />
            ))}
          </div>
          <Skeleton className="h-12 w-full sm:w-48" />
        </div>
      </div>
    </Container>
  );
}

function formatKey(k: string) {
  return k
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase());
}
