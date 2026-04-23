package com.company.furniturecatalog.dto.publicapi;

import java.util.List;
import java.util.UUID;

/**
 * Public variation payload. Galleries are embedded so selecting a color on the
 * React product page swaps images with zero additional requests.
 */
public record ProductVariationPublicDto(
        UUID id,
        String colorName,
        String colorHex,
        String stockStatusText,
        boolean isDefault,
        int sortOrder,
        UUID primaryImageId,
        List<ProductImageDto> images
) {}
