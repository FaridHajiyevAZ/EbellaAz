package com.company.furniturecatalog.dto.admin.request;

import com.company.furniturecatalog.domain.enums.ContentStatus;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.time.OffsetDateTime;

public record UpdateHeroSlideRequest(
        @Size(max = 200) String title,
        @Size(max = 400) String subtitle,
        @Size(max = 80)  String ctaText,
        @Size(max = 500) String ctaUrl,
        String imageKey,
        @PositiveOrZero Integer sortOrder,
        ContentStatus status,
        OffsetDateTime startsAt,
        OffsetDateTime endsAt
) {}
