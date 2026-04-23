import { Link } from 'react-router-dom';
import type { ProductCard as ProductCardDto } from '@/types/api';
import { SmartImage } from '@/components/ui/SmartImage';
import { cn } from '@/utils/cn';

interface Props {
  product: ProductCardDto;
  priority?: boolean;
  className?: string;
}

/**
 * Restrained product tile. Hover lifts cover subtly — no overlays, no
 * shadows. Image fallback is delegated to SmartImage so missing covers
 * stay graceful.
 */
export function ProductCard({ product, priority, className }: Props) {
  return (
    <Link
      to={`/product/${product.slug}`}
      className={cn('group focus-ring block rounded-md', className)}
      aria-label={`${product.name}${product.brand ? ` by ${product.brand}` : ''}`}
    >
      <div className="aspect-[4/5] overflow-hidden rounded-md bg-bg-alt">
        <SmartImage
          src={product.coverImageUrl}
          alt={product.name}
          loading={priority ? 'eager' : 'lazy'}
          className="h-full w-full object-cover transition-transform duration-500 ease-out-smooth group-hover:scale-[1.03]"
          fallbackClassName="h-full w-full"
        />
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
          <div className="flex shrink-0 items-center gap-1 pt-0.5" aria-label={`${product.availableColorHexes.length} colors available`}>
            {product.availableColorHexes.slice(0, 4).map((hex) => (
              <span
                key={hex}
                className="h-3 w-3 rounded-full border border-border"
                style={{ backgroundColor: hex }}
                aria-hidden
              />
            ))}
            {product.availableColorHexes.length > 4 && (
              <span className="text-[10px] text-subtle" aria-hidden>+{product.availableColorHexes.length - 4}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
