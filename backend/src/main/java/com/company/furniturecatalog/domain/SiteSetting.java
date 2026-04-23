package com.company.furniturecatalog.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.OffsetDateTime;
import java.util.Objects;

/**
 * Key/value store for lightweight global config (SEO defaults, feature flags,
 * WhatsApp number, etc.). Uses the natural {@code key} as PK rather than a UUID —
 * lookups are always by key and the set is small.
 */
@Entity
@Table(name = "site_settings")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@ToString(onlyExplicitlyIncluded = true)
public class SiteSetting {

    @Id
    @ToString.Include
    @Column(name = "key", length = 80, nullable = false, updatable = false)
    private String key;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "value", columnDefinition = "jsonb", nullable = false)
    private Object value;

    @Column(name = "description", length = 255)
    private String description;

    @Column(name = "is_public", nullable = false)
    private boolean publicSetting = true;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @Override
    public boolean equals(Object other) {
        if (this == other) return true;
        if (!(other instanceof SiteSetting that)) return false;
        return key != null && key.equals(that.key);
    }

    @Override
    public int hashCode() {
        return Objects.hash(key);
    }
}
