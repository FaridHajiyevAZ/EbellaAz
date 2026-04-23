import { Card, CardBody, CardHeader, CardSubtitle, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';
import { useAuth } from '@/hooks/useAuth';

export function DashboardPage() {
  const { admin } = useAuth();

  return (
    <div>
      <PageHeader
        eyebrow="Overview"
        title={admin ? `Welcome back, ${admin.fullName.split(' ')[0]}.` : 'Welcome.'}
        description="Here's what's happening in your catalog today."
      />

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: 'Products',   value: '—' },
          { label: 'Categories', value: '—' },
          { label: 'Variations', value: '—' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardBody>
              <div className="text-xs uppercase tracking-wide text-muted">{stat.label}</div>
              <div className="mt-1 font-display text-display text-fg">{stat.value}</div>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Getting started</CardTitle>
          <CardSubtitle>Tasks to complete after a fresh install.</CardSubtitle>
        </CardHeader>
        <CardBody className="space-y-3 text-sm">
          <Step done label="Create your admin account" />
          <Step label="Add your root categories" />
          <Step label="Create your first product" />
          <Step label="Upload variation images" />
          <Step label="Configure contact & WhatsApp number" />
        </CardBody>
      </Card>
    </div>
  );
}

function Step({ label, done }: { label: string; done?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
      <span className={done ? 'text-muted line-through' : 'text-fg'}>{label}</span>
      {done ? <Badge tone="success">Done</Badge> : <Badge>Pending</Badge>}
    </div>
  );
}
