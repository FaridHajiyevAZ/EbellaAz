package com.company.furniturecatalog.util;

/**
 * Canonical keys for {@link com.company.furniturecatalog.domain.SiteSetting}.
 * Extending the CMS with a new setting means adding one constant here and
 * documenting it — the storage shape never changes.
 */
public final class SiteSettingKeys {

    private SiteSettingKeys() {}

    // --- Branding / SEO -------------------------------------------------
    public static final String SITE_NAME           = "site.name";
    public static final String SITE_LOGO_KEY       = "site.logo_key";
    public static final String SITE_META_DESC      = "seo.default_description";
    public static final String SITE_META_TITLE     = "seo.default_title";
    public static final String SITE_PUBLIC_BASE_URL = "site.public_base_url";

    // --- Contact / social ----------------------------------------------
    public static final String CONTACT_PHONE       = "contact.phone";
    public static final String CONTACT_EMAIL       = "contact.email";
    public static final String CONTACT_ADDRESS     = "contact.address";
    public static final String WHATSAPP_NUMBER     = "whatsapp.number";
    public static final String WHATSAPP_TEMPLATE   = "whatsapp.message_template";
    public static final String SOCIAL_INSTAGRAM    = "social.instagram";
    public static final String SOCIAL_FACEBOOK     = "social.facebook";
    public static final String SOCIAL_TIKTOK       = "social.tiktok";
    public static final String SOCIAL_YOUTUBE      = "social.youtube";

    // --- Business ------------------------------------------------------
    public static final String BUSINESS_HOURS      = "business.working_hours";
}
