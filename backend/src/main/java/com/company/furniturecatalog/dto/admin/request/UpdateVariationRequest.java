package com.company.furniturecatalog.dto.admin.request;

import com.company.furniturecatalog.domain.enums.VariationStatus;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record UpdateVariationRequest(
        @Size(max = 80) String colorName,

        @Pattern(regexp = "^#[0-9A-Fa-f]{6}$")
        String colorHex,

        @Size(max = 64) String variationSku,
        @Size(max = 80) String stockStatusText,

        Boolean isDefault,

        @PositiveOrZero Integer sortOrder,

        VariationStatus status,

        /** Must reference an image that belongs to this variation. */
        UUID primaryImageId
) {}
