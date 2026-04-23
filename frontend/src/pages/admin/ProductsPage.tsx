import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { DataTable, Column } from '@/components/admin/DataTable';
import { formatDate } from '@/utils/format';

interface AdminProductRow {
  id: string;
  sku: string;
  name: string;
  category: string;
  status: 'DRAFT' | 'PUBLISHED' | 'OUT_OF_STOCK' | 'ARCHIVED';
  updatedAt: string;
}

const columns: Column<AdminProductRow>[] = [
  {
    header: 'Name',
    cell: (p) => (
      <Link to={`/admin/products/${p.id}`} className="text-fg hover:text-accent">
        {p.name}
      </Link>
    ),
  },
  { header: 'SKU',      cell: (p) => <span className="text-muted">{p.sku}</span>, width: '160px' },
  { header: 'Category', cell: (p) => <span className="text-muted">{p.category}</span>, width: '200px' },
  {
    header: 'Status',
    cell: (p) => (
      <Badge tone={p.status === 'PUBLISHED' ? 'success' : p.status === 'ARCHIVED' ? 'neutral' : 'warning'}>
        {p.status}
      </Badge>
    ),
    width: '120px',
  },
  {
    header: 'Updated',
    cell: (p) => <span className="text-muted">{formatDate(p.updatedAt)}</span>,
    align: 'right',
    width: '140px',
  },
];

export function ProductsPage() {
  const data: AdminProductRow[] = [];

  return (
    <div>
      <PageHeader
        title="Products"
        description="Manage your catalog."
        actions={
          <Button>
            <Plus className="h-4 w-4" /> New product
          </Button>
        }
      />

      <div className="mb-4 flex gap-2">
        <Input placeholder="Search by name, SKU, or slug…" className="max-w-sm" />
      </div>

      <DataTable
        data={data}
        rowKey={(p) => p.id}
        columns={columns}
        empty={
          <EmptyState
            title="No products yet"
            description="Create your first product to start filling the catalog."
          />
        }
      />
    </div>
  );
}
