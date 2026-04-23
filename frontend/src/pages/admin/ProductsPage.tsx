import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';

export function ProductsPage() {
  const products: Array<{ id: string; sku: string; name: string; category: string; status: 'DRAFT' | 'PUBLISHED'; updatedAt: string }> = [];

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-heading text-fg">Products</h1>
          <p className="text-sm text-muted">Manage your catalog.</p>
        </div>
        <Button><Plus className="h-4 w-4" /> New product</Button>
      </header>

      <div className="flex gap-2">
        <Input placeholder="Search by name, SKU, or slug…" className="max-w-sm" />
      </div>

      {products.length === 0 ? (
        <EmptyState
          title="No products yet"
          description="Create your first product to start filling the catalog."
        />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Name</TH>
              <TH>SKU</TH>
              <TH>Category</TH>
              <TH>Status</TH>
              <TH className="text-right">Updated</TH>
            </TR>
          </THead>
          <TBody>
            {products.map((p) => (
              <TR key={p.id}>
                <TD><Link to={`/admin/products/${p.id}`} className="text-fg hover:text-accent">{p.name}</Link></TD>
                <TD className="text-muted">{p.sku}</TD>
                <TD className="text-muted">{p.category}</TD>
                <TD>
                  <Badge tone={p.status === 'PUBLISHED' ? 'success' : 'neutral'}>{p.status}</Badge>
                </TD>
                <TD className="text-right text-muted">{p.updatedAt}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
}
