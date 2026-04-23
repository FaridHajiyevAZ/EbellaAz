package com.company.furniturecatalog.dto.admin.response;

import com.company.furniturecatalog.domain.enums.ProductStatus;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public record ProductAdminDetailDto(
        UUID id,
        UUID categoryId,
        String categoryName,
        String sku,
        String slug,
        String name,
        String brand,
        String shortDescription,
        String longDescription,
        Map<String, Object> dimensions,
        List<String> materials,
        Map<String, Object> specs,
        ProductStatus status,
        boolean featured,
        int sortOrder,
        String metaTitle,
        String metaDescription,
        List<VariationAdminDto> variations,
        OffsetDateTime publishedAt,
        OffsetDateTime createdAt,
        UUID createdBy,
        OffsetDateTime updatedAt,
        UUID updatedBy,
        OffsetDateTime deletedAt
) {}
