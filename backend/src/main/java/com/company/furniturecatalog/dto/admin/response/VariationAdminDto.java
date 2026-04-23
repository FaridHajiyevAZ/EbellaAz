package com.company.furniturecatalog.dto.admin.response;

import com.company.furniturecatalog.domain.enums.VariationStatus;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record VariationAdminDto(
        UUID id,
        UUID productId,
        String colorName,
        String colorHex,
        String variationSku,
        String stockStatusText,
        boolean isDefault,
        int sortOrder,
        VariationStatus status,
        UUID primaryImageId,
        List<ImageAdminDto> images,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt,
        OffsetDateTime deletedAt
) {}
