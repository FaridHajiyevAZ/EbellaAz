package com.company.furniturecatalog.domain;

import com.company.furniturecatalog.domain.enums.ContentStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.OffsetDateTime;

@Entity
@Table(
        name = "hero_slides",
        indexes = {
                @Index(name = "idx_hero_slides_sort", columnList = "sort_order")
        }
)
@Getter
@Setter
@NoArgsConstructor
@ToString(onlyExplicitlyIncluded = true)
public class HeroSlide extends SoftDeletableEntity {

    @ToString.Include
    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "subtitle", length = 400)
    private String subtitle;

    @Column(name = "cta_text", length = 80)
    private String ctaText;

    @Column(name = "cta_url", length = 500)
    private String ctaUrl;

    @Column(name = "image_key", nullable = false, columnDefinition = "text")
    private String imageKey;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    private ContentStatus status = ContentStatus.PUBLISHED;

    @Column(name = "starts_at")
    private OffsetDateTime startsAt;

    @Column(name = "ends_at")
    private OffsetDateTime endsAt;
}
