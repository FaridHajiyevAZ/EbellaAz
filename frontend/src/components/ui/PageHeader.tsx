import { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface Props {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
  className?: string;
}

/** Section header for admin pages: eyebrow, display-serif title, actions row. */
export function PageHeader({ title, description, eyebrow, actions, className }: Props) {
  return (
    <header className={cn('flex flex-wrap items-end justify-between gap-4 pb-6', className)}>
      <div className="min-w-0">
        {eyebrow && (
          <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-subtle">
            {eyebrow}
          </span>
        )}
        <h1 className="mt-1 font-display text-heading text-fg">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}
