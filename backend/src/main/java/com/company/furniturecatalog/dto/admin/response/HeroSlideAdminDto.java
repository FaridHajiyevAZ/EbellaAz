package com.company.furniturecatalog.dto.admin.response;

import com.company.furniturecatalog.domain.enums.ContentStatus;

import java.time.OffsetDateTime;
import java.util.UUID;

public record HeroSlideAdminDto(
        UUID id,
        String title,
        String subtitle,
        String ctaText,
        String ctaUrl,
        String imageKey,
        String imageUrl,
        int sortOrder,
        ContentStatus status,
        OffsetDateTime startsAt,
        OffsetDateTime endsAt,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt,
        OffsetDateTime deletedAt
) {}
