import { Link } from 'react-router-dom';
import { Instagram, Facebook, Youtube, Phone, Mail, MapPin } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Logo } from '@/components/common/Logo';
import { useCategoryTree, useContact, usePublicSettings } from '@/hooks/useCatalog';
import { Skeleton } from '@/components/ui/Skeleton';

export function PublicFooter() {
  const { data: tree } = useCategoryTree();
  const { data: contact, isLoading: contactLoading } = useContact();
  const { data: settings } = usePublicSettings();

  const socials: { Icon: typeof Instagram; href?: unknown; label: string }[] = [
    { Icon: Instagram, href: settings?.['social.instagram'], label: 'Instagram' },
    { Icon: Facebook,  href: settings?.['social.facebook'],  label: 'Facebook' },
    { Icon: Youtube,   href: settings?.['social.youtube'],   label: 'YouTube' },
  ];

  return (
    <footer className="mt-24 border-t border-border bg-bg-alt/60">
      {/* Contact preview strip */}
      <section className="border-b border-border bg-bg">
        <Container className="grid gap-8 py-12 md:grid-cols-3">
          <ContactItem
            icon={<Phone className="h-4 w-4" />}
            label="Call"
            loading={contactLoading}
            value={contact?.phone}
            href={contact?.phone ? `tel:${contact.phone}` : undefined}
          />
          <ContactItem
            icon={<Mail className="h-4 w-4" />}
            label="Email"
            loading={contactLoading}
            value={contact?.email}
            href={contact?.email ? `mailto:${contact.email}` : undefined}
          />
          <ContactItem
            icon={<MapPin className="h-4 w-4" />}
            label="Visit"
            loading={contactLoading}
            value={
              contact?.addressLines?.length
                ? [contact.addressLines[0], contact.city].filter(Boolean).join(', ')
                : undefined
            }
            href={contact?.mapUrl ?? undefined}
          />
        </Container>
      </section>

      <Container className="grid gap-10 py-14 md:grid-cols-4">
        {/* Brand */}
        <div className="md:col-span-1">
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-muted">
            Premium mattresses and furniture, designed to last a lifetime.
          </p>
          <div className="mt-5 flex items-center gap-3">
            {socials.map(({ Icon, href, label }) =>
              typeof href === 'string' && href ? (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="focus-ring rounded-full border border-border p-2 text-muted transition-colors hover:text-fg"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ) : null,
            )}
          </div>
        </div>

        {/* Shop */}
        <div>
          <h4 className="text-eyebrow uppercase text-subtle">Shop</h4>
          <ul className="mt-4 space-y-2 text-sm">
            {(tree ?? []).slice(0, 4).map((c) => (
              <li key={c.id}>
                <Link to={`/category/${c.slug}`} className="text-fg hover:text-accent">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="text-eyebrow uppercase text-subtle">Company</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/about"   className="text-fg hover:text-accent">About</Link></li>
            <li><Link to="/contact" className="text-fg hover:text-accent">Contact</Link></li>
            <li><Link to="/contact" className="text-fg hover:text-accent">Showroom</Link></li>
          </ul>
        </div>

        {/* Newsletter (presentational) */}
        <div>
          <h4 className="text-eyebrow uppercase text-subtle">Stay in touch</h4>
          <p className="mt-4 text-sm text-muted">
            Quiet, occasional notes about new collections.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="mt-4 flex items-center gap-0 border-b border-border focus-within:border-fg"
          >
            <input
              type="email"
              aria-label="Email address"
              placeholder="you@example.com"
              className="h-10 w-full bg-transparent text-sm text-fg placeholder:text-subtle focus:outline-none"
            />
            <button
              type="submit"
              className="shrink-0 text-xs font-medium uppercase tracking-[0.14em] text-fg hover:text-accent"
            >
              Join
            </button>
          </form>
        </div>
      </Container>

      <Container className="flex flex-col items-start justify-between gap-2 border-t border-border py-6 text-xs text-muted md:flex-row md:items-center">
        <span>© {new Date().getFullYear()} {asString(settings?.['site.name']) ?? 'Ebella'}. All rights reserved.</span>
        <span>Made with care in Baku</span>
      </Container>
    </footer>
  );
}

function ContactItem({
  icon,
  label,
  value,
  href,
  loading,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
  href?: string;
  loading?: boolean;
}) {
  const body = loading ? (
    <Skeleton className="mt-1 h-4 w-40" />
  ) : value ? (
    <span className="text-fg">{value}</span>
  ) : (
    <span className="text-subtle">—</span>
  );

  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 text-muted">{icon}</div>
      <div>
        <div className="text-eyebrow uppercase text-subtle">{label}</div>
        <div className="mt-1 text-sm">
          {href && !loading ? (
            <a href={href} className="text-fg hover:text-accent">{value}</a>
          ) : (
            body
          )}
        </div>
      </div>
    </div>
  );
}

function asString(v: unknown): string | null {
  return typeof v === 'string' ? v : null;
}
