import { Link } from 'react-router-dom';
import type { ProductCard as ProductCardDto } from '@/types/api';
import { cn } from '@/utils/cn';

interface Props {
  product: ProductCardDto;
  priority?: boolean;
  className?: string;
}

/**
 * Restrained product tile. Images fill their aspect ratio; color swatches
 * appear inline. Hover lifts cover subtly — no overlays, no shadows.
 */
export function ProductCard({ product, priority, className }: Props) {
  return (
    <Link
      to={`/product/${product.slug}`}
      className={cn(
        'group focus-ring block rounded-md',
        className,
      )}
    >
      <div className="aspect-[4/5] overflow-hidden rounded-md bg-bg-alt">
        {product.coverImageUrl ? (
          <img
            src={product.coverImageUrl}
            alt={product.name}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 ease-out-smooth group-hover:scale-[1.03]"
          />
        ) : (
          <div className="grid h-full place-items-center text-xs text-subtle">No image</div>
        )}
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          {product.brand && (
            <p className="text-[11px] uppercase tracking-[0.14em] text-subtle">{product.brand}</p>
          )}
          <h3 className="truncate text-sm font-medium text-fg group-hover:text-accent">
            {product.name}
          </h3>
        </div>
        {product.availableColorHexes.length > 0 && (
          <div className="flex shrink-0 items-center gap-1 pt-0.5" aria-label="Available colors">
            {product.availableColorHexes.slice(0, 4).map((hex) => (
              <span
                key={hex}
                className="h-3 w-3 rounded-full border border-border"
                style={{ backgroundColor: hex }}
              />
            ))}
            {product.availableColorHexes.length > 4 && (
              <span className="text-[10px] text-subtle">+{product.availableColorHexes.length - 4}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
