import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { HomeSectionPublic } from '@/types/api';
import { Container } from '@/components/ui/Container';

export function CtaStrip({ section }: { section: HomeSectionPublic }) {
  const ctaText = (section.config?.ctaText as string | undefined) ?? 'Learn more';
  const ctaUrl  = (section.config?.ctaUrl  as string | undefined) ?? '/about';

  return (
    <section className="border-y border-border bg-bg-alt/60 py-10">
      <Container className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="text-center md:text-left">
          {section.title && <h3 className="font-display text-heading text-fg">{section.title}</h3>}
          {section.subtitle && <p className="text-sm text-muted">{section.subtitle}</p>}
        </div>
        <Link
          to={ctaUrl}
          className="focus-ring group inline-flex items-center gap-2 text-sm font-medium text-fg hover:text-accent"
        >
          {ctaText}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </Container>
    </section>
  );
}
