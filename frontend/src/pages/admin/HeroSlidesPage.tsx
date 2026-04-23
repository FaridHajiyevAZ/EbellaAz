import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

export function HeroSlidesPage() {
  return (
    <div>
      <PageHeader
        title="Hero Slides"
        description="Slides shown in the homepage hero. Reorder by dragging."
        actions={
          <Button>
            <Plus className="h-4 w-4" />
            New slide
          </Button>
        }
      />

      <EmptyState
        title="No hero slides yet"
        description="Add a slide to feature on the homepage."
        action={
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4" /> Add slide
          </Button>
        }
      />
    </div>
  );
}
