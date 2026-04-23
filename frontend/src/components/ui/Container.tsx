import { HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

/** Content-width wrapper. Keeps all pages inside a predictable rail. */
export function Container({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('container', className)} {...props} />;
}
