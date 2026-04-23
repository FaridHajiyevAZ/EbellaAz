import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface BreadcrumbItem {
  label: string;
  /** When omitted, the item is rendered as plain text (the current page). */
  to?: string;
}

interface Props {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Compact breadcrumb trail. Last item with no {@code to} is treated as the
 * current page (rendered plain, with aria-current). Intermediate items are
 * react-router Links.
 */
export function Breadcrumbs({ items, className }: Props) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn('text-xs text-muted', className)}>
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="h-3 w-3 text-subtle" aria-hidden />}
              {item.to && !isLast ? (
                <Link to={item.to} className="hover:text-fg">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isLast ? 'page' : undefined} className={isLast ? 'text-fg' : ''}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
