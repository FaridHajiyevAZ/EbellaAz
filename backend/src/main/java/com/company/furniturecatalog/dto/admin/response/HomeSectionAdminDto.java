package com.company.furniturecatalog.dto.admin.response;

import com.company.furniturecatalog.domain.enums.ContentStatus;
import com.company.furniturecatalog.domain.enums.HomeSectionType;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

public record HomeSectionAdminDto(
        UUID id,
        HomeSectionType sectionType,
        String title,
        String subtitle,
        Map<String, Object> config,
        int sortOrder,
        ContentStatus status,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt,
        OffsetDateTime deletedAt
) {}
