import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ImageOff, Star, Trash2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import {
  useDeleteVariationImage,
  useReorderVariationImages,
  useSetPrimaryVariationImage,
  useUploadVariationImage,
} from '@/hooks/useAdminVariations';
import { AppApiError } from '@/api/client';
import type { ImageAdminDto, UUID, VariationAdminDto } from '@/types/api';
import { cn } from '@/utils/cn';

interface Props {
  open: boolean;
  onClose: () => void;
  productId: UUID;
  variation: VariationAdminDto;
}

interface PendingUpload {
  id: string;           // local id, not persisted
  previewUrl: string;
  name: string;
  status: 'uploading' | 'error';
  error?: string;
}

export function VariationImagesModal({ open, onClose, productId, variation }: Props) {
  const toast = useToast();

  const upload   = useUploadVariationImage(productId);
  const remove   = useDeleteVariationImage(productId);
  const reorder  = useReorderVariationImages(productId);
  const primary  = useSetPrimaryVariationImage(productId);

  const sortedImages = useMemo(
    () => [...variation.images].sort((a, b) => a.sortOrder - b.sortOrder),
    [variation.images],
  );

  const [pending, setPending] = useState<PendingUpload[]>([]);
  const [toDelete, setToDelete] = useState<ImageAdminDto | null>(null);

  // Revoke object URLs when the modal closes or pending set changes.
  useEffect(() => {
    return () => pending.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFiles = async (files: File[]) => {
    // Show local previews immediately so the admin sees progress.
    const items: PendingUpload[] = files.map((f) => ({
      id: `${f.name}-${f.size}-${f.lastModified}-${Math.random()}`,
      previewUrl: URL.createObjectURL(f),
      name: f.name,
      status: 'uploading',
    }));
    setPending((prev) => [...prev, ...items]);

    // Upload sequentially — keeps server writes predictable and avoids
    // bursting the multipart limit. Parallel uploads would work too.
    for (const [i, file] of files.entries()) {
      const ref = items[i]!;
      try {
        await upload.mutateAsync({ variationId: variation.id, file });
        setPending((prev) => {
          const rest = prev.filter((p) => p.id !== ref.id);
          URL.revokeObjectURL(ref.previewUrl);
          return rest;
        });
      } catch (err) {
        const message = err instanceof AppApiError ? err.message : 'Upload failed';
        toast.error(`${ref.name}: ${message}`);
        setPending((prev) =>
          prev.map((p) => (p.id === ref.id ? { ...p, status: 'error', error: message } : p)),
        );
      }
    }
  };

  const move = (imageId: UUID, direction: 'up' | 'down') => {
    const idx = sortedImages.findIndex((i) => i.id === imageId);
    const swapWith = direction === 'up' ? idx - 1 : idx + 1;
    if (idx < 0 || swapWith < 0 || swapWith >= sortedImages.length) return;

    const next = [...sortedImages];
    [next[idx], next[swapWith]] = [next[swapWith]!, next[idx]!];

    reorder
      .mutateAsync({
        variationId: variation.id,
        body: { items: next.map((img, i) => ({ id: img.id, sortOrder: i })) },
      })
      .catch((err) => {
        toast.error(err instanceof AppApiError ? err.message : 'Reorder failed');
      });
  };

  const setPrimary = (imageId: UUID) => {
    if (variation.primaryImageId === imageId) return;
    primary
      .mutateAsync({ variationId: variation.id, imageId })
      .then(() => toast.success('Primary image updated'))
      .catch((err) => toast.error(err instanceof AppApiError ? err.message : 'Could not set primary'));
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await remove.mutateAsync({ variationId: variation.id, imageId: toDelete.id });
      toast.success('Image deleted');
    } catch (err) {
      toast.error(err instanceof AppApiError ? err.message : 'Could not delete image');
    } finally {
      setToDelete(null);
    }
  };

  const imageCount = sortedImages.length + pending.length;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={`${variation.colorName} — images`}
      description="Upload, reorder, and choose the primary image for this color variation."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Done
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <ImageUploader
          onFiles={handleFiles}
          hint="JPG, PNG, or WebP up to 8MB. First upload becomes the primary image automatically."
          disabled={upload.isPending}
        />

        <div className="flex items-baseline justify-between">
          <h3 className="text-sm font-medium text-fg">
            {imageCount} image{imageCount === 1 ? '' : 's'}
          </h3>
          {reorder.isPending && (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted">
              <Spinner /> Saving order…
            </span>
          )}
        </div>

        {imageCount === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-border p-10 text-center text-sm text-muted">
            <ImageOff className="h-5 w-5" />
            No images yet — drop some above to get started.
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {sortedImages.map((img, i) => {
              const isPrimary = img.id === variation.primaryImageId;
              const canUp = i > 0;
              const canDown = i < sortedImages.length - 1;
              return (
                <li
                  key={img.id}
                  className={cn(
                    'group relative overflow-hidden rounded-md border border-border bg-surface',
                    isPrimary && 'ring-2 ring-fg ring-offset-2 ring-offset-bg',
                  )}
                >
                  <div className="aspect-square bg-bg-alt">
                    <img src={img.url} alt={img.altText ?? ''} className="h-full w-full object-cover" />
                  </div>

                  <div className="flex items-center justify-between gap-2 border-t border-border px-2 py-1.5 text-xs">
                    <span className="text-subtle">#{i + 1}</span>
                    {isPrimary ? (
                      <Badge tone="accent">
                        <Star className="h-3 w-3" /> Primary
                      </Badge>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPrimary(img.id)}
                        className="focus-ring rounded text-muted hover:text-fg"
                      >
                        Set primary
                      </button>
                    )}
                  </div>

                  <div className="flex border-t border-border">
                    <IconAction
                      label="Move up"
                      disabled={!canUp || reorder.isPending}
                      onClick={() => move(img.id, 'up')}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </IconAction>
                    <IconAction
                      label="Move down"
                      disabled={!canDown || reorder.isPending}
                      onClick={() => move(img.id, 'down')}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </IconAction>
                    <IconAction label="Delete" onClick={() => setToDelete(img)}>
                      <Trash2 className="h-4 w-4 text-danger" />
                    </IconAction>
                  </div>
                </li>
              );
            })}

            {pending.map((p) => (
              <li
                key={p.id}
                className="relative overflow-hidden rounded-md border border-dashed border-border bg-surface"
              >
                <div className="aspect-square bg-bg-alt">
                  <img src={p.previewUrl} alt="" className="h-full w-full object-cover opacity-70" />
                </div>
                <div className="flex items-center justify-between gap-2 px-2 py-1.5 text-xs">
                  <span className="truncate text-muted">{p.name}</span>
                  {p.status === 'uploading' ? (
                    <span className="inline-flex items-center gap-1 text-subtle">
                      <Spinner /> Uploading
                    </span>
                  ) : (
                    <span className="text-danger">Failed</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete image?"
        description="The file will be removed from storage and the gallery."
        confirmLabel="Delete"
        tone="danger"
        loading={remove.isPending}
      />
    </Modal>
  );
}

function IconAction({
  children,
  label,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        'flex flex-1 items-center justify-center px-2 py-2 text-muted transition-colors hover:bg-bg-alt hover:text-fg',
        disabled && 'pointer-events-none opacity-40',
      )}
    >
      {children}
    </button>
  );
}
