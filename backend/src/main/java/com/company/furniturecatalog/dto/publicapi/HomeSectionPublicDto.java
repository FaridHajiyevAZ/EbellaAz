package com.company.furniturecatalog.dto.publicapi;

import com.company.furniturecatalog.domain.enums.HomeSectionType;

import java.util.Map;
import java.util.UUID;

public record HomeSectionPublicDto(
        UUID id,
        HomeSectionType type,
        String title,
        String subtitle,
        Map<String, Object> config,
        int sortOrder
) {}
