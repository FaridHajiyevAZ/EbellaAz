export function formatDate(iso: string | Date | null | undefined, locale = 'en-US') {
  if (!iso) return '';
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(d);
}

export function formatDateTime(iso: string | Date | null | undefined, locale = 'en-US') {
  if (!iso) return '';
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(d);
}

export function slugToPathSegments(slug: string): string[] {
  return slug.split('/').filter(Boolean);
}

export function truncate(text: string, max = 120) {
  if (!text) return '';
  return text.length <= max ? text : text.slice(0, max - 1) + '…';
}
