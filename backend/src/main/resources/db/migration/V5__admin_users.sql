-- =============================================================
-- V5 — Admin users
-- =============================================================

CREATE TABLE admin_users (
    id              UUID         PRIMARY KEY,

    email           CITEXT       NOT NULL,
    password_hash   TEXT         NOT NULL,
    full_name       VARCHAR(160) NOT NULL,

    role            VARCHAR(32)  NOT NULL DEFAULT 'EDITOR'
                    CHECK (role IN ('SUPER_ADMIN','EDITOR')),
    status          VARCHAR(32)  NOT NULL DEFAULT 'ACTIVE'
                    CHECK (status IN ('ACTIVE','DISABLED')),

    last_login_at   TIMESTAMPTZ,

    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    created_by      UUID,
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_by      UUID,
    version         BIGINT       NOT NULL DEFAULT 0,
    deleted_at      TIMESTAMPTZ,

    CONSTRAINT uq_admin_users_email UNIQUE (email)
);

CREATE INDEX idx_admin_users_status
    ON admin_users (status) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_admin_users_updated_at
    BEFORE UPDATE ON admin_users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
