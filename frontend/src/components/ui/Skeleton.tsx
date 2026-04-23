import { HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

interface Props extends HTMLAttributes<HTMLDivElement> {
  /** Optional accessible label for screen readers. Defaults to "Loading". */
  label?: string;
}

export function Skeleton({ className, label, ...props }: Props) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={label ?? 'Loading'}
      className={cn(
        'animate-pulse rounded bg-bg-alt motion-reduce:animate-none',
        className,
      )}
      {...props}
    />
  );
}
