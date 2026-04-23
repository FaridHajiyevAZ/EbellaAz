import {
  KeyboardEvent,
  SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ImageOff } from 'lucide-react';
import type { ProductImage } from '@/types/api';
import { cn } from '@/utils/cn';

interface Props {
  images: ProductImage[];
  productName: string;
  /**
   * Opaque key that forces the gallery to reset to its first image when it
   * changes. Typically the selected variation id.
   */
  resetKey?: string;
  className?: string;
}

/**
 * Main image + thumbnail strip with graceful degradation:
 *  - if a variation has no images, renders a neutral placeholder
 *  - individual broken images swap to an inline placeholder on error
 *  - Left / Right arrow keys cycle the main image when it has focus
 */
export function ProductGallery({ images, productName, resetKey, className }: Props) {
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState<Record<string, boolean>>({});

  // Reset active image whenever the variation (or whatever reset key) changes.
  useEffect(() => {
    setIndex(0);
  }, [resetKey]);

  // If the images array shrinks below the current index, clamp it.
  useEffect(() => {
    if (index >= images.length && images.length > 0) setIndex(0);
  }, [images.length, index]);

  const active = images[index];

  const handleKey = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (images.length <= 1) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setIndex((i) => (i + 1) % images.length);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setIndex((i) => (i - 1 + images.length) % images.length);
      }
    },
    [images.length],
  );

  const markFailed = (id: string) => () =>
    setFailed((prev) => (prev[id] ? prev : { ...prev, [id]: true }));

  const mainSrcSet = useMemo(
    () => (active ? Object.values(active.renditions ?? {}).join(', ') : undefined),
    [active],
  );

  if (images.length === 0) {
    return (
      <div className={cn('space-y-3', className)}>
        <GalleryPlaceholder />
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div
        role="region"
        aria-label={`${productName} image`}
        aria-roledescription="carousel"
        tabIndex={0}
        onKeyDown={handleKey}
        className="relative aspect-square overflow-hidden rounded-md bg-bg-alt focus-ring"
      >
        {active && !failed[active.id] ? (
          <img
            // Key forces a fresh <img>, which lets the fade-in animation run
            // on every variation / thumbnail change without custom CSS state.
            key={active.id}
            src={active.url}
            srcSet={mainSrcSet}
            sizes="(min-width: 1024px) 640px, (min-width: 640px) 50vw, 100vw"
            alt={active.altText ?? productName}
            className="h-full w-full animate-fade-in object-cover"
            decoding="async"
            loading="eager"
            onError={onImgError(markFailed(active.id))}
          />
        ) : (
          <BrokenPlaceholder />
        )}
      </div>

      {images.length > 1 && (
        <ul
          role="tablist"
          aria-label="Product images"
          className="grid grid-cols-5 gap-2"
        >
          {images.map((img, i) => {
            const selected = i === index;
            return (
              <li key={img.id}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-label={`Show image ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={cn(
                    'focus-ring block aspect-square w-full overflow-hidden rounded bg-bg-alt transition-all',
                    selected ? 'ring-2 ring-fg ring-offset-2 ring-offset-bg' : 'opacity-75 hover:opacity-100',
                  )}
                >
                  {failed[img.id] ? (
                    <BrokenPlaceholder small />
                  ) : (
                    <img
                      src={img.url}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                      onError={onImgError(markFailed(img.id))}
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function GalleryPlaceholder() {
  return (
    <div className="flex aspect-square flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-bg-alt text-muted">
      <ImageOff className="h-5 w-5" />
      <span className="text-xs">Images coming soon</span>
    </div>
  );
}

function BrokenPlaceholder({ small }: { small?: boolean }) {
  return (
    <div
      className={cn(
        'flex h-full w-full items-center justify-center text-subtle',
        small ? 'text-[10px]' : 'text-xs',
      )}
    >
      <ImageOff className={cn(small ? 'h-3.5 w-3.5' : 'h-5 w-5')} />
    </div>
  );
}

function onImgError(cb: () => void) {
  return (e: SyntheticEvent<HTMLImageElement>) => {
    (e.currentTarget as HTMLImageElement).style.display = 'none';
    cb();
  };
}
