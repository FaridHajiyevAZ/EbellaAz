import { Phone, Mail, MapPin } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { useContact } from '@/hooks/useCatalog';
import { useSeo } from '@/hooks/useSeo';

export function ContactPage() {
  useSeo({
    title: 'Contact',
    description: 'Visit our Baku showroom or get in touch by phone, email, or WhatsApp.',
  });

  const { data, isLoading, isError, refetch } = useContact();

  return (
    <Container className="max-w-4xl py-16 md:py-24">
      <span className="text-eyebrow uppercase text-subtle">Get in touch</span>
      <h1 className="mt-3 font-display text-display text-fg">Visit our showroom.</h1>

      <div className="mt-10 grid gap-10 md:grid-cols-2">
        <div className="space-y-5 text-sm">
          {isLoading && (
            <>
              <Skeleton className="h-5 w-64" />
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-5 w-56" />
            </>
          )}
          {isError && <ErrorState onRetry={() => refetch()} />}
          {data && (
            <>
              {data.phone && (
                <a className="flex items-center gap-3 text-fg hover:text-accent focus-ring rounded" href={`tel:${data.phone}`}>
                  <Phone className="h-4 w-4" aria-hidden /> {data.phone}
                </a>
              )}
              {data.email && (
                <a className="flex items-center gap-3 text-fg hover:text-accent focus-ring rounded" href={`mailto:${data.email}`}>
                  <Mail className="h-4 w-4" aria-hidden /> {data.email}
                </a>
              )}
              {data.addressLines?.length ? (
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-muted" aria-hidden />
                  <address className="not-italic">
                    {data.addressLines.map((l) => <div key={l}>{l}</div>)}
                    {(data.city || data.country) && (
                      <div className="text-muted">
                        {[data.city, data.country].filter(Boolean).join(', ')}
                      </div>
                    )}
                  </address>
                </div>
              ) : null}

              {data.workingHours && (
                <div>
                  <h2 className="text-xs uppercase tracking-wide text-muted">Hours</h2>
                  <ul className="mt-2 space-y-1">
                    {Object.entries(data.workingHours).map(([k, v]) => (
                      <li key={k} className="flex justify-between gap-4">
                        <span className="text-muted">{k.replace('_', '–')}</span>
                        <span className="text-fg">{v}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>

        <div className="aspect-[4/3] overflow-hidden rounded-lg bg-bg-alt">
          {data?.mapUrl ? (
            <iframe
              src={data.mapUrl}
              title="Showroom map"
              className="h-full w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <div className="grid h-full place-items-center text-sm text-muted">Map</div>
          )}
        </div>
      </div>
    </Container>
  );
}
