import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Images as ImagesIcon,
  ImageOff,
  Pencil,
  Plus,
  Star,
  Trash2,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { useAdminProduct } from '@/hooks/useAdminProducts';
import {
  useDeleteVariation,
  useSetDefaultVariation,
} from '@/hooks/useAdminVariations';
import { AppApiError } from '@/api/client';
import type { ProductAdminDetailDto, UUID, VariationAdminDto } from '@/types/api';
import { VariationFormModal } from '@/features/admin/variations/VariationFormModal';
import { VariationImagesModal } from '@/features/admin/variations/VariationImagesModal';
import { cn } from '@/utils/cn';

export function ProductVariationsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const productQuery = useAdminProduct(id as UUID | undefined);

  const sorted = useMemo(
    () =>
      productQuery.data
        ? [...productQuery.data.variations].sort((a, b) => a.sortOrder - b.sortOrder)
        : [],
    [productQuery.data],
  );

  // --- Modal state ---
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing]   = useState<VariationAdminDto | null>(null);
  const [imagesFor, setImagesFor] = useState<VariationAdminDto | null>(null);
  const [toDelete, setToDelete]   = useState<VariationAdminDto | null>(null);

  const deleteMutation = useDeleteVariation(id as UUID);
  const setDefault     = useSetDefaultVariation(id as UUID);

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteMutation.mutateAsync(toDelete.id);
      toast.success(`"${toDelete.colorName}" deleted`);
    } catch (err) {
      toast.error(err instanceof AppApiError ? err.message : 'Could not delete');
    } finally {
      setToDelete(null);
    }
  };

  const promoteDefault = (v: VariationAdminDto) => {
    setDefault
      .mutateAsync(v.id)
      .then(() => toast.success(`"${v.colorName}" is now the default`))
      .catch((err) =>
        toast.error(err instanceof AppApiError ? err.message : 'Could not set default'),
      );
  };

  if (productQuery.isLoading) return <PageSkeleton />;
  if (productQuery.isError)   return <ErrorState onRetry={() => productQuery.refetch()} />;
  if (!productQuery.data) return null;

  const product: ProductAdminDetailDto = productQuery.data;

  const openNew = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (v: VariationAdminDto) => {
    setEditing(v);
    setFormOpen(true);
  };

  // Keep the images modal bound to the latest variation data from cache.
  const liveImagesVariation = imagesFor
    ? product.variations.find((v) => v.id === imagesFor.id) ?? imagesFor
    : null;

  return (
    <div>
      <PageHeader
        eyebrow={product.categoryName}
        title={`${product.name} — variations`}
        description="One variation per color option. Each variation owns its own gallery."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/admin/products/${product.id}`)}
            >
              <ArrowLeft className="h-4 w-4" /> Back to product
            </Button>
            <Button onClick={openNew}>
              <Plus className="h-4 w-4" /> New variation
            </Button>
          </div>
        }
      />

      {sorted.length === 0 ? (
        <EmptyState
          title="No variations yet"
          description="Add your first color variation so customers can pick one on the product page."
          action={
            <Button onClick={openNew}>
              <Plus className="h-4 w-4" /> Add variation
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sorted.map((v) => (
            <VariationCard
              key={v.id}
              variation={v}
              onEdit={() => openEdit(v)}
              onImages={() => setImagesFor(v)}
              onDelete={() => setToDelete(v)}
              onSetDefault={() => promoteDefault(v)}
              settingDefault={setDefault.isPending}
            />
          ))}
        </div>
      )}

      {/* Variation create/edit modal */}
      <VariationFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        productId={product.id}
        existing={editing}
      />

      {/* Images modal */}
      {liveImagesVariation && (
        <VariationImagesModal
          open={Boolean(imagesFor)}
          onClose={() => setImagesFor(null)}
          productId={product.id}
          variation={liveImagesVariation}
        />
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        title={toDelete ? `Delete "${toDelete.colorName}"?` : 'Delete variation'}
        description="This removes the variation and its images. If it was the default, the next active variation is promoted automatically."
        confirmLabel="Delete"
        tone="danger"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

/* --------------------------- Variation card --------------------------- */

interface CardProps {
  variation: VariationAdminDto;
  onEdit: () => void;
  onImages: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
  settingDefault: boolean;
}

function VariationCard({
  variation: v,
  onEdit,
  onImages,
  onDelete,
  onSetDefault,
  settingDefault,
}: CardProps) {
  const cover = v.images.find((i) => i.id === v.primaryImageId) ?? v.images[0];

  return (
    <Card>
      <CardBody className="space-y-4">
        <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-bg-alt">
          {cover ? (
            <img src={cover.url} alt="" className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <div className="grid h-full place-items-center text-subtle">
              <ImageOff className="h-6 w-6" />
            </div>
          )}
          {v.isDefault && (
            <Badge tone="accent" className="absolute left-2 top-2">
              <Star className="h-3 w-3" /> Default
            </Badge>
          )}
        </div>

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className="h-4 w-4 shrink-0 rounded-full border border-border"
                style={{ backgroundColor: v.colorHex }}
                aria-hidden
              />
              <h3 className="truncate font-medium text-fg">{v.colorName}</h3>
            </div>
            <p className="mt-0.5 truncate text-xs text-muted">
              {v.images.length} image{v.images.length === 1 ? '' : 's'} · {v.stockStatusText}
              {v.variationSku ? ` · ${v.variationSku}` : ''}
            </p>
          </div>
          <Badge tone={v.status === 'ACTIVE' ? 'success' : 'neutral'}>{v.status}</Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={onImages}>
            <ImagesIcon className="h-4 w-4" /> Images
          </Button>
          <Button variant="ghost" size="icon" aria-label="Edit" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Delete" onClick={onDelete}>
            <Trash2 className="h-4 w-4 text-danger" />
          </Button>
        </div>

        {!v.isDefault && (
          <button
            type="button"
            onClick={onSetDefault}
            disabled={settingDefault}
            className={cn(
              'focus-ring w-full rounded border border-dashed border-border py-2 text-xs text-muted transition-colors',
              'hover:border-fg hover:text-fg',
              settingDefault && 'pointer-events-none opacity-60',
            )}
          >
            Set as default
          </button>
        )}
      </CardBody>
    </Card>
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-64" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
    </div>
  );
}
