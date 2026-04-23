import { RouterProvider } from 'react-router-dom';
import { router } from '@/routes/routes';
import { AppProviders } from '@/app/providers';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

export function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </ErrorBoundary>
  );
}
