import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageCircle, Phone } from 'lucide-react';
import type { ProductDetail, ProductVariationPublic } from '@/types/api';
import { Button, ButtonProps } from '@/components/ui/Button';
import { usePublicSettings } from '@/hooks/useCatalog';
import { buildWhatsAppUrl } from '@/utils/whatsapp';
import { env } from '@/utils/env';
import { cn } from '@/utils/cn';

type Variant = ButtonProps['variant'];
type Size = ButtonProps['size'];

interface Props {
  product: ProductDetail;
  /** Currently-selected variation. Updates the pre-filled message live. */
  variation: ProductVariationPublic | null;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  compact?: boolean;
  className?: string;
  /** Accepts a custom label override, e.g. "Inquire" for the sticky mobile bar. */
  label?: string;
}

/**
 * Reusable WhatsApp inquiry CTA.
 *
 *  - Reads number + template + public base URL from /public/settings,
 *    falling back to the backend-prebuilt inquiry on the product, then
 *    to a sensible default template.
 *  - Rebuilds the message on every render so changing the selected color
 *    swatch updates the pre-filled text instantly.
 *  - Gracefully degrades to a "Contact us" link when no WhatsApp number
 *    has been configured yet.
 */
export function WhatsAppInquiryButton({
  product,
  variation,
  variant = 'accent',
  size = 'lg',
  fullWidth,
  compact,
  className,
  label,
}: Props) {
  const { data: settings } = usePublicSettings();

  const built = useMemo(() => {
    const phoneFromSettings = asString(settings?.['whatsapp.number']);
    const phoneFromBackend  = product.whatsappInquiry?.phoneNumber ?? null;
    const template          = asString(settings?.['whatsapp.message_template']);
    const baseUrl = asString(settings?.['site.public_base_url']) ?? env.publicSiteUrl;
    const origin  = baseUrl?.replace(/\/+$/, '') || (typeof window !== 'undefined' ? window.location.origin : '');

    return buildWhatsAppUrl({
      phoneNumber: phoneFromSettings ?? phoneFromBackend,
      template,
      product: {
        name: product.name,
        sku: product.sku,
        brand: product.brand,
        slug: product.slug,
      },
      variation,
      productUrl: `${origin}/product/${product.slug}`,
    });
  }, [settings, product, variation]);

  // --- Fallback path: no usable phone number ---
  if (!built) {
    return (
      <Button
        variant="outline"
        size={size}
        className={cn(fullWidth && 'w-full sm:w-auto', className)}
        asChild={false}
      >
        <Link to="/contact">
          <Phone className="h-4 w-4" />
          Contact us
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    );
  }

  const visibleLabel = label ?? (compact ? 'Inquire' : 'Inquire on WhatsApp');

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(fullWidth && 'w-full sm:w-auto', className)}
      asChild={false}
    >
      <a
        href={built.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Open WhatsApp chat about ${product.name}`}
        title={built.message}
      >
        <MessageCircle className="h-4 w-4" />
        {visibleLabel}
        {!compact && <ArrowRight className="h-4 w-4" />}
      </a>
    </Button>
  );
}

function asString(v: unknown): string | null {
  return typeof v === 'string' && v.length > 0 ? v : null;
}
