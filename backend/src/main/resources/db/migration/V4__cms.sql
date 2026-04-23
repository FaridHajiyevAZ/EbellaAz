-- =============================================================
-- V4 — CMS: hero slides, homepage sections, contact info, site settings
-- =============================================================

-- ----------------------------------------------------------------
-- hero_slides
-- ----------------------------------------------------------------
CREATE TABLE hero_slides (
    id              UUID         PRIMARY KEY,

    title           VARCHAR(200) NOT NULL,
    subtitle        VARCHAR(400),
    cta_text        VARCHAR(80),
    cta_url         VARCHAR(500),
    image_key       TEXT,

    sort_order      INTEGER      NOT NULL DEFAULT 0,
    status          VARCHAR(32)  NOT NULL DEFAULT 'PUBLISHED'
                    CHECK (status IN ('DRAFT','PUBLISHED','ARCHIVED')),

    starts_at       TIMESTAMPTZ,
    ends_at         TIMESTAMPTZ,

    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    created_by      UUID,
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_by      UUID,
    version         BIGINT       NOT NULL DEFAULT 0,
    deleted_at      TIMESTAMPTZ,

    CONSTRAINT chk_hero_window
        CHECK (ends_at IS NULL OR starts_at IS NULL OR ends_at > starts_at)
);

CREATE INDEX idx_hero_slides_sort
    ON hero_slides (sort_order)
    WHERE status = 'PUBLISHED' AND deleted_at IS NULL;

CREATE TRIGGER trg_hero_slides_updated_at
    BEFORE UPDATE ON hero_slides
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------
-- home_sections
-- ----------------------------------------------------------------
CREATE TABLE home_sections (
    id              UUID         PRIMARY KEY,

    section_type    VARCHAR(40)  NOT NULL
                    CHECK (section_type IN (
                        'HERO_BANNER',
                        'FEATURED_CATEGORIES',
                        'FEATURED_PRODUCTS',
                        'PROMO_BANNER',
                        'TEXT_BLOCK',
                        'IMAGE_GRID',
                        'CTA_STRIP'
                    )),
    title           VARCHAR(200),
    subtitle        VARCHAR(400),
    body            TEXT,
    image_key       TEXT,

    config          JSONB        NOT NULL DEFAULT '{}'::jsonb,
    sort_order      INTEGER      NOT NULL DEFAULT 0,
    status          VARCHAR(32)  NOT NULL DEFAULT 'PUBLISHED'
                    CHECK (status IN ('DRAFT','PUBLISHED','ARCHIVED')),

    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    created_by      UUID,
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_by      UUID,
    version         BIGINT       NOT NULL DEFAULT 0,
    deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_home_sections_sort
    ON home_sections (sort_order)
    WHERE status = 'PUBLISHED' AND deleted_at IS NULL;

CREATE TRIGGER trg_home_sections_updated_at
    BEFORE UPDATE ON home_sections
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------
-- contact_info
-- ----------------------------------------------------------------
CREATE TABLE contact_info (
    id               UUID         PRIMARY KEY,

    label            VARCHAR(120) NOT NULL,
    locale           VARCHAR(10)  NOT NULL DEFAULT 'en',
    phone            VARCHAR(40),
    email            VARCHAR(160),
    whatsapp_number  VARCHAR(40),

    address_line1    VARCHAR(200),
    address_line2    VARCHAR(200),
    city             VARCHAR(120),
    country          VARCHAR(120),
    postal_code      VARCHAR(20),
    map_url          VARCHAR(500),

    working_hours    JSONB,

    is_primary       BOOLEAN      NOT NULL DEFAULT TRUE,

    created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    created_by       UUID,
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_by       UUID,
    version          BIGINT       NOT NULL DEFAULT 0
);

-- Allow at most one primary block per locale.
CREATE UNIQUE INDEX uq_contact_info_primary_per_locale
    ON contact_info (locale)
    WHERE is_primary = TRUE;

CREATE TRIGGER trg_contact_info_updated_at
    BEFORE UPDATE ON contact_info
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------
-- site_settings (key/value, natural PK)
-- ----------------------------------------------------------------
CREATE TABLE site_settings (
    key             VARCHAR(80)  PRIMARY KEY,
    value           JSONB        NOT NULL,
    description     VARCHAR(255),
    is_public       BOOLEAN      NOT NULL DEFAULT TRUE,

    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_site_settings_updated_at
    BEFORE UPDATE ON site_settings
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
