import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { HomeSectionPublic } from '@/types/api';
import { Container } from '@/components/ui/Container';

export function PromoBanner({ section }: { section: HomeSectionPublic }) {
  const ctaText = (section.config?.ctaText as string | undefined) ?? undefined;
  const ctaUrl  = (section.config?.ctaUrl  as string | undefined) ?? undefined;

  return (
    <section className="py-20 md:py-28">
      <Container>
        <div className="relative overflow-hidden rounded-lg bg-fg">
          {section.imageUrl && (
            <img
              src={section.imageUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-70"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-fg/80 via-fg/40 to-fg/10" aria-hidden />
          <div className="relative grid gap-6 p-10 text-bg md:grid-cols-2 md:gap-10 md:p-16">
            <div>
              {section.title && (
                <h2 className="font-display text-display text-balance text-bg">{section.title}</h2>
              )}
              {section.subtitle && (
                <p className="mt-3 max-w-md text-pretty text-bg/80">{section.subtitle}</p>
              )}
              {section.body && (
                <p className="mt-5 max-w-lg text-sm leading-relaxed text-bg/75">{section.body}</p>
              )}
            </div>
            {ctaUrl && ctaText && (
              <div className="flex items-end md:justify-end">
                <Link
                  to={ctaUrl}
                  className="focus-ring group inline-flex items-center gap-2 border-b border-bg/30 pb-1 text-bg transition-colors hover:border-bg"
                >
                  {ctaText}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
