/**
 * Pure helpers for building wa.me links.
 *
 * Design:
 *  - No React, no hooks — trivially unit-testable.
 *  - Returns {@code null} when the phone number is invalid, so callers can
 *    render a fallback state instead of a dead link.
 *  - Template placeholders are substituted leniently: missing values become
 *    empty strings, empty parenthetical blocks collapse so we don't ship
 *    "({color})" when no variation is selected.
 */

export interface BuildWhatsAppUrlInput {
  /** Raw number from settings; may include '+' and spaces. Sanitised here. */
  phoneNumber: string | null | undefined;
  /** Custom message template. Leave null to use DEFAULT_MESSAGE_TEMPLATE. */
  template?: string | null;
  /** Product context. */
  product: {
    name: string;
    sku?: string | null;
    brand?: string | null;
    slug: string;
  };
  /** Currently-selected variation, if any. */
  variation?: { colorName?: string | null } | null;
  /** Absolute URL of the product page (used for {product_url}). */
  productUrl: string;
}

export interface BuiltWhatsAppUrl {
  /** Sanitised digits-only phone number. */
  phoneNumber: string;
  /** Plain-text message (URL-decoded). */
  message: string;
  /** Ready-to-use https://wa.me/... URL. */
  url: string;
}

export const DEFAULT_MESSAGE_TEMPLATE =
  'Hello, I am interested in {product_name}{ ({color})}.{ SKU: {sku}.} Link: {product_url}';

/**
 * Returns a wa.me link for the product + selected variation, or null when
 * the phone number is missing or unusable.
 */
export function buildWhatsAppUrl(input: BuildWhatsAppUrlInput): BuiltWhatsAppUrl | null {
  const phone = sanitizePhoneNumber(input.phoneNumber);
  if (!phone) return null;

  const template = (input.template ?? '').trim() || DEFAULT_MESSAGE_TEMPLATE;

  const values: Record<string, string> = {
    product_name: input.product.name,
    sku:          input.product.sku ?? '',
    brand:        input.product.brand ?? '',
    color:        input.variation?.colorName ?? '',
    product_url:  input.productUrl,
  };

  const message = applyTemplate(template, values);
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  return { phoneNumber: phone, message, url };
}

/**
 * Strips everything except digits. Returns null when the result is too short
 * to plausibly be a phone number (matches the backend's 6-digit minimum).
 */
export function sanitizePhoneNumber(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const digits = String(raw).replace(/\D/g, '');
  return digits.length >= 6 && digits.length <= 20 ? digits : null;
}

/**
 * Two-pass substitution:
 *   1. Optional blocks of the form `{literal {placeholder} literal}` are
 *      kept only if every placeholder inside them resolves to a non-empty
 *      value. This lets templates write "{ ({color})}" and have the
 *      parentheses disappear when no color is selected.
 *   2. Remaining `{placeholder}` tokens are replaced with their value, or
 *      left as an empty string if unknown.
 *
 * Everything is whitespace-collapsed at the end to avoid double spaces
 * where optional blocks got removed.
 */
export function applyTemplate(template: string, values: Record<string, string>): string {
  // Pass 1 — optional blocks: "{ literal {key} literal }"
  const withOptional = template.replace(/\{([^{}]*\{([a-z_]+)\}[^{}]*)\}/gi, (_m, inner: string) => {
    const placeholders = Array.from(inner.matchAll(/\{([a-z_]+)\}/gi)).map((x) => x[1]!);
    const allResolved = placeholders.every((k) => (values[k] ?? '').length > 0);
    if (!allResolved) return '';
    return inner.replace(/\{([a-z_]+)\}/gi, (_, k: string) => values[k] ?? '');
  });

  // Pass 2 — remaining bare placeholders
  const resolved = withOptional.replace(/\{([a-z_]+)\}/gi, (_m, k: string) => values[k] ?? '');

  // Tidy: collapse repeated whitespace and trim.
  return resolved.replace(/[ \t]+/g, ' ').replace(/\s+([.,!?])/g, '$1').trim();
}
