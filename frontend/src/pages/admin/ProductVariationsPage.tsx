import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ImageOff, Plus, Star } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAdminProduct } from '@/hooks/useAdminProducts';
import type { UUID, VariationAdminDto } from '@/types/api';
import { cn } from '@/utils/cn';

/**
 * Variation management hub for a single product. Shows the existing
 * variations with their cover images, default flag, color chip, and image
 * count. The actual variation-editor (add/remove colors, upload images,
 * reorder, set primary) will be a follow-on page in the same route.
 */
export function ProductVariationsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const product = useAdminProduct(id as UUID | undefined);

  if (product.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }
  if (product.isError) return <ErrorState onRetry={() => product.refetch()} />;
  if (!product.data) return null;

  const { id: productId, name, categoryName, variations } = product.data;

  return (
    <div>
      <PageHeader
        eyebrow={categoryName}
        title={`${name} — variations`}
        description="One variation per color option. Each variation owns its own image gallery."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/admin/products/${productId}`)}
            >
              <ArrowLeft className="h-4 w-4" /> Back to product
            </Button>
            <Button>
              <Plus className="h-4 w-4" /> New variation
            </Button>
          </div>
        }
      />

      {variations.length === 0 ? (
        <EmptyState
          title="No variations yet"
          description="Add a color variation so customers have something to pick on the product page."
          action={
            <Button>
              <Plus className="h-4 w-4" /> Add variation
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {variations.map((v) => (
            <VariationCard key={v.id} variation={v} productId={productId} />
          ))}
        </div>
      )}
    </div>
  );
}

function VariationCard({ variation, productId }: { variation: VariationAdminDto; productId: UUID }) {
  const cover =
    variation.images.find((img) => img.id === variation.primaryImageId) ?? variation.images[0];

  return (
    <Card>
      <CardBody className="space-y-4">
        <div className="aspect-[4/3] overflow-hidden rounded-md bg-bg-alt">
          {cover ? (
            <img src={cover.url} alt="" className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <div className="grid h-full place-items-center text-subtle">
              <ImageOff className="h-6 w-6" />
            </div>
          )}
        </div>

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className="h-4 w-4 shrink-0 rounded-full border border-border"
                style={{ backgroundColor: variation.colorHex }}
                aria-hidden
              />
              <h3 className="truncate font-medium text-fg">{variation.colorName}</h3>
              {variation.isDefault && (
                <Badge tone="accent">
                  <Star className="h-3 w-3" /> Default
                </Badge>
              )}
            </div>
            <p className="mt-0.5 text-xs text-muted">
              {variation.images.length} image{variation.images.length === 1 ? '' : 's'} ·{' '}
              {variation.stockStatusText}
            </p>
          </div>
          <Badge tone={variation.status === 'ACTIVE' ? 'success' : 'neutral'}>
            {variation.status}
          </Badge>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild={false} className={cn('flex-1')}>
            <Link to={`/admin/products/${productId}/variations/${variation.id}`}>Edit</Link>
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
