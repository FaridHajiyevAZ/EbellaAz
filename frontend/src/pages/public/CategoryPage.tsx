import { useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Container } from '@/components/ui/Container';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Pagination } from '@/components/ui/Pagination';
import { Breadcrumbs, BreadcrumbItem } from '@/components/ui/Breadcrumbs';
import { ProductCard } from '@/features/catalog/ProductCard';
import {
  CategoryFilters,
  SORT_PARAM,
  type CategoryFiltersValue,
  type SortKey,
} from '@/features/catalog/CategoryFilters';
import { useCategoryTree, useProductList } from '@/hooks/useCatalog';
import { useSeo } from '@/hooks/useSeo';
import type { CategoryTreeNode } from '@/types/api';

const PAGE_SIZE = 24;
const DEFAULT_SORT: SortKey = 'newest';

/**
 * Category listing at /category/:slug (and nested /category/:parent/:child/...).
 * Filter state lives entirely in the URL so results are shareable + back-safe.
 *
 *   /category/home-furniture/sofas?q=oak&sub=corner-sofas&featured=1&sort=name_asc&page=2
 */
export function CategoryPage() {
  const { '*': rest = '' } = useParams();
  const slugPath = rest.split('/').filter(Boolean);

  const [searchParams, setSearchParams] = useSearchParams();

  const tree = useCategoryTree();
  const { node, trail } = useMemo(
    () => resolvePath(tree.data ?? [], slugPath),
    [tree.data, slugPath],
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
    params.delete('page');
    setSearchParams(params, { replace: true });
  };
  const goToPage = (p: number) => {
    const params = new URLSearchParams(searchParams);
    if (p <= 1) params.delete('page'); else params.set('page', String(p));
    setSearchParams(params, { replace: false });
  };

  const selectedSub = filters.subSlug
    ? node?.children.find((c) => c.slug === filters.subSlug) ?? null
    : null;
  const queryCategoryId = selectedSub?.id ?? node?.id;

  const products = useProductList({
    categoryId: queryCategoryId,
    subtree:    !selectedSub,
    q:          filters.q.trim() || undefined,
    featured:   filters.featured || undefined,
    sort:       SORT_PARAM[filters.sort],
    page: page - 1,
    size: PAGE_SIZE,
  });

  // SEO
  const seoTitle = node ? (selectedSub?.name ?? node.name) : 'Category';
  useSeo({
    title: seoTitle,
    description: node
      ? `Shop ${selectedSub?.name ?? node.name} at Ebella.`
      : undefined,
  });

  // ---------------- Render paths ----------------

  if (tree.isLoading) return <CategoryPageSkeleton />;
  if (tree.isError) {
    return (
      <Container className="py-16">
        <ErrorState onRetry={() => tree.refetch()} />
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
  const breadcrumbs = buildBreadcrumbs(trail, node, selectedSub);

  return (
    <Container className="py-10 md:py-14">
      <Breadcrumbs items={breadcrumbs} />

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

function buildBreadcrumbs(
  trail: CategoryTreeNode[],
  node: CategoryTreeNode,
  selectedSub: CategoryTreeNode | null,
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [{ label: 'Home', to: '/' }];
  const parents: string[] = [];
  for (const t of trail) {
    parents.push(t.slug);
    items.push({ label: t.name, to: `/category/${parents.join('/')}` });
  }
  // The deepest matched node is always there; if a subcategory is selected
  // we make the deepest matched a link and the sub the current page.
  parents.push(node.slug);
  const nodeHref = `/category/${parents.join('/')}`;
  if (selectedSub) {
    items.push({ label: node.name, to: nodeHref });
    items.push({ label: selectedSub.name }); // current
  } else {
    items.push({ label: node.name }); // current
  }
  return items;
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
