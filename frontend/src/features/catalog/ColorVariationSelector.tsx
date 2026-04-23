import type { ProductVariationPublic } from '@/types/api';
import { cn } from '@/utils/cn';

interface Props {
  variations: ProductVariationPublic[];
  selectedId: string | null;
  onChange: (id: string) => void;
  className?: string;
}

/**
 * Color picker with a live-updated label above the swatches. Designed for
 * keyboard and screen-reader navigation: each swatch is a radio input
 * visually styled as a circle.
 *
 * The component is purely presentational — selection state lives in the
 * parent via {@link useSelectedVariation}.
 */
export function ColorVariationSelector({
  variations,
  selectedId,
  onChange,
  className,
}: Props) {
  if (variations.length === 0) return null;

  const selected = variations.find((v) => v.id === selectedId) ?? variations[0];

  return (
    <div className={className}>
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
          Color
        </span>
        <span className="text-sm text-fg" aria-live="polite">
          {selected?.colorName}
        </span>
      </div>

      <div
        role="radiogroup"
        aria-label="Select a color"
        className="flex flex-wrap gap-3"
      >
        {variations.map((v) => {
          const active = v.id === selectedId;
          return (
            <label
              key={v.id}
              className={cn(
                'focus-within:ring-2 focus-within:ring-accent/60 focus-within:ring-offset-2 focus-within:ring-offset-bg',
                'relative h-10 w-10 cursor-pointer rounded-full transition-transform',
                active ? 'ring-2 ring-fg ring-offset-2 ring-offset-bg' : 'hover:scale-105',
              )}
              title={v.colorName}
            >
              <input
                type="radio"
                name="variation"
                value={v.id}
                checked={active}
                onChange={() => onChange(v.id)}
                className="peer sr-only"
                aria-label={v.colorName}
              />
              <span
                className={cn(
                  'block h-full w-full rounded-full border',
                  active ? 'border-fg' : 'border-border',
                )}
                style={{ backgroundColor: v.colorHex }}
                aria-hidden
              />
            </label>
          );
        })}
      </div>
    </div>
  );
}
