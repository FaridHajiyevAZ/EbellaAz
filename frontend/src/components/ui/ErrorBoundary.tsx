import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';
import { Container } from './Container';

interface Props {
  /** Optional custom fallback. Receives the caught error and a reset callback. */
  fallback?: (error: Error, reset: () => void) => ReactNode;
  /** Called once when an error is caught — wire to your monitoring sink. */
  onError?: (error: Error, info: ErrorInfo) => void;
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Top-level error boundary. Catches render-time errors from anywhere in the
 * subtree and shows a calm fallback. Network errors are normally handled by
 * TanStack Query's error states; this catches the unexpected ones.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (this.props.onError) {
      this.props.onError(error, info);
    } else if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error('ErrorBoundary caught:', error, info);
    }
  }

  reset = () => this.setState({ error: null });

  render() {
    if (!this.state.error) return this.props.children;
    if (this.props.fallback) return this.props.fallback(this.state.error, this.reset);
    return <DefaultFallback error={this.state.error} reset={this.reset} />;
  }
}

function DefaultFallback({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <Container className="grid min-h-[60vh] place-items-center py-20 text-center">
      <div className="max-w-md">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-danger/10">
          <AlertTriangle className="h-5 w-5 text-danger" />
        </div>
        <h1 className="mt-4 font-display text-display text-fg">Something went wrong</h1>
        <p className="mt-2 text-muted">
          The page hit an unexpected error. Try reloading; if it keeps happening, contact support.
        </p>
        {import.meta.env.DEV && (
          <pre className="mt-4 max-h-48 overflow-auto rounded-md bg-bg-alt p-3 text-left text-[11px] text-muted">
            {error.message}
          </pre>
        )}
        <div className="mt-6 flex justify-center gap-2">
          <Button variant="outline" onClick={reset}>
            <RefreshCw className="h-4 w-4" /> Try again
          </Button>
          <Button onClick={() => window.location.assign('/')}>Back to home</Button>
        </div>
      </div>
    </Container>
  );
}
