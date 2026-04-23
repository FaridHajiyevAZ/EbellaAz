import { useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Pagination } from '@/components/ui/Pagination';
import { ProductCard } from '@/features/catalog/ProductCard';
import {
  CategoryFilters,
  SORT_PARAM,
  type CategoryFiltersValue,
  type SortKey,
} from '@/features/catalog/CategoryFilters';
import { useCategoryTree, useProductList } from '@/hooks/useCatalog';
import type { CategoryTreeNode } from '@/types/api';

const PAGE_SIZE = 24;
const DEFAULT_SORT: SortKey = 'newest';

/**
 * Category listing at /category/:slug (and nested /category/:parent/:child/...).
 *
 * The slug path is walked against the live category tree to resolve the
 * current node. All filter state is URL-backed so results are shareable
 * and back-button-safe.
 *
 *   /category/home-furniture/sofas?q=oak&sub=corner-sofas&featured=1&sort=name_asc&page=2
 */
export function CategoryPage() {
  const { '*': rest = '' } = useParams();
  const slugPath = rest.split('/').filter(Boolean);

  const [searchParams, setSearchParams] = useSearchParams();

  const { data: tree, isLoading: treeLoading, isError: treeError, refetch: refetchTree } = useCategoryTree();

  const { node, trail } = useMemo(
    () => resolvePath(tree ?? [], slugPath),
    [tree, slugPath],
  );

  // --- URL-driven filter state ---
  const filters: CategoryFiltersValue = {
    q:        searchParams.get('q') ?? '',
    subSlug:  searchParams.get('sub'),
    featured: searchParams.get('featured') === '1',
    sort:     (searchParams.get('sort') as SortKey | null) ?? DEFAULT_SORT,
  };
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'));

  const updateFilters = (next: CategoryFiltersValue) => {
    const params = new URLSearchParams(searchParams);
    setParam(params, 'q',        next.q);
    setParam(params, 'sub',      next.subSlug);
    setParam(params, 'featured', next.featured ? '1' : '');
    setParam(params, 'sort',     next.sort === DEFAULT_SORT ? '' : next.sort);
    params.delete('page'); // any filter change resets paging
    setSearchParams(params, { replace: true });
  };
  const goToPage = (p: number) => {
    const params = new URLSearchParams(searchParams);
    if (p <= 1) params.delete('page'); else params.set('page', String(p));
    setSearchParams(params, { replace: false });
    // Let ScrollRestoration (in PublicLayout) handle scroll on history change.
  };

  // Resolve which category id to query: selected subcategory if any, else current node.
  const selectedSub = filters.subSlug
    ? node?.children.find((c) => c.slug === filters.subSlug) ?? null
    : null;
  const queryCategoryId = selectedSub?.id ?? node?.id;
  const subtree = !selectedSub; // when a direct sub is selected we don't descend further

  const products = useProductList({
    categoryId: queryCategoryId,
    subtree,
    q:        filters.q.trim() || undefined,
    featured: filters.featured || undefined,
    sort:     SORT_PARAM[filters.sort],
    page: page - 1,
    size: PAGE_SIZE,
  });

  // ---------------- Render paths ----------------

  if (treeLoading) {
    return <CategoryPageSkeleton />;
  }

  if (treeError) {
    return (
      <Container className="py-16">
        <ErrorState onRetry={() => refetchTree()} />
      </Container>
    );
  }

  if (!node) {
    return (
      <Container className="py-20">
        <EmptyState
          title="Category not found"
          description="This link may be out of date."
          action={<Link className="text-accent underline underline-offset-4" to="/">Back to home</Link>}
        />
      </Container>
    );
  }

  const title = selectedSub?.name ?? node.name;

  return (
    <Container className="py-10 md:py-14">
      <Breadcrumbs trail={trail} current={selectedSub?.name} />

      <header className="mt-4 max-w-2xl">
        <span className="text-eyebrow uppercase text-subtle">Collection</span>
        <h1 className="mt-2 font-display text-display text-balance text-fg">{title}</h1>
      </header>

      <div className="mt-10 md:mt-14">
        <CategoryFilters
          subcategories={node.children}
          value={filters}
          onChange={updateFilters}
          resultCount={products.data?.totalElements}
        />
      </div>

      <div className="mt-10">
        {products.isError ? (
          <ErrorState onRetry={() => products.refetch()} />
        ) : products.isLoading ? (
          <ProductGridSkeleton />
        ) : !products.data || products.data.items.length === 0 ? (
          <EmptyState
            title="No products match these filters"
            description={
              filters.q || filters.featured || filters.subSlug
                ? 'Try clearing a filter or two.'
                : 'Check back soon — new arrivals land every week.'
            }
          />
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {products.data.items.map((p, i) => (
                <ProductCard key={p.id} product={p} priority={i < 8} />
              ))}
            </div>
            <Pagination
              className="mt-12"
              page={page}
              totalPages={products.data.totalPages}
              onChange={goToPage}
            />
          </>
        )}
      </div>
    </Container>
  );
}

/* ------------------------------- helpers ------------------------------- */

function Breadcrumbs({ trail, current }: { trail: CategoryTreeNode[]; current?: string }) {
  if (trail.length === 0 && !current) return null;
  const parentPath: string[] = [];
  return (
    <nav aria-label="Breadcrumb" className="text-xs text-muted">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link to="/" className="hover:text-fg">Home</Link>
        </li>
        {trail.map((n) => {
          parentPath.push(n.slug);
          const href = `/category/${parentPath.join('/')}`;
          return (
            <li key={n.id} className="flex items-center gap-1.5">
              <ChevronRight className="h-3 w-3 text-subtle" />
              <Link to={href} className="hover:text-fg">{n.name}</Link>
            </li>
          );
        })}
        {current && (
          <li className="flex items-center gap-1.5">
            <ChevronRight className="h-3 w-3 text-subtle" />
            <span className="text-fg">{current}</span>
          </li>
        )}
      </ol>
    </nav>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i}>
          <Skeleton className="aspect-[4/5]" />
          <Skeleton className="mt-3 h-4 w-2/3" />
          <Skeleton className="mt-2 h-3 w-1/3" />
        </div>
      ))}
    </div>
  );
}

function CategoryPageSkeleton() {
  return (
    <Container className="py-10">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="mt-6 h-10 w-72" />
      <Skeleton className="mt-10 h-11 w-full" />
      <div className="mt-10">
        <ProductGridSkeleton />
      </div>
    </Container>
  );
}

/**
 * Walks the slug path against the tree and returns the deepest matched node
 * plus the breadcrumb trail. Unmatched suffix stops the traversal.
 */
function resolvePath(
  tree: CategoryTreeNode[],
  slugPath: string[],
): { node: CategoryTreeNode | null; trail: CategoryTreeNode[] } {
  if (slugPath.length === 0) return { node: null, trail: [] };
  const trail: CategoryTreeNode[] = [];
  let cursor = tree.find((n) => n.slug === slugPath[0]) ?? null;
  if (!cursor) return { node: null, trail };
  trail.push(cursor);
  for (let i = 1; i < slugPath.length; i++) {
    const next = cursor.children.find((c) => c.slug === slugPath[i]) ?? null;
    if (!next) break;
    trail.push(next);
    cursor = next;
  }
  return { node: cursor, trail: trail.slice(0, -1) };
}

function setParam(params: URLSearchParams, key: string, value: string | null | undefined) {
  if (value === null || value === undefined || value === '') {
    params.delete(key);
  } else {
    params.set(key, value);
  }
}
