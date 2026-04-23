import { Link } from 'react-router-dom';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';

export function NotFoundPage() {
  return (
    <Container className="grid min-h-[60vh] place-items-center py-24 text-center">
      <div>
        <span className="text-eyebrow uppercase text-subtle">404</span>
        <h1 className="mt-2 font-display text-display text-fg">Page not found</h1>
        <p className="mt-3 text-muted">The page you were looking for has moved or no longer exists.</p>
        <div className="mt-6">
          <Button variant="primary" size="lg" asChild={false}>
            <Link to="/">Back to home</Link>
          </Button>
        </div>
      </div>
    </Container>
  );
}
