import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PublicLayout } from '@/layouts/PublicLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { RequireAdmin } from '@/routes/guards';

// Public
import { HomePage }     from '@/pages/public/HomePage';
import { CategoryPage } from '@/pages/public/CategoryPage';
import { ProductPage }  from '@/pages/public/ProductPage';
import { AboutPage }    from '@/pages/public/AboutPage';
import { ContactPage }  from '@/pages/public/ContactPage';
import { NotFoundPage } from '@/pages/public/NotFoundPage';

// Admin
import { LoginPage }             from '@/pages/admin/LoginPage';
import { DashboardPage }         from '@/pages/admin/DashboardPage';
import { CategoriesPage }        from '@/pages/admin/CategoriesPage';
import { ProductsPage }          from '@/pages/admin/ProductsPage';
import { ProductEditPage }       from '@/pages/admin/ProductEditPage';
import { VariationsPage }        from '@/pages/admin/VariationsPage';
import { HeroSlidesPage }        from '@/pages/admin/HeroSlidesPage';
import { HomepageContentPage }   from '@/pages/admin/HomepageContentPage';
import { MediaPage }             from '@/pages/admin/MediaPage';
import { SettingsPage }          from '@/pages/admin/SettingsPage';

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'category/*', element: <CategoryPage /> },
      { path: 'product/:slug', element: <ProductPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'contact', element: <ContactPage /> },
    ],
  },
  {
    path: '/admin/login',
    element: <AuthLayout />,
    children: [{ index: true, element: <LoginPage /> }],
  },
  {
    path: '/admin',
    element: (
      <RequireAdmin>
        <AdminLayout />
      </RequireAdmin>
    ),
    children: [
      { index: true,            element: <DashboardPage /> },
      { path: 'categories',     element: <CategoriesPage /> },
      { path: 'products',       element: <ProductsPage /> },
      { path: 'products/:id',   element: <ProductEditPage /> },
      { path: 'variations',     element: <VariationsPage /> },
      { path: 'hero-slides',    element: <HeroSlidesPage /> },
      { path: 'home-sections',  element: <HomepageContentPage /> },
      { path: 'media',          element: <MediaPage /> },
      { path: 'settings',       element: <SettingsPage /> },
      // Legacy path — redirect to the new Homepage Content page.
      { path: 'content',        element: <Navigate to="/admin/home-sections" replace /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
