-- =============================================================
-- V3 — Products, variations, variation images
-- =============================================================

CREATE TABLE products (
    id                 UUID         PRIMARY KEY,
    category_id        UUID         NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,

    sku                VARCHAR(64)  NOT NULL,
    slug               VARCHAR(200) NOT NULL,
    name               VARCHAR(200) NOT NULL,
    brand              VARCHAR(120),

    short_description  VARCHAR(500),
    long_description   TEXT,

    dimensions         JSONB,
    materials          TEXT[]       NOT NULL DEFAULT '{}',
    specs              JSONB        NOT NULL DEFAULT '{}'::jsonb,

    status             VARCHAR(32)  NOT NULL DEFAULT 'DRAFT'
                       CHECK (status IN ('DRAFT','PUBLISHED','OUT_OF_STOCK','ARCHIVED')),
    is_featured        BOOLEAN      NOT NULL DEFAULT FALSE,
    sort_order         INTEGER      NOT NULL DEFAULT 0,

    meta_title         VARCHAR(180),
    meta_description   VARCHAR(320),

    published_at       TIMESTAMPTZ,

    -- Maintained by trigger; powers /admin and /public search.
    search_tsv         TSVECTOR,

    created_at         TIMESTAMPTZ  NOT NULL DEFAULT now(),
    created_by         UUID,
    updated_at         TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_by         UUID,
    version            BIGINT       NOT NULL DEFAULT 0,
    deleted_at         TIMESTAMPTZ,

    CONSTRAINT chk_products_slug_format
        CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
    CONSTRAINT chk_products_sku_format
        CHECK (sku ~ '^[A-Z0-9][A-Z0-9\-_]{1,63}$')
);

-- Live-row uniqueness (allows restoring a soft-deleted slug/SKU).
CREATE UNIQUE INDEX uq_products_slug_live
    ON products (slug) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX uq_products_sku_live
    ON products (sku) WHERE deleted_at IS NULL;

CREATE INDEX idx_products_category_id
    ON products (category_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_status
    ON products (status) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_featured
    ON products (is_featured, sort_order DESC, published_at DESC)
    WHERE deleted_at IS NULL;
CREATE INDEX idx_products_updated_at
    ON products (updated_at DESC) WHERE deleted_at IS NULL;

-- Search
CREATE INDEX idx_products_search_tsv ON products USING GIN (search_tsv);
CREATE INDEX idx_products_name_trgm  ON products USING GIN (name gin_trgm_ops);
CREATE INDEX idx_products_specs_gin  ON products USING GIN (specs jsonb_path_ops);
CREATE INDEX idx_products_materials_gin ON products USING GIN (materials);

-- Search vector maintenance
CREATE OR REPLACE FUNCTION products_search_tsv_update()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_tsv :=
        setweight(to_tsvector('simple', coalesce(NEW.name, '')),              'A') ||
        setweight(to_tsvector('simple', coalesce(NEW.brand, '')),             'B') ||
        setweight(to_tsvector('simple', coalesce(NEW.short_description, '')), 'C') ||
        setweight(to_tsvector('simple', coalesce(NEW.long_description, '')),  'D');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_products_search_tsv
    BEFORE INSERT OR UPDATE OF name, brand, short_description, long_description
    ON products
    FOR EACH ROW EXECUTE FUNCTION products_search_tsv_update();

CREATE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================
-- product_variations
-- =============================================================

CREATE TABLE product_variations (
    id                 UUID         PRIMARY KEY,
    product_id         UUID         NOT NULL REFERENCES products(id) ON DELETE CASCADE,

    color_name         VARCHAR(80)  NOT NULL,
    color_hex          CHAR(7)      NOT NULL,
    variation_sku      VARCHAR(64),
    stock_status_text  VARCHAR(80)  NOT NULL DEFAULT 'In stock',

    is_default         BOOLEAN      NOT NULL DEFAULT FALSE,
    sort_order         INTEGER      NOT NULL DEFAULT 0,
    status             VARCHAR(32)  NOT NULL DEFAULT 'ACTIVE'
                       CHECK (status IN ('ACTIVE','INACTIVE')),

    -- Wired after variation_images is created (deferrable to break the cycle).
    primary_image_id   UUID,

    created_at         TIMESTAMPTZ  NOT NULL DEFAULT now(),
    created_by         UUID,
    updated_at         TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_by         UUID,
    version            BIGINT       NOT NULL DEFAULT 0,
    deleted_at         TIMESTAMPTZ,

    CONSTRAINT chk_variation_color_hex
        CHECK (color_hex ~* '^#[0-9A-F]{6}$')
);

-- One color name per product (case-insensitive).
CREATE UNIQUE INDEX uq_variation_color_per_product
    ON product_variations (product_id, lower(color_name))
    WHERE deleted_at IS NULL;

-- variation_sku is globally unique when set.
CREATE UNIQUE INDEX uq_variation_sku_live
    ON product_variations (variation_sku)
    WHERE variation_sku IS NOT NULL AND deleted_at IS NULL;

-- Exactly one default variation per product.
CREATE UNIQUE INDEX uq_variation_default_per_product
    ON product_variations (product_id)
    WHERE is_default = TRUE AND deleted_at IS NULL;

CREATE INDEX idx_variations_product_id
    ON product_variations (product_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_variations_product_sort
    ON product_variations (product_id, sort_order)
    WHERE deleted_at IS NULL AND status = 'ACTIVE';

CREATE TRIGGER trg_product_variations_updated_at
    BEFORE UPDATE ON product_variations
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================
-- variation_images
-- =============================================================

CREATE TABLE variation_images (
    id                 UUID         PRIMARY KEY,
    variation_id       UUID         NOT NULL REFERENCES product_variations(id) ON DELETE CASCADE,

    storage_key        TEXT         NOT NULL UNIQUE,
    alt_text           VARCHAR(255),
    content_type       VARCHAR(80),
    size_bytes         BIGINT       CHECK (size_bytes >= 0),
    width              INTEGER      CHECK (width  > 0),
    height             INTEGER      CHECK (height > 0),

    renditions         JSONB        NOT NULL DEFAULT '{}'::jsonb,
    sort_order         INTEGER      NOT NULL DEFAULT 0,

    created_at         TIMESTAMPTZ  NOT NULL DEFAULT now(),
    created_by         UUID,
    updated_at         TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_by         UUID,
    version            BIGINT       NOT NULL DEFAULT 0,
    deleted_at         TIMESTAMPTZ
);

-- Stable display order — partial unique so soft-deleted rows don't conflict.
CREATE UNIQUE INDEX uq_variation_images_order
    ON variation_images (variation_id, sort_order)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_variation_images_variation_id
    ON variation_images (variation_id, sort_order)
    WHERE deleted_at IS NULL;

CREATE TRIGGER trg_variation_images_updated_at
    BEFORE UPDATE ON variation_images
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Close the deferred FK from variations.primary_image_id.
ALTER TABLE product_variations
    ADD CONSTRAINT fk_variation_primary_image
        FOREIGN KEY (primary_image_id) REFERENCES variation_images(id)
        ON DELETE SET NULL
        DEFERRABLE INITIALLY DEFERRED;
