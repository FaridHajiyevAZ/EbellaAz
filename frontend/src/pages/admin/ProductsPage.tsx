import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ImageOff, Pencil, Plus, Sparkles, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { DataTable, Column } from '@/components/admin/DataTable';
import { ParentCategorySelect } from '@/components/admin/ParentCategorySelect';
import { useAdminProductList, useDeleteProduct } from '@/hooks/useAdminProducts';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/components/ui/Toast';
import { AppApiError } from '@/api/client';
import type { ProductAdminListItemDto, ProductStatus, UUID } from '@/types/api';
import { formatDate } from '@/utils/format';
import { cn } from '@/utils/cn';

const PAGE_SIZE = 25;

const STATUS_OPTIONS: Array<{ value: '' | ProductStatus; label: string }> = [
  { value: '',             label: 'All statuses' },
  { value: 'PUBLISHED',    label: 'Published' },
  { value: 'DRAFT',        label: 'Draft' },
  { value: 'OUT_OF_STOCK', label: 'Out of stock' },
  { value: 'ARCHIVED',     label: 'Archived' },
];

export function ProductsPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [searchInput, setSearchInput] = useState('');
  const q = useDebounce(searchInput, 300);
  const [categoryId, setCategoryId] = useState<UUID | null>(null);
  const [status, setStatus] = useState<'' | ProductStatus>('');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [page, setPage] = useState(0);

  const params = useMemo(
    () => ({
      q: q || undefined,
      categoryId: categoryId || undefined,
      subtree: true,
      status: (status || undefined) as ProductStatus | undefined,
      featured: featuredOnly || undefined,
      page,
      size: PAGE_SIZE,
      sort: 'updatedAt,desc',
    }),
    [q, categoryId, status, featuredOnly, page],
  );

  const list = useAdminProductList(params);
  const deleteMutation = useDeleteProduct();
  const [toDelete, setToDelete] = useState<ProductAdminListItemDto | null>(null);

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteMutation.mutateAsync(toDelete.id);
      toast.success(`"${toDelete.name}" deleted`);
      setToDelete(null);
    } catch (err) {
      toast.error(err instanceof AppApiError ? err.message : 'Could not delete product');
      setToDelete(null);
    }
  };

  const columns: Column<ProductAdminListItemDto>[] = [
    {
      header: '',
      cell: (p) => (
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-sm bg-bg-alt">
          {p.coverImageUrl ? (
            <img src={p.coverImageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <div className="grid h-full place-items-center text-subtle">
              <ImageOff className="h-4 w-4" />
            </div>
          )}
        </div>
      ),
      width: '64px',
    },
    {
      header: 'Name',
      cell: (p) => (
        <div className="min-w-0">
          <Link to={`/admin/products/${p.id}`} className="block truncate text-fg hover:text-accent">
            {p.name}
          </Link>
          <div className="truncate text-xs text-muted">
            {p.brand ? `${p.brand} · ` : ''}
            {p.variationsCount} variation{p.variationsCount === 1 ? '' : 's'}
          </div>
        </div>
      ),
    },
    { header: 'SKU',      cell: (p) => <span className="text-muted">{p.sku}</span>,          width: '140px' },
    { header: 'Category', cell: (p) => <span className="text-muted">{p.categoryName}</span>, width: '180px' },
    {
      header: 'Status',
      cell: (p) => (
        <div className="flex flex-col items-start gap-1">
          <Badge
            tone={
              p.status === 'PUBLISHED'    ? 'success' :
              p.status === 'OUT_OF_STOCK' ? 'warning' :
              p.status === 'ARCHIVED'     ? 'neutral' :
                                            'warning'
            }
          >
            {p.status}
          </Badge>
          {p.featured && (
            <Badge tone="accent">
              <Sparkles className="h-3 w-3" /> Featured
            </Badge>
          )}
        </div>
      ),
      width: '140px',
    },
    {
      header: 'Updated',
      cell: (p) => <span className="text-muted">{formatDate(p.updatedAt)}</span>,
      width: '120px',
    },
    {
      header: '',
      cell: (p) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Edit ${p.name}`}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/products/${p.id}`);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Delete ${p.name}`}
            onClick={(e) => {
              e.stopPropagation();
              setToDelete(p);
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
        title="Products"
        description="Manage your catalog. Variations and images live inside each product."
        actions={
          <Button onClick={() => navigate('/admin/products/new')}>
            <Plus className="h-4 w-4" /> New product
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search name, SKU, or slug…"
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            setPage(0);
          }}
          className="max-w-xs"
        />
        <div className="min-w-[16rem] max-w-xs flex-1">
          <ParentCategorySelect
            value={categoryId}
            onChange={(id) => {
              setCategoryId(id);
              setPage(0);
            }}
            placeholder="All categories"
          />
        </div>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as ProductStatus | '');
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
          featuredOnly ? 'border-fg bg-fg text-bg' : 'border-border text-muted hover:border-fg hover:text-fg',
        )}>
          <input
            type="checkbox"
            className="sr-only"
            checked={featuredOnly}
            onChange={(e) => {
              setFeaturedOnly(e.target.checked);
              setPage(0);
            }}
          />
          Featured only
        </label>
      </div>

      <DataTable
        data={list.data?.items}
        rowKey={(p) => p.id}
        columns={columns}
        isLoading={list.isLoading}
        isError={list.isError}
        onRetry={() => list.refetch()}
        empty={
          <EmptyState
            title="No products yet"
            description="Create your first product to start filling the catalog."
            action={
              <Button onClick={() => navigate('/admin/products/new')}>
                <Plus className="h-4 w-4" /> Add product
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

      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        title={toDelete ? `Delete "${toDelete.name}"?` : 'Delete product'}
        description="This will soft-delete the product along with its variations and images."
        confirmLabel="Delete"
        tone="danger"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
