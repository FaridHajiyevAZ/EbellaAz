package com.company.furniturecatalog.domain;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;

/**
 * Extends {@link BaseEntity} with a soft-delete marker.
 * Applied to entities whose removal should be recoverable (categories, products,
 * variations, images, hero slides, home sections, admin users).
 *
 * Service queries must filter {@code deletedAt IS NULL}; partial unique indexes
 * in the schema exclude soft-deleted rows from uniqueness rules.
 */
@Getter
@Setter
@MappedSuperclass
public abstract class SoftDeletableEntity extends BaseEntity {

    @Column(name = "deleted_at")
    private OffsetDateTime deletedAt;

    public boolean isDeleted() {
        return deletedAt != null;
    }

    public void markDeleted() {
        this.deletedAt = OffsetDateTime.now();
    }

    public void restore() {
        this.deletedAt = null;
    }
}
