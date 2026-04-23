import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Modal } from '@/components/ui/Modal';
import { Field } from '@/components/ui/Input';
import { DataTable, Column } from '@/components/admin/DataTable';
import { ParentCategorySelect } from '@/components/admin/ParentCategorySelect';
import { useAdminCategoryList, useDeleteCategory } from '@/hooks/useAdminCategories';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/components/ui/Toast';
import { AppApiError } from '@/api/client';
import type { CategoryAdminDto, ContentStatus, UUID } from '@/types/api';
import { formatDate } from '@/utils/format';
import { cn } from '@/utils/cn';

const PAGE_SIZE = 25;

const STATUS_OPTIONS: Array<{ value: '' | ContentStatus; label: string }> = [
  { value: '',          label: 'All statuses' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'DRAFT',     label: 'Draft' },
  { value: 'ARCHIVED',  label: 'Archived' },
];

export function CategoriesPage() {
  const navigate = useNavigate();
  const toast = useToast();

  // --- Filter state ---
  const [searchInput, setSearchInput] = useState('');
  const q = useDebounce(searchInput, 300);
  const [status, setStatus] = useState<'' | ContentStatus>('');
  const [onlyRoots, setOnlyRoots] = useState(false);
  const [page, setPage] = useState(0);

  const params = useMemo(
    () => ({
      q: q || undefined,
      status: (status || undefined) as ContentStatus | undefined,
      onlyRoots: onlyRoots || undefined,
      page,
      size: PAGE_SIZE,
      sort: 'sortOrder,asc',
    }),
    [q, status, onlyRoots, page],
  );

  const list = useAdminCategoryList(params);
  const deleteMutation = useDeleteCategory();

  // --- Delete flow state ---
  const [toDelete, setToDelete] = useState<CategoryAdminDto | null>(null);
  const [reassignFor, setReassignFor] = useState<CategoryAdminDto | null>(null);
  const [reassignTo, setReassignTo] = useState<UUID | null>(null);

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteMutation.mutateAsync({ id: toDelete.id });
      toast.success(`${toDelete.name} deleted`);
      setToDelete(null);
    } catch (err) {
      if (err instanceof AppApiError && err.status === 409 && /reassign/i.test(err.message)) {
        // Products are still attached — collect a reassignment target.
        setReassignFor(toDelete);
        setToDelete(null);
        return;
      }
      toast.error(err instanceof AppApiError ? err.message : 'Could not delete category');
      setToDelete(null);
    }
  };

  const confirmReassignAndDelete = async () => {
    if (!reassignFor || !reassignTo) return;
    try {
      await deleteMutation.mutateAsync({ id: reassignFor.id, reassignTo });
      toast.success(`${reassignFor.name} deleted; products reassigned`);
      setReassignFor(null);
      setReassignTo(null);
    } catch (err) {
      toast.error(err instanceof AppApiError ? err.message : 'Could not reassign products');
    }
  };

  // --- Table columns ---
  const columns: Column<CategoryAdminDto>[] = [
    {
      header: 'Name',
      cell: (c) => (
        <Link to={`/admin/categories/${c.id}`} className="flex items-center gap-2 text-fg hover:text-accent">
          <span aria-hidden className="text-subtle">
            {'— '.repeat(c.depth)}
          </span>
          {c.name}
        </Link>
      ),
    },
    { header: 'Slug',   cell: (c) => <span className="text-muted">{c.slug}</span>, width: '200px' },
    { header: 'Sort',   cell: (c) => <span className="text-muted">{c.sortOrder}</span>, width: '80px', align: 'right' },
    {
      header: 'Status',
      cell: (c) => (
        <Badge tone={c.status === 'PUBLISHED' ? 'success' : c.status === 'ARCHIVED' ? 'neutral' : 'warning'}>
          {c.status}
        </Badge>
      ),
      width: '120px',
    },
    {
      header: 'Updated',
      cell: (c) => <span className="text-muted">{formatDate(c.updatedAt)}</span>,
      width: '140px',
    },
    {
      header: '',
      cell: (c) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Edit ${c.name}`}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/categories/${c.id}`);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Delete ${c.name}`}
            onClick={(e) => {
              e.stopPropagation();
              setToDelete(c);
            }}
          >
            <Trash2 className="h-4 w-4 text-danger" />
          </Button>
        </div>
      ),
      width: '100px',
      align: 'right',
    },
  ];

  return (
    <div>
      <PageHeader
        title="Categories"
        description="Manage the catalog tree, including parents and subcategories."
        actions={
          <Button onClick={() => navigate('/admin/categories/new')}>
            <Plus className="h-4 w-4" />
            New category
          </Button>
        }
      />

      {/* Filter row */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search by name or slug…"
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            setPage(0);
          }}
          className="max-w-xs"
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as ContentStatus | '');
            setPage(0);
          }}
          className="h-10 rounded-md border border-border bg-surface px-3 text-sm text-fg focus-ring"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <label className={cn(
          'inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors',
          onlyRoots ? 'border-fg bg-fg text-bg' : 'border-border text-muted hover:border-fg hover:text-fg',
        )}>
          <input
            type="checkbox"
            className="sr-only"
            checked={onlyRoots}
            onChange={(e) => {
              setOnlyRoots(e.target.checked);
              setPage(0);
            }}
          />
          Root categories only
        </label>
      </div>

      <DataTable
        data={list.data?.items}
        rowKey={(c) => c.id}
        columns={columns}
        isLoading={list.isLoading}
        isError={list.isError}
        onRetry={() => list.refetch()}
        empty={
          <EmptyState
            title="Your category tree is empty"
            description="Add your first root category (e.g. Mattresses) to get started."
            action={
              <Button onClick={() => navigate('/admin/categories/new')}>
                <Plus className="h-4 w-4" /> Add category
              </Button>
            }
          />
        }
      />

      {list.data && list.data.totalPages > 1 && (
        <Pagination
          className="mt-6"
          page={page + 1}
          totalPages={list.data.totalPages}
          onChange={(p) => setPage(p - 1)}
        />
      )}

      {/* Delete confirm */}
      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        title={toDelete ? `Delete "${toDelete.name}"?` : 'Delete category'}
        description="This cannot be undone. Products attached to this category must be reassigned first."
        confirmLabel="Delete"
        tone="danger"
        loading={deleteMutation.isPending}
      />

      {/* Reassign modal — raised when delete returns 409 mentioning reassignTo */}
      <Modal
        open={Boolean(reassignFor)}
        onClose={() => {
          setReassignFor(null);
          setReassignTo(null);
        }}
        title="Reassign products before deleting"
        description={
          reassignFor
            ? `"${reassignFor.name}" still has products. Pick a category to move them to, then delete.`
            : undefined
        }
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setReassignFor(null);
                setReassignTo(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              disabled={!reassignTo}
              loading={deleteMutation.isPending}
              onClick={confirmReassignAndDelete}
            >
              Reassign & delete
            </Button>
          </>
        }
      >
        <Field label="Reassign products to">
          <ParentCategorySelect
            value={reassignTo}
            onChange={setReassignTo}
            excludeId={reassignFor?.id}
            placeholder="Pick a destination category…"
          />
        </Field>
      </Modal>
    </div>
  );
}
