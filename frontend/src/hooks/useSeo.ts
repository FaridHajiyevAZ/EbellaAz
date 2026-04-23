import { useEffect } from 'react';

interface SeoOptions {
  /** Page title. The site name is appended automatically. */
  title?: string;
  description?: string;
  /** Skip the "— Ebella" suffix when true. */
  bareTitle?: boolean;
}

const SITE_NAME = 'Ebella';
const DEFAULT_DESCRIPTION = 'Premium mattresses, office, and home furniture.';

/**
 * Lightweight per-page SEO. Sets {@code document.title} and the meta
 * description tag on mount, restores both on unmount so navigations leave
 * a clean slate. For richer needs (canonical, OpenGraph, JSON-LD) swap
 * this for react-helmet-async later — same call site stays.
 */
export function useSeo({ title, description, bareTitle }: SeoOptions) {
  useEffect(() => {
    const previousTitle = document.title;
    const meta = ensureMetaDescription();
    const previousDescription = meta.getAttribute('content') ?? '';

    const pageTitle = title
      ? bareTitle
        ? title
        : `${title} — ${SITE_NAME}`
      : SITE_NAME;
    document.title = pageTitle;
    meta.setAttribute('content', description ?? DEFAULT_DESCRIPTION);

    return () => {
      document.title = previousTitle;
      meta.setAttribute('content', previousDescription || DEFAULT_DESCRIPTION);
    };
  }, [title, description, bareTitle]);
}

function ensureMetaDescription(): HTMLMetaElement {
  let el = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', 'description');
    document.head.appendChild(el);
  }
  return el;
}
