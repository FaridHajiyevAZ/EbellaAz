import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

export function CategoriesPage() {
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-heading text-fg">Categories</h1>
          <p className="text-sm text-muted">Drag to reorder, click to edit.</p>
        </div>
        <Button><Plus className="h-4 w-4" /> New category</Button>
      </header>

      <EmptyState
        title="Your category tree is empty"
        description="Add your first root category (e.g. Mattresses) to get started."
        action={<Button variant="outline" size="sm"><Plus className="h-4 w-4" /> Add category</Button>}
      />
    </div>
  );
}
