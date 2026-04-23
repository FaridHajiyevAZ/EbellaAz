import { useMemo, useState } from 'react';
import { ImageOff, Pencil, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { HomeSectionFormModal } from '@/features/admin/cms/HomeSectionFormModal';
import { useAdminHomeSections, useDeleteHomeSection } from '@/hooks/useAdminCms';
import { useToast } from '@/components/ui/Toast';
import { AppApiError } from '@/api/client';
import type { HomeSectionAdminDto } from '@/types/api';
import { formatDate } from '@/utils/format';

const TYPE_LABEL: Record<string, string> = {
  FEATURED_CATEGORIES: 'Featured categories',
  FEATURED_PRODUCTS:   'Featured products',
  PROMO_BANNER:        'Promo banner',
  TEXT_BLOCK:          'Text block',
  CTA_STRIP:           'CTA strip',
  IMAGE_GRID:          'Image grid',
  HERO_BANNER:         'Hero banner',
};

export function HomepageContentPage() {
  const toast = useToast();
  const { data, isLoading, isError, refetch } = useAdminHomeSections();
  const deleteMutation = useDeleteHomeSection();

  const sorted = useMemo(
    () => (data ? [...data].sort((a, b) => a.sortOrder - b.sortOrder) : []),
    [data],
  );

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<HomeSectionAdminDto | null>(null);
  const [toDelete, setToDelete] = useState<HomeSectionAdminDto | null>(null);

  const openNew = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (s: HomeSectionAdminDto) => {
    setEditing(s);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteMutation.mutateAsync(toDelete.id);
      toast.success('Section deleted');
    } catch (err) {
      toast.error(err instanceof AppApiError ? err.message : 'Could not delete section');
    } finally {
      setToDelete(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Homepage Content"
        description="Editable blocks shown on the public homepage. Ordered by sort order."
        actions={
          <Button onClick={openNew}>
            <Plus className="h-4 w-4" /> New section
          </Button>
        }
      />

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48" />)}
        </div>
      ) : sorted.length === 0 ? (
        <EmptyState
          title="No sections yet"
          description="Compose your homepage with featured categories, promo banners, text blocks, and more."
          action={<Button onClick={openNew}><Plus className="h-4 w-4" /> Add section</Button>}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sorted.map((s) => (
            <SectionCard
              key={s.id}
              section={s}
              onEdit={() => openEdit(s)}
              onDelete={() => setToDelete(s)}
            />
          ))}
        </div>
      )}

      <HomeSectionFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        existing={editing}
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete section?"
        description="The section will stop appearing on the homepage immediately."
        confirmLabel="Delete"
        tone="danger"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

function SectionCard({
  section,
  onEdit,
  onDelete,
}: {
  section: HomeSectionAdminDto;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card>
      <CardBody className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <Badge tone="neutral">{TYPE_LABEL[section.sectionType] ?? section.sectionType}</Badge>
          <Badge tone={section.status === 'PUBLISHED' ? 'success' : 'neutral'}>
            {section.status}
          </Badge>
        </div>

        <div>
          <h3 className="font-display text-heading text-fg">
            {section.title ?? <span className="italic text-muted">Untitled</span>}
          </h3>
          {section.subtitle && (
            <p className="mt-0.5 text-sm text-muted">{section.subtitle}</p>
          )}
        </div>

        {(section.imageUrl || section.body) && (
          <div className="grid gap-3">
            {section.imageUrl && (
              <div className="aspect-[16/9] overflow-hidden rounded bg-bg-alt">
                <img src={section.imageUrl} alt="" className="h-full w-full object-cover" />
              </div>
            )}
            {section.body && (
              <p className="line-clamp-3 text-xs text-muted">{section.body}</p>
            )}
          </div>
        )}

        {!section.imageUrl && !section.body && (
          <div className="flex h-24 items-center justify-center rounded border border-dashed border-border text-xs text-subtle">
            <ImageOff className="mr-1 h-3.5 w-3.5" /> No preview
          </div>
        )}

        <div className="flex items-center justify-between pt-1 text-xs text-muted">
          <span>Sort: {section.sortOrder} · Updated {formatDate(section.updatedAt)}</span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" aria-label="Edit" onClick={onEdit}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Delete" onClick={onDelete}>
              <Trash2 className="h-4 w-4 text-danger" />
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
