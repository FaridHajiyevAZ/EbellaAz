import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardSubtitle, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const BLOCK_TYPES = [
  { key: 'FEATURED_CATEGORIES', label: 'Featured categories' },
  { key: 'FEATURED_PRODUCTS',   label: 'Featured products' },
  { key: 'PROMO_BANNER',        label: 'Promo banner' },
  { key: 'TEXT_BLOCK',          label: 'Text block' },
  { key: 'CTA_STRIP',           label: 'CTA strip' },
];

export function HomepageContentPage() {
  return (
    <div>
      <PageHeader
        title="Homepage Content"
        description="Editable blocks that appear on the public homepage in order."
        actions={
          <Button>
            <Plus className="h-4 w-4" /> New section
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {BLOCK_TYPES.map((b) => (
          <Card key={b.key}>
            <CardBody>
              <Badge tone="neutral" className="mb-3">{b.key}</Badge>
              <CardTitle>{b.label}</CardTitle>
              <CardSubtitle>Block editor lands in the next milestone.</CardSubtitle>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
