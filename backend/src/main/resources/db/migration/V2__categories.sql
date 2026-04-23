-- =============================================================
-- V2 — Categories (self-referencing tree)
-- =============================================================

CREATE TABLE categories (
    id                 UUID         PRIMARY KEY,
    parent_id          UUID         REFERENCES categories(id) ON DELETE RESTRICT,

    name               VARCHAR(160) NOT NULL,
    slug               VARCHAR(160) NOT NULL,
    description        TEXT,
    cover_image_key    TEXT,

    -- Materialised tree path (e.g. 'home_furniture.sofas.corner_sofas')
    path               LTREE,
    depth              SMALLINT     NOT NULL DEFAULT 0 CHECK (depth >= 0),
    sort_order         INTEGER      NOT NULL DEFAULT 0,

    status             VARCHAR(32)  NOT NULL DEFAULT 'PUBLISHED'
                       CHECK (status IN ('DRAFT','PUBLISHED','ARCHIVED')),

    meta_title         VARCHAR(180),
    meta_description   VARCHAR(320),

    created_at         TIMESTAMPTZ  NOT NULL DEFAULT now(),
    created_by         UUID,
    updated_at         TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_by         UUID,
    version            BIGINT       NOT NULL DEFAULT 0,
    deleted_at         TIMESTAMPTZ,

    CONSTRAINT chk_categories_slug_format
        CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
    CONSTRAINT chk_categories_not_self_parent
        CHECK (parent_id IS NULL OR parent_id <> id)
);

-- Slug uniqueness scoped to parent (NULL parent treated as root group).
CREATE UNIQUE INDEX uq_categories_slug_per_parent
    ON categories (COALESCE(parent_id, '00000000-0000-0000-0000-000000000000'::uuid), slug)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_categories_parent_id
    ON categories (parent_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_categories_status
    ON categories (status, sort_order) WHERE deleted_at IS NULL;
CREATE INDEX idx_categories_path_gist
    ON categories USING GIST (path);

CREATE TRIGGER trg_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
