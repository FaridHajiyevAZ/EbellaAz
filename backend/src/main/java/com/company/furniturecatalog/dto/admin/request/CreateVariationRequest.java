package com.company.furniturecatalog.dto.admin.request;

import com.company.furniturecatalog.domain.enums.VariationStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record CreateVariationRequest(
        @NotBlank
        @Size(max = 80)
        String colorName,

        @NotBlank
        @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "colorHex must be #RRGGBB")
        String colorHex,

        @Size(max = 64)
        String variationSku,

        @Size(max = 80)
        String stockStatusText,

        Boolean isDefault,

        @PositiveOrZero
        Integer sortOrder,

        VariationStatus status
) {}
