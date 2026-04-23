import { Link } from 'react-router-dom';
import { Palette } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';

export function VariationsPage() {
  return (
    <div>
      <PageHeader
        title="Variations"
        description="Colors, SKUs, and galleries are managed inside each product."
      />

      <EmptyState
        icon={<Palette className="h-5 w-5 text-muted" />}
        title="Pick a product to edit its variations"
        description="Variations are always tied to a product's lifecycle — pricing, images, and stock all live inside the product editor."
        action={
          <Button asChild={false}>
            <Link to="/admin/products">Browse products</Link>
          </Button>
        }
      />
    </div>
  );
}
