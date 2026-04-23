package com.company.furniturecatalog.dto.publicapi;

import java.util.UUID;

public record HeroSlidePublicDto(
        UUID id,
        String title,
        String subtitle,
        String ctaText,
        String ctaUrl,
        String imageUrl,
        int sortOrder
) {}
