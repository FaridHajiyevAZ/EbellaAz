import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface FormSectionProps extends HTMLAttributes<HTMLElement> {
  title: string;
  description?: string;
  actions?: ReactNode;
}

/**
 * Grouping container for admin forms. Title + description on the left,
 * the field grid on the right — standard two-column admin pattern that
 * collapses gracefully on small screens.
 */
export function FormSection({
  title,
  description,
  actions,
  className,
  children,
  ...rest
}: FormSectionProps) {
  return (
    <section className={cn('grid gap-8 py-8 md:grid-cols-3', className)} {...rest}>
      <header className="md:col-span-1">
        <h3 className="font-display text-heading text-fg">{title}</h3>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </header>
      <div className="space-y-4 md:col-span-2">{children}</div>
      {actions && <div className="md:col-span-3 flex justify-end gap-2 pt-2">{actions}</div>}
    </section>
  );
}
