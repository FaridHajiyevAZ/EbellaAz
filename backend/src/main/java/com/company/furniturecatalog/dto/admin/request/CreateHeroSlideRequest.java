package com.company.furniturecatalog.dto.admin.request;

import com.company.furniturecatalog.domain.enums.ContentStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.time.OffsetDateTime;

/**
 * Typical flow: POST this payload first (imageKey omitted), then upload the
 * image via PUT /admin/media/hero-slides/{slideId}/image, which sets the key.
 * Clients that already have a storage key may pass it directly.
 */
public record CreateHeroSlideRequest(
        @NotBlank @Size(max = 200) String title,
        @Size(max = 400) String subtitle,
        @Size(max = 80)  String ctaText,
        @Size(max = 500) String ctaUrl,

        String imageKey,

        @PositiveOrZero Integer sortOrder,
        ContentStatus status,

        OffsetDateTime startsAt,
        OffsetDateTime endsAt
) {}
