import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

interface PaginationProps {
  /** 1-indexed current page (for a friendlier URL). */
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
  siblingCount?: number;
}

/**
 * Compact numeric pagination with first / last / siblings and ellipses.
 * Keyboard-focusable, a11y labelled, renders nothing when there's a single page.
 */
export function Pagination({
  page,
  totalPages,
  onChange,
  className,
  siblingCount = 1,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = buildPageList(page, totalPages, siblingCount);

  return (
    <nav aria-label="Pagination" className={cn('flex items-center justify-center gap-1', className)}>
      <PageButton
        ariaLabel="Previous page"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </PageButton>

      {pages.map((p, i) =>
        p === 'ellipsis' ? (
          <span key={`e${i}`} className="px-2 text-sm text-subtle">
            …
          </span>
        ) : (
          <PageButton
            key={p}
            ariaLabel={`Page ${p}`}
            active={p === page}
            onClick={() => onChange(p)}
          >
            {p}
          </PageButton>
        ),
      )}

      <PageButton
        ariaLabel="Next page"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        <ChevronRight className="h-4 w-4" />
      </PageButton>
    </nav>
  );
}

function PageButton({
  children,
  active,
  disabled,
  onClick,
  ariaLabel,
}: {
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'focus-ring inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded-md px-2 text-sm',
        active
          ? 'bg-fg text-bg'
          : 'text-fg hover:bg-bg-alt',
        disabled && 'pointer-events-none opacity-40',
      )}
    >
      {children}
    </button>
  );
}

function buildPageList(current: number, total: number, siblings: number): (number | 'ellipsis')[] {
  const first = 1;
  const last = total;
  const leftSibling = Math.max(current - siblings, first);
  const rightSibling = Math.min(current + siblings, last);

  const show = new Set<number>([first, last, current, leftSibling, rightSibling]);
  for (let i = leftSibling; i <= rightSibling; i++) show.add(i);

  const sorted = Array.from(show).sort((a, b) => a - b);

  const out: (number | 'ellipsis')[] = [];
  sorted.forEach((n, i) => {
    if (i > 0 && n - sorted[i - 1]! > 1) out.push('ellipsis');
    out.push(n);
  });
  return out;
}
