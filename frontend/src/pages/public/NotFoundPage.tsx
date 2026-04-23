import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { useSeo } from '@/hooks/useSeo';

export function NotFoundPage() {
  const { pathname } = useLocation();
  useSeo({ title: 'Not found', description: 'The page you were looking for could not be found.' });

  return (
    <Container className="grid min-h-[60vh] place-items-center py-24 text-center">
      <div className="max-w-md">
        <span className="text-eyebrow uppercase text-subtle">404</span>
        <h1 className="mt-2 font-display text-display text-balance text-fg">
          We couldn't find that page
        </h1>
        <p className="mt-3 text-muted">
          The page you were looking for has moved or no longer exists.
        </p>
        {pathname && (
          <p className="mt-2 text-xs text-subtle">
            Tried to load: <code className="text-fg">{pathname}</code>
          </p>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          <Button asChild={false} variant="primary" size="lg">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" /> Back to home
            </Link>
          </Button>
          <Button asChild={false} variant="outline" size="lg">
            <Link to="/category/home-furniture">
              <Search className="h-4 w-4" /> Browse the catalog
            </Link>
          </Button>
        </div>
      </div>
    </Container>
  );
}
