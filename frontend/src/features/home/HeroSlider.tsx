import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react';
import type { HeroSlidePublic } from '@/types/api';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/utils/cn';

interface Props {
  slides: HeroSlidePublic[] | undefined;
  isLoading?: boolean;
  intervalMs?: number;
}

/**
 * Editorial-style hero. Full-bleed image, serif headline, restrained CTA.
 * Auto-advance pauses on hover and when prefers-reduced-motion is set.
 */
export function HeroSlider({ slides, isLoading, intervalMs = 7000 }: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceMotion = usePrefersReducedMotion();
  const timer = useRef<number | null>(null);

  const count = slides?.length ?? 0;
  const goTo = useCallback((i: number) => setIndex((count === 0 ? 0 : (i + count) % count)), [count]);
  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    if (count <= 1 || paused || reduceMotion) return;
    timer.current = window.setTimeout(next, intervalMs);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [count, paused, reduceMotion, next, intervalMs, index]);

  if (isLoading) {
    return (
      <section className="relative h-[70vh] min-h-[480px] w-full overflow-hidden bg-bg-alt">
        <Skeleton className="h-full w-full rounded-none" />
      </section>
    );
  }

  if (!slides || slides.length === 0) {
    return (
      <Container className="py-16">
        <EmptyState
          title="No hero slides configured yet"
          description="Add slides from the admin panel to populate this section."
        />
      </Container>
    );
  }

  return (
    <section
      className="relative h-[70vh] min-h-[480px] w-full overflow-hidden bg-fg text-bg"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured collections"
    >
      {slides.map((slide, i) => (
        <Slide key={slide.id} slide={slide} active={i === index} />
      ))}

      {/* Subtle bottom gradient for legibility */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-fg/50 to-transparent"
        aria-hidden
      />

      <Container className="relative z-10 flex h-full flex-col justify-end pb-14 md:pb-20">
        <div className="max-w-2xl animate-fade-in" key={slides[index]?.id}>
          <span className="text-eyebrow uppercase text-bg/75">New collection</span>
          <h1 className="mt-3 font-display text-display-lg text-balance text-bg">
            {slides[index]?.title}
          </h1>
          {slides[index]?.subtitle && (
            <p className="mt-4 max-w-xl text-pretty text-bg/80">{slides[index]?.subtitle}</p>
          )}
          {slides[index]?.ctaUrl && slides[index]?.ctaText && (
            <div className="mt-7">
              <Button variant="accent" size="lg" asChild={false}>
                <Link to={slides[index]!.ctaUrl!}>
                  {slides[index]!.ctaText} <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Controls row */}
        {slides.length > 1 && (
          <div className="mt-10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2" role="tablist" aria-label="Slide selectors">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => goTo(i)}
                  aria-label={`Slide ${i + 1}`}
                  aria-selected={i === index}
                  role="tab"
                  className={cn(
                    'h-[2px] w-10 rounded-full bg-bg/30 transition-all',
                    i === index && 'w-16 bg-bg',
                  )}
                />
              ))}
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPaused((p) => !p)}
                aria-label={paused ? 'Play' : 'Pause'}
                className="focus-ring rounded-full border border-bg/30 p-2 hover:bg-bg/10"
              >
                {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={prev}
                aria-label="Previous slide"
                className="focus-ring rounded-full border border-bg/30 p-2 hover:bg-bg/10"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next slide"
                className="focus-ring rounded-full border border-bg/30 p-2 hover:bg-bg/10"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}

function Slide({ slide, active }: { slide: HeroSlidePublic; active: boolean }) {
  return (
    <div
      className={cn(
        'absolute inset-0 transition-opacity duration-[900ms] ease-out-smooth',
        active ? 'opacity-100' : 'opacity-0',
      )}
      aria-hidden={!active}
    >
      {slide.imageUrl ? (
        <img
          src={slide.imageUrl}
          alt={slide.title}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="h-full w-full bg-fg" />
      )}
    </div>
  );
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const m = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(m.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    m.addEventListener('change', handler);
    return () => m.removeEventListener('change', handler);
  }, []);
  return reduced;
}
