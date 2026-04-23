package com.company.furniturecatalog.dto.admin.request;

import com.company.furniturecatalog.domain.enums.ProductStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public record CreateProductRequest(
        @NotNull
        UUID categoryId,

        @NotBlank
        @Size(max = 64)
        @Pattern(regexp = "^[A-Z0-9][A-Z0-9\\-_]{1,63}$", message = "sku must be upper-case alphanumeric with - or _")
        String sku,

        @NotBlank
        @Size(max = 200)
        @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$")
        String slug,

        @NotBlank
        @Size(max = 200)
        String name,

        @Size(max = 120)
        String brand,

        @Size(max = 500)
        String shortDescription,

        String longDescription,

        Map<String, Object> dimensions,
        List<String> materials,
        Map<String, Object> specs,

        ProductStatus status,
        Boolean featured,

        @PositiveOrZero
        Integer sortOrder,

        @Size(max = 180) String metaTitle,
        @Size(max = 320) String metaDescription
) {}
