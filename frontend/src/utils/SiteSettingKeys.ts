/**
 * Canonical site-setting keys. Mirrors the Java constants on the backend so
 * we reference the same strings everywhere.
 */
export const SiteSettingKeys = {
  // Branding / SEO
  SITE_NAME:           'site.name',
  SITE_LOGO_KEY:       'site.logo_key',
  SITE_META_DESC:      'seo.default_description',
  SITE_META_TITLE:     'seo.default_title',
  SITE_PUBLIC_BASE_URL: 'site.public_base_url',

  // Contact / social
  CONTACT_PHONE:       'contact.phone',
  CONTACT_EMAIL:       'contact.email',
  CONTACT_ADDRESS:     'contact.address',
  WHATSAPP_NUMBER:     'whatsapp.number',
  WHATSAPP_TEMPLATE:   'whatsapp.message_template',
  SOCIAL_INSTAGRAM:    'social.instagram',
  SOCIAL_FACEBOOK:     'social.facebook',
  SOCIAL_TIKTOK:       'social.tiktok',
  SOCIAL_YOUTUBE:      'social.youtube',

  // Business
  BUSINESS_HOURS:      'business.working_hours',
} as const;

export type SiteSettingKey = typeof SiteSettingKeys[keyof typeof SiteSettingKeys];
