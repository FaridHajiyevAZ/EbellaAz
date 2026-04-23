package com.company.furniturecatalog.dto.publicapi;

import com.company.furniturecatalog.domain.enums.HomeSectionType;

import java.util.Map;
import java.util.UUID;

/**
 * Public-facing section payload. {@code type} is the enum value — the React
 * app binds sections to components by switching on this field.
 */
public record HomeSectionPublicDto(
        UUID id,
        HomeSectionType type,
        String title,
        String subtitle,
        String body,
        String imageUrl,
        Map<String, Object> config,
        int sortOrder
) {}
