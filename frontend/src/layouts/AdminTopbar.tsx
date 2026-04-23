import { useLocation } from 'react-router-dom';
import { ExternalLink, Menu } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { env } from '@/utils/env';
import { ADMIN_NAV } from './AdminSidebar';

interface Props {
  onOpenSidebar: () => void;
}

/**
 * Shows the current section label on the left (derived from the matching
 * navigation entry) and quick links on the right: visit site + user chip.
 * The topbar has no user menu dropdown yet — sign-out lives in the sidebar
 * so mobile and desktop share one source of truth.
 */
export function AdminTopbar({ onOpenSidebar }: Props) {
  const { pathname } = useLocation();
  const match = [...ADMIN_NAV]
    .sort((a, b) => b.to.length - a.to.length)
    .find((i) => pathname === i.to || pathname.startsWith(i.to + '/'));

  const siteHref = env.publicSiteUrl || '/';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-bg/85 px-4 backdrop-blur md:px-8">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label="Open menu"
        onClick={onOpenSidebar}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="min-w-0 flex-1">
        <span className="font-display text-heading text-fg">
          {match?.label ?? 'Admin'}
        </span>
      </div>

      <a
        href={siteHref}
        target="_blank"
        rel="noopener noreferrer"
        className="focus-ring hidden items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted transition-colors hover:text-fg sm:inline-flex"
      >
        <ExternalLink className="h-3.5 w-3.5" />
        View site
      </a>
    </header>
  );
}
