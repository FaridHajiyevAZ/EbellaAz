import { Link, NavLink, Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useState } from 'react';
import { Container } from '@/components/ui/Container';
import { Logo } from '@/components/common/Logo';
import { cn } from '@/utils/cn';

const NAV = [
  { to: '/',            label: 'Home' },
  { to: '/category/mattresses',       label: 'Mattresses' },
  { to: '/category/home-furniture',   label: 'Home' },
  { to: '/category/office-furniture', label: 'Office' },
  { to: '/about',       label: 'About' },
  { to: '/contact',     label: 'Contact' },
];

export function PublicLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-full flex-col bg-bg">
      {/* Top announcement bar — subtle, single line */}
      <div className="bg-fg text-bg">
        <Container className="flex h-9 items-center justify-center text-xs tracking-wide">
          Crafted in small batches. Visit the showroom in Baku.
        </Container>
      </div>

      <header className="sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur">
        <Container className="flex h-16 items-center justify-between gap-6">
          <Link to="/" className="focus-ring rounded">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'text-sm text-muted transition-colors hover:text-fg',
                    isActive && 'text-fg',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="focus-ring rounded-md p-2 md:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </Container>

        {open && (
          <nav className="border-t border-border bg-bg md:hidden">
            <Container className="flex flex-col py-3">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'rounded py-2 text-sm text-muted hover:text-fg',
                      isActive && 'text-fg',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </Container>
          </nav>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="mt-24 border-t border-border bg-bg-alt/50">
        <Container className="grid gap-10 py-12 md:grid-cols-3">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-muted">
              Premium mattresses and furniture, designed to last.
            </p>
          </div>
          <div>
            <h4 className="text-eyebrow uppercase text-subtle">Catalog</h4>
            <ul className="mt-3 space-y-2 text-sm">
              {NAV.slice(1, 4).map((i) => (
                <li key={i.to}>
                  <Link to={i.to} className="text-fg hover:text-accent">
                    {i.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-eyebrow uppercase text-subtle">Company</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/about"   className="text-fg hover:text-accent">About</Link></li>
              <li><Link to="/contact" className="text-fg hover:text-accent">Contact</Link></li>
            </ul>
          </div>
        </Container>
        <Container className="flex flex-col items-start justify-between gap-2 border-t border-border py-6 text-xs text-muted md:flex-row md:items-center">
          <span>© {new Date().getFullYear()} Ebella</span>
          <span>Made with care in Baku</span>
        </Container>
      </footer>
    </div>
  );
}
