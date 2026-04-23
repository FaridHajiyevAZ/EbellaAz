-- =============================================================
-- V6 — Seed default site settings
-- Idempotent: ON CONFLICT keeps any value an operator already set.
-- =============================================================

INSERT INTO site_settings (key, value, description, is_public) VALUES
    ('site.name',                '"Ebella"'::jsonb,
        'Site brand name', TRUE),
    ('site.public_base_url',     '"http://localhost:5173"'::jsonb,
        'Public site origin used in WhatsApp links and emails', TRUE),
    ('seo.default_title',        '"Ebella — Premium Furniture"'::jsonb,
        'Default <title> for pages without one', TRUE),
    ('seo.default_description',  '"Premium mattresses, office, and home furniture."'::jsonb,
        'Default meta description', TRUE),
    ('whatsapp.number',          '""'::jsonb,
        'WhatsApp number used by the inquiry button (digits only)', TRUE),
    ('whatsapp.message_template',
        '"Hello, I am interested in {product_name}{ ({color})}.{ SKU: {sku}.} Link: {product_url}"'::jsonb,
        'Pre-filled WhatsApp inquiry template; supports optional blocks via { … {placeholder} … }',
        TRUE),
    ('social.instagram',         '""'::jsonb,  'Instagram URL', TRUE),
    ('social.facebook',          '""'::jsonb,  'Facebook URL',  TRUE),
    ('social.tiktok',            '""'::jsonb,  'TikTok URL',    TRUE),
    ('social.youtube',           '""'::jsonb,  'YouTube URL',   TRUE)
ON CONFLICT (key) DO NOTHING;
