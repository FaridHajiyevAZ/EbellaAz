import { useState } from 'react';
import { ImageOff, Pencil, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { DataTable, Column } from '@/components/admin/DataTable';
import { HeroSlideFormModal } from '@/features/admin/cms/HeroSlideFormModal';
import { useAdminHeroSlides, useDeleteHeroSlide } from '@/hooks/useAdminCms';
import { useToast } from '@/components/ui/Toast';
import { AppApiError } from '@/api/client';
import type { HeroSlideAdminDto } from '@/types/api';
import { formatDate } from '@/utils/format';

export function HeroSlidesPage() {
  const toast = useToast();
  const { data, isLoading, isError, refetch } = useAdminHeroSlides();
  const deleteMutation = useDeleteHeroSlide();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<HeroSlideAdminDto | null>(null);
  const [toDelete, setToDelete] = useState<HeroSlideAdminDto | null>(null);

  const openNew = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (s: HeroSlideAdminDto) => {
    setEditing(s);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteMutation.mutateAsync(toDelete.id);
      toast.success(`"${toDelete.title}" deleted`);
    } catch (err) {
      toast.error(err instanceof AppApiError ? err.message : 'Could not delete slide');
    } finally {
      setToDelete(null);
    }
  };

  const columns: Column<HeroSlideAdminDto>[] = [
    {
      header: '',
      cell: (s) => (
        <div className="h-12 w-20 overflow-hidden rounded-sm bg-bg-alt">
          {s.imageUrl ? (
            <img src={s.imageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full place-items-center text-subtle">
              <ImageOff className="h-4 w-4" />
            </div>
          )}
        </div>
      ),
      width: '96px',
    },
    {
      header: 'Title',
      cell: (s) => (
        <button
          type="button"
          onClick={() => openEdit(s)}
          className="block truncate text-left text-fg hover:text-accent"
        >
          {s.title}
        </button>
      ),
    },
    {
      header: 'CTA',
      cell: (s) =>
        s.ctaUrl ? (
          <span className="truncate text-xs text-muted">
            {s.ctaText ? `${s.ctaText} → ` : ''}{s.ctaUrl}
          </span>
        ) : (
          <span className="text-xs text-subtle">—</span>
        ),
      width: '260px',
    },
    { header: 'Sort',   cell: (s) => <span className="text-muted">{s.sortOrder}</span>, width: '64px', align: 'right' },
    {
      header: 'Status',
      cell: (s) => (
        <Badge tone={s.status === 'PUBLISHED' ? 'success' : s.status === 'ARCHIVED' ? 'neutral' : 'warning'}>
          {s.status}
        </Badge>
      ),
      width: '110px',
    },
    {
      header: 'Updated',
      cell: (s) => <span className="text-muted">{formatDate(s.updatedAt)}</span>,
      width: '120px',
    },
    {
      header: '',
      cell: (s) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Edit ${s.title}`}
            onClick={() => openEdit(s)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Delete ${s.title}`}
            onClick={() => setToDelete(s)}
          >
            <Trash2 className="h-4 w-4 text-danger" />
          </Button>
        </div>
      ),
      width: '96px',
      align: 'right',
    },
  ];

  return (
    <div>
      <PageHeader
        title="Hero Slides"
        description="Slides shown in the homepage hero, in the order you set."
        actions={
          <Button onClick={openNew}>
            <Plus className="h-4 w-4" /> New slide
          </Button>
        }
      />

      <DataTable
        data={data}
        rowKey={(s) => s.id}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        empty={
          <EmptyState
            title="No hero slides yet"
            description="Add a slide to feature on the homepage."
            action={
              <Button onClick={openNew}>
                <Plus className="h-4 w-4" /> Add slide
              </Button>
            }
          />
        }
      />

      <HeroSlideFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        existing={editing}
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        title={toDelete ? `Delete "${toDelete.title}"?` : 'Delete slide'}
        description="The slide will stop appearing on the homepage immediately."
        confirmLabel="Delete"
        tone="danger"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
