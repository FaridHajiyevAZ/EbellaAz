import { Link } from 'react-router-dom';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { useHomePayload } from '@/hooks/useCatalog';

export function HomePage() {
  const { data, isLoading, isError, refetch } = useHomePayload();

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border">
        <Container className="grid items-center gap-10 py-16 md:grid-cols-2 md:py-24">
          <div>
            <span className="text-eyebrow uppercase text-accent">Spring Collection</span>
            <h1 className="mt-4 font-display text-display-lg text-balance text-fg">
              Quiet luxury for every room.
            </h1>
            <p className="mt-5 max-w-prose text-pretty text-muted">
              Hand-finished furniture that settles into a home and stays there.
              Explore our mattresses, living, and office collections.
            </p>
            <div className="mt-8 flex gap-3">
              <Button asChild={false} variant="primary" size="lg">
                <Link to="/category/home-furniture">Shop Home</Link>
              </Button>
              <Button variant="outline" size="lg">
                <Link to="/about">Our story</Link>
              </Button>
            </div>
          </div>
          <div className="aspect-[5/4] overflow-hidden rounded-lg bg-bg-alt">
            {isLoading ? (
              <Skeleton className="h-full w-full rounded-lg" />
            ) : data?.heroSlides?.[0]?.imageUrl ? (
              <img
                src={data.heroSlides[0].imageUrl}
                alt={data.heroSlides[0].title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="grid h-full place-items-center text-sm text-muted">
                Hero image
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* Sections */}
      <Container className="py-16 md:py-24">
        {isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : isLoading ? (
          <div className="grid gap-8 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5]" />
            ))}
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-3">
            {(data?.sections ?? []).map((s) => (
              <article key={s.id} className="group">
                {s.imageUrl && (
                  <div className="aspect-[4/5] overflow-hidden rounded-lg bg-bg-alt">
                    <img
                      src={s.imageUrl}
                      alt={s.title ?? ''}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                  </div>
                )}
                {s.title && (
                  <h3 className="mt-4 font-display text-heading text-fg">{s.title}</h3>
                )}
                {s.subtitle && <p className="mt-1 text-sm text-muted">{s.subtitle}</p>}
              </article>
            ))}
          </div>
        )}
      </Container>
    </>
  );
}
