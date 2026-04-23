import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { useProductDetail } from '@/hooks/useCatalog';
import { cn } from '@/utils/cn';

export function ProductPage() {
  const { slug } = useParams();
  const { data: product, isLoading, isError, refetch } = useProductDetail(slug);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedVariation = useMemo(() => {
    if (!product) return null;
    const id = selectedId ?? product.defaultVariationId;
    return product.variations.find((v) => v.id === id) ?? product.variations[0] ?? null;
  }, [product, selectedId]);

  if (isLoading) {
    return (
      <Container className="grid gap-10 py-12 md:grid-cols-2 md:py-16">
        <Skeleton className="aspect-square" />
        <div className="space-y-4">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-24 w-full" />
        </div>
      </Container>
    );
  }

  if (isError || !product) {
    return (
      <Container className="py-16">
        <ErrorState onRetry={() => refetch()} />
      </Container>
    );
  }

  const images = selectedVariation?.images ?? [];
  const [hero, ...thumbs] = images;

  return (
    <Container className="py-10 md:py-14">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-2">
          <li><Link to="/" className="hover:text-fg">Home</Link></li>
          {product.breadcrumbs.map((b) => (
            <li key={b.id} className="flex items-center gap-2">
              <span className="text-subtle">/</span>
              <Link to={`/category${b.fullPath}`} className="hover:text-fg">{b.name}</Link>
            </li>
          ))}
        </ol>
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="aspect-square overflow-hidden rounded-lg bg-bg-alt">
            {hero ? (
              <img
                src={hero.url}
                srcSet={Object.values(hero.renditions ?? {}).join(', ')}
                alt={hero.altText ?? product.name}
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>
          {thumbs.length > 0 && (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {[hero, ...thumbs].filter(Boolean).map((img) => (
                <div key={img.id} className="aspect-square overflow-hidden rounded bg-bg-alt">
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          {product.brand && <span className="text-eyebrow uppercase text-subtle">{product.brand}</span>}
          <h1 className="mt-2 font-display text-display text-fg">{product.name}</h1>

          {product.shortDescription && (
            <p className="mt-4 max-w-prose text-muted">{product.shortDescription}</p>
          )}

          {/* Color swatches */}
          {product.variations.length > 0 && (
            <div className="mt-8">
              <div className="mb-2 flex items-baseline justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-muted">Color</span>
                <span className="text-sm text-fg">{selectedVariation?.colorName}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.variations.map((v) => {
                  const active = v.id === selectedVariation?.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedId(v.id)}
                      aria-pressed={active}
                      aria-label={v.colorName}
                      className={cn(
                        'focus-ring relative h-9 w-9 rounded-full border transition-transform',
                        active ? 'border-fg ring-2 ring-fg ring-offset-2 ring-offset-bg' : 'border-border hover:scale-105',
                      )}
                      style={{ backgroundColor: v.colorHex }}
                    />
                  );
                })}
              </div>
              {selectedVariation?.stockStatusText && (
                <Badge tone="success" className="mt-3">{selectedVariation.stockStatusText}</Badge>
              )}
            </div>
          )}

          {/* WhatsApp CTA */}
          {product.whatsappInquiry?.url && (
            <div className="mt-8">
              <Button variant="accent" size="lg" asChild={false}>
                <a href={product.whatsappInquiry.url} target="_blank" rel="noreferrer">
                  Inquire on WhatsApp <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <p className="mt-2 text-xs text-muted">
                Opens WhatsApp with a pre-filled message about this product.
              </p>
            </div>
          )}

          {/* Long description */}
          {product.longDescription && (
            <div className="mt-10 border-t border-border pt-8">
              <h2 className="font-display text-heading text-fg">Details</h2>
              <p className="mt-3 whitespace-pre-line text-muted">{product.longDescription}</p>
            </div>
          )}

          {/* Dimensions / materials */}
          {(product.materials?.length || product.dimensions) && (
            <dl className="mt-8 grid grid-cols-2 gap-4 text-sm">
              {product.dimensions && (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted">Dimensions</dt>
                  <dd className="mt-1 text-fg">
                    {Object.entries(product.dimensions).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                  </dd>
                </div>
              )}
              {product.materials?.length ? (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted">Materials</dt>
                  <dd className="mt-1 text-fg">{product.materials.join(', ')}</dd>
                </div>
              ) : null}
            </dl>
          )}
        </div>
      </div>
    </Container>
  );
}
