package com.company.furniturecatalog.dto.admin.response;

import com.company.furniturecatalog.domain.enums.ContentStatus;

import java.time.OffsetDateTime;
import java.util.UUID;

public record CategoryAdminDto(
        UUID id,
        UUID parentId,
        String name,
        String slug,
        String description,
        String coverImageKey,
        String coverImageUrl,
        String path,
        int depth,
        int sortOrder,
        ContentStatus status,
        String metaTitle,
        String metaDescription,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt,
        OffsetDateTime deletedAt
) {}
