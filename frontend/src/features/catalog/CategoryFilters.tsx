import { ChangeEvent, useEffect, useState } from 'react';
import { Search, Sparkles, X } from 'lucide-react';
import type { CategoryTreeNode } from '@/types/api';
import { cn } from '@/utils/cn';
import { useDebounce } from '@/hooks/useDebounce';

export interface CategoryFiltersValue {
  q: string;
  subSlug: string | null;
  featured: boolean;
  sort: SortKey;
}

export type SortKey = 'newest' | 'name_asc' | 'name_desc' | 'featured';

export const SORT_LABEL: Record<SortKey, string> = {
  newest:    'Newest',
  featured:  'Featured first',
  name_asc:  'Name · A–Z',
  name_desc: 'Name · Z–A',
};

export const SORT_PARAM: Record<SortKey, string> = {
  newest:    'publishedAt,desc',
  featured:  'featured,desc',
  name_asc:  'name,asc',
  name_desc: 'name,desc',
};

interface Props {
  subcategories: CategoryTreeNode[];
  value: CategoryFiltersValue;
  onChange: (next: CategoryFiltersValue) => void;
  resultCount?: number;
  className?: string;
}

/**
 * Top-bar filter layout: search + sort on the first row, subcategory chips
 * and a featured toggle on the second. Fully controlled — the page owns the
 * URL-backed filter state.
 */
export function CategoryFilters({
  subcategories,
  value,
  onChange,
  resultCount,
  className,
}: Props) {
  // Local search state so the input stays responsive; debounce before
  // pushing up to the URL-state owner.
  const [q, setQ] = useState(value.q);
  const debouncedQ = useDebounce(q, 300);

  useEffect(() => setQ(value.q), [value.q]);
  useEffect(() => {
    if (debouncedQ !== value.q) onChange({ ...value, q: debouncedQ });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ]);

  const setSub = (slug: string | null) => onChange({ ...value, subSlug: slug });
  const toggleFeatured = () => onChange({ ...value, featured: !value.featured });
  const setSort = (e: ChangeEvent<HTMLSelectElement>) =>
    onChange({ ...value, sort: e.target.value as SortKey });

  const isActiveSub = (slug: string | null) => value.subSlug === slug;

  return (
    <section className={cn('space-y-4', className)}>
      {/* Row 1: search + sort */}
      <div className="flex flex-wrap items-center gap-3">
        <label className="group relative flex-1 min-w-[14rem]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
          <input
            type="search"
            placeholder="Search this collection…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-11 w-full rounded-md border border-border bg-surface pl-10 pr-10 text-sm text-fg placeholder:text-subtle focus-ring"
          />
          {q && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQ('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-subtle hover:text-fg"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </label>

        <div className="flex items-center gap-2 text-sm">
          <label htmlFor="sort" className="text-muted">Sort</label>
          <select
            id="sort"
            value={value.sort}
            onChange={setSort}
            className="h-11 rounded-md border border-border bg-surface px-3 text-sm text-fg focus-ring"
          >
            {(Object.keys(SORT_LABEL) as SortKey[]).map((k) => (
              <option key={k} value={k}>{SORT_LABEL[k]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 2: subcategory chips + featured toggle */}
      {(subcategories.length > 0 || value.featured) && (
        <div className="flex flex-wrap items-center gap-2">
          {subcategories.length > 0 && (
            <>
              <Chip active={isActiveSub(null)} onClick={() => setSub(null)}>
                All
              </Chip>
              {subcategories.map((c) => (
                <Chip
                  key={c.id}
                  active={isActiveSub(c.slug)}
                  onClick={() => setSub(c.slug)}
                >
                  {c.name}
                </Chip>
              ))}
              <span className="mx-1 hidden h-5 w-px bg-border md:inline-block" />
            </>
          )}
          <button
            type="button"
            onClick={toggleFeatured}
            className={cn(
              'focus-ring inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors',
              value.featured
                ? 'border-fg bg-fg text-bg'
                : 'border-border text-muted hover:border-fg hover:text-fg',
            )}
            aria-pressed={value.featured}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Featured only
          </button>
        </div>
      )}

      {/* Result count line */}
      {typeof resultCount === 'number' && (
        <p className="text-xs text-subtle">
          {resultCount} {resultCount === 1 ? 'item' : 'items'}
        </p>
      )}
    </section>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'focus-ring inline-flex items-center rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors',
        active
          ? 'border-fg bg-fg text-bg'
          : 'border-border text-muted hover:border-fg hover:text-fg',
      )}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}
