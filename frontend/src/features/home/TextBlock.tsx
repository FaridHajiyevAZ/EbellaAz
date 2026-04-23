import type { HomeSectionPublic } from '@/types/api';
import { Container } from '@/components/ui/Container';

export function TextBlock({ section }: { section: HomeSectionPublic }) {
  return (
    <section className="py-20 md:py-28">
      <Container className="max-w-2xl text-center">
        {section.title && (
          <>
            <span className="text-eyebrow uppercase text-subtle">Notes</span>
            <h2 className="mt-2 font-display text-display text-balance text-fg">{section.title}</h2>
          </>
        )}
        {section.subtitle && <p className="mt-3 text-muted">{section.subtitle}</p>}
        {section.body && (
          <p className="mt-6 whitespace-pre-line text-pretty text-muted">{section.body}</p>
        )}
      </Container>
    </section>
  );
}
