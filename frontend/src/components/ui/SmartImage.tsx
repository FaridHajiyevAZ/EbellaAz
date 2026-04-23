import { ImgHTMLAttributes, ReactNode, useEffect, useState } from 'react';
import { ImageOff } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null;
  alt: string;
  /** Custom fallback. Defaults to a neutral placeholder. */
  fallback?: ReactNode;
  /** Wrapper class for the placeholder. Use to keep aspect ratio consistent. */
  fallbackClassName?: string;
}

/**
 * Image with consistent fallback behaviour:
 *  - Renders a tasteful placeholder when {@code src} is missing.
 *  - Swaps to the same placeholder if loading fails at runtime.
 *  - Resets the error state if {@code src} changes.
 *  - Defaults to lazy + async to keep listings cheap.
 */
export function SmartImage({
  src,
  alt,
  fallback,
  fallbackClassName,
  className,
  loading = 'lazy',
  decoding = 'async',
  ...rest
}: Props) {
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    setErrored(false);
  }, [src]);

  if (!src || errored) {
    return (
      <span
        className={cn(
          'flex items-center justify-center bg-bg-alt text-subtle',
          fallbackClassName ?? className,
        )}
        role="img"
        aria-label={alt || 'Image unavailable'}
      >
        {fallback ?? <ImageOff className="h-5 w-5" aria-hidden />}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      decoding={decoding}
      className={className}
      onError={() => setErrored(true)}
      {...rest}
    />
  );
}
