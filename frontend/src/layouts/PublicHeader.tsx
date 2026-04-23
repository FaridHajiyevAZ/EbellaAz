import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, Menu, X } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Logo } from '@/components/common/Logo';
import { useCategoryTree } from '@/hooks/useCatalog';
import type { CategoryTreeNode } from '@/types/api';
import { cn } from '@/utils/cn';

/**
 * Premium navigation:
 *  - desktop: hover-triggered mega-menu panels under the header
 *  - mobile: full-screen drawer with accordioned subcategories
 *  - picks Mattresses / Office / Home from the category tree by slug;
 *    any remaining roots fall into an overflow "More" group.
 */
export function PublicHeader() {
  const { data: tree } = useCategoryTree();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeRoot, setActiveRoot] = useState<string | null>(null);
  const closeTimer = useRef<number | null>(null);

  // Close mega + mobile menus on navigation
  useEffect(() => {
    setActiveRoot(null);
    setMobileOpen(false);
  }, [location.pathname]);

  // Close mega on escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setActiveRoot(null);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const PREFERRED_SLUGS = ['mattresses', 'office-furniture', 'home-furniture'] as const;
  const roots = pickOrderedRoots(tree ?? [], PREFERRED_SLUGS);

  const scheduleClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setActiveRoot(null), 120);
  };
  const cancelClose = () => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const activeNode = roots.find((r) => r.id === activeRoot) ?? null;

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-fg text-bg">
        <Container className="flex h-9 items-center justify-center text-[12px] tracking-wide">
          Crafted in small batches — visit our Baku showroom
        </Container>
      </div>

      <header className="sticky top-0 z-40 border-b border-border bg-bg/90 backdrop-blur">
        <Container className="flex h-16 items-center justify-between gap-8">
          <Link to="/" className="focus-ring rounded" aria-label="Ebella — home">
            <Logo />
          </Link>

          <nav
            className="hidden items-center gap-7 md:flex"
            onMouseLeave={scheduleClose}
            onMouseEnter={cancelClose}
          >
            {roots.map((node) => (
              <NavTrigger
                key={node.id}
                node={node}
                active={activeRoot === node.id}
                onHover={() => {
                  cancelClose();
                  setActiveRoot(node.id);
                }}
                onFocus={() => setActiveRoot(node.id)}
                onBlur={scheduleClose}
              />
            ))}
            <NavItem to="/about"   label="About" />
            <NavItem to="/contact" label="Contact" />
          </nav>

          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="focus-ring rounded-md p-2 md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        </Container>

        {/* Mega menu panel */}
        <MegaPanel
          node={activeNode}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          onClose={() => setActiveRoot(null)}
        />
      </header>

      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} roots={roots} />
    </>
  );
}

/* --------------------------- Desktop pieces -------------------------- */

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'text-sm text-muted transition-colors hover:text-fg',
          isActive && 'text-fg',
        )
      }
    >
      {label}
    </NavLink>
  );
}

function NavTrigger({
  node,
  active,
  onHover,
  onFocus,
  onBlur,
}: {
  node: CategoryTreeNode;
  active: boolean;
  onHover: () => void;
  onFocus: () => void;
  onBlur: () => void;
}) {
  return (
    <Link
      to={`/category/${node.slug}`}
      onMouseEnter={onHover}
      onFocus={onFocus}
      onBlur={onBlur}
      aria-haspopup="true"
      aria-expanded={active}
      className={cn(
        'inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-fg',
        active && 'text-fg',
      )}
    >
      {node.name}
      {node.children.length > 0 && (
        <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', active && 'rotate-180')} />
      )}
    </Link>
  );
}

function MegaPanel({
  node,
  onMouseEnter,
  onMouseLeave,
  onClose,
}: {
  node: CategoryTreeNode | null;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClose: () => void;
}) {
  if (!node || node.children.length === 0) return null;

  return (
    <>
      {/* Backdrop dims the page behind the panel. */}
      <button
        aria-label="Close menu"
        className="fixed inset-0 top-[calc(9rem+1px)] hidden bg-fg/20 backdrop-blur-[1px] md:block"
        onClick={onClose}
        tabIndex={-1}
      />
      <div
        className="absolute inset-x-0 top-full hidden animate-fade-in border-b border-border bg-bg shadow-pop md:block"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <Container className="grid gap-10 py-10 md:grid-cols-[1fr_1.4fr]">
          <div>
            <span className="text-eyebrow uppercase text-subtle">{node.name}</span>
            <h3 className="mt-2 font-display text-heading text-fg">Explore the collection</h3>
            <p className="mt-2 max-w-sm text-sm text-muted">
              Browse subcategories below, or see everything in {node.name}.
            </p>
            <Link
              to={`/category/${node.slug}`}
              className="mt-4 inline-block border-b border-border pb-0.5 text-sm text-fg hover:border-accent hover:text-accent"
            >
              View all
            </Link>
          </div>
          <ul className="grid grid-cols-2 gap-x-8 gap-y-2">
            {node.children.map((child) => (
              <li key={child.id}>
                <Link
                  to={`/category/${node.slug}/${child.slug}`}
                  className="focus-ring block rounded py-1 text-sm text-fg hover:text-accent"
                >
                  {child.name}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </div>
    </>
  );
}

/* ---------------------------- Mobile drawer -------------------------- */

function MobileDrawer({
  open,
  onClose,
  roots,
}: {
  open: boolean;
  onClose: () => void;
  roots: CategoryTreeNode[];
}) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <button
        aria-label="Close menu"
        className="absolute inset-0 bg-fg/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <aside className="absolute right-0 top-0 flex h-full w-[86%] max-w-sm flex-col bg-bg shadow-pop animate-fade-in">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <Logo />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="focus-ring rounded-md p-2"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {roots.map((root) => (
            <details key={root.id} className="border-b border-border py-3 [&[open]_svg]:rotate-180">
              <summary className="flex cursor-pointer list-none items-center justify-between text-base text-fg">
                <span className="font-display">{root.name}</span>
                {root.children.length > 0 && (
                  <ChevronDown className="h-4 w-4 transition-transform" />
                )}
              </summary>
              <Link
                to={`/category/${root.slug}`}
                className="mt-3 block text-xs uppercase tracking-[0.14em] text-subtle"
              >
                View all {root.name}
              </Link>
              {root.children.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {root.children.map((child) => (
                    <li key={child.id}>
                      <Link
                        to={`/category/${root.slug}/${child.slug}`}
                        className="block py-1.5 text-sm text-muted hover:text-fg"
                      >
                        {child.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </details>
          ))}
          <nav className="mt-6 space-y-3 text-sm">
            <Link to="/about" className="block text-fg hover:text-accent">About</Link>
            <Link to="/contact" className="block text-fg hover:text-accent">Contact</Link>
          </nav>
        </div>
      </aside>
    </div>
  );
}

/* ------------------------------ Helpers ------------------------------ */

function pickOrderedRoots(
  tree: CategoryTreeNode[],
  preferredSlugs: readonly string[],
): CategoryTreeNode[] {
  const bySlug = new Map(tree.map((n) => [n.slug, n]));
  const preferred = preferredSlugs.map((s) => bySlug.get(s)).filter(Boolean) as CategoryTreeNode[];
  const rest = tree.filter((n) => !preferredSlugs.includes(n.slug));
  return [...preferred, ...rest];
}
