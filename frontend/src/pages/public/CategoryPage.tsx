import { Link, useParams } from 'react-router-dom';
import { Container } from '@/components/ui/Container';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { ProductCard } from '@/features/catalog/ProductCard';
import { useCategoryTree, useProductList } from '@/hooks/useCatalog';
import type { CategoryTreeNode } from '@/types/api';

function findBySlugPath(nodes: CategoryTreeNode[], path: string[]): CategoryTreeNode | null {
  if (path.length === 0) return null;
  const [head, ...rest] = path;
  const node = nodes.find((n) => n.slug === head);
  if (!node) return null;
  return rest.length === 0 ? node : findBySlugPath(node.children, rest);
}

export function CategoryPage() {
  const { '*': rest = '' } = useParams();
  const slugPath = rest.split('/').filter(Boolean);

  const { data: tree, isLoading: treeLoading } = useCategoryTree();
  const category = tree ? findBySlugPath(tree, slugPath) : null;

  const products = useProductList({
    categoryId: category?.id,
    subtree: true,
    size: 24,
  });

  if (treeLoading) {
    return (
      <Container className="py-12">
        <Skeleton className="mb-10 h-8 w-64" />
        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/5]" />
          ))}
        </div>
      </Container>
    );
  }

  if (!category) {
    return (
      <Container className="py-16">
        <EmptyState
          title="Category not found"
          description="This link may be out of date."
          action={<Link className="text-accent underline underline-offset-4" to="/">Back to home</Link>}
        />
      </Container>
    );
  }

  return (
    <Container className="py-12 md:py-16">
      <header className="mb-10 max-w-2xl">
        <span className="text-eyebrow uppercase text-subtle">Collection</span>
        <h1 className="mt-2 font-display text-display text-fg">{category.name}</h1>
      </header>

      {products.isError ? (
        <ErrorState onRetry={() => products.refetch()} />
      ) : products.isLoading ? (
        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/5]" />
          ))}
        </div>
      ) : products.data?.items.length === 0 ? (
        <EmptyState title="No products yet" description="Check back soon — new arrivals land every week." />
      ) : (
        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
          {products.data?.items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </Container>
  );
}
