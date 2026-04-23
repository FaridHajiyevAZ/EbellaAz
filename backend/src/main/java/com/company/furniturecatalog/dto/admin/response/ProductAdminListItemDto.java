package com.company.furniturecatalog.dto.admin.response;

import com.company.furniturecatalog.domain.enums.ProductStatus;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Slim row for admin product tables (search / pagination).
 */
public record ProductAdminListItemDto(
        UUID id,
        String sku,
        String slug,
        String name,
        String brand,
        UUID categoryId,
        String categoryName,
        ProductStatus status,
        boolean featured,
        int sortOrder,
        int variationsCount,
        String coverImageUrl,
        OffsetDateTime updatedAt
) {}
