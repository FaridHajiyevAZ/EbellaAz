import { Container } from '@/components/ui/Container';
import { useSeo } from '@/hooks/useSeo';

export function AboutPage() {
  useSeo({
    title: 'About',
    description: 'Hand-finished furniture made in small batches in Baku.',
  });

  return (
    <Container className="max-w-3xl py-16 md:py-24">
      <span className="text-eyebrow uppercase text-subtle">About Ebella</span>
      <h1 className="mt-3 font-display text-display text-balance text-fg">
        Furniture that settles into a home.
      </h1>
      <div className="prose mt-8 max-w-none text-pretty text-muted">
        <p>
          We design and manufacture furniture in small batches, finishing every
          piece by hand in our Baku workshop. The result is work that feels
          calm in a room — the kind of thing you stop noticing, in the best way.
        </p>
        <p>
          From mattresses to dining tables, every collection starts with the
          same question: will this look right in ten years? If the answer is
          yes, we make it. If not, we keep designing.
        </p>
      </div>
    </Container>
  );
}
