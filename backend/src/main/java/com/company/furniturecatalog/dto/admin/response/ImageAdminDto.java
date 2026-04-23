package com.company.furniturecatalog.dto.admin.response;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

public record ImageAdminDto(
        UUID id,
        UUID variationId,
        String storageKey,
        String url,
        Map<String, String> renditions,
        String altText,
        String contentType,
        Long sizeBytes,
        Integer width,
        Integer height,
        int sortOrder,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {}
