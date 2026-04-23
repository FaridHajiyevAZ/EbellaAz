package com.company.furniturecatalog.dto.admin.request;

import com.company.furniturecatalog.domain.enums.ProductStatus;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public record UpdateProductRequest(
        UUID categoryId,

        @Size(max = 64)
        @Pattern(regexp = "^[A-Z0-9][A-Z0-9\\-_]{1,63}$")
        String sku,

        @Size(max = 200)
        @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$")
        String slug,

        @Size(max = 200) String name,
        @Size(max = 120) String brand,
        @Size(max = 500) String shortDescription,
        String longDescription,

        Map<String, Object> dimensions,
        List<String> materials,
        Map<String, Object> specs,

        ProductStatus status,
        Boolean featured,

        @PositiveOrZero Integer sortOrder,

        @Size(max = 180) String metaTitle,
        @Size(max = 320) String metaDescription
) {}
