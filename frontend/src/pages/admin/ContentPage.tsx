import { Card, CardBody, CardHeader, CardSubtitle, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const TABS = [
  { key: 'hero',     label: 'Hero slides',      count: 0 },
  { key: 'sections', label: 'Homepage sections', count: 0 },
  { key: 'contact',  label: 'Contact info',      count: 0 },
];

export function ContentPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-heading text-fg">Content</h1>
        <p className="text-sm text-muted">Editable static content for the public site.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {TABS.map((t) => (
          <Card key={t.key}>
            <CardHeader>
              <CardTitle>{t.label}</CardTitle>
              <CardSubtitle>Section editor coming up next.</CardSubtitle>
            </CardHeader>
            <CardBody>
              <Badge>{t.count} items</Badge>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
