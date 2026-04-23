package com.company.furniturecatalog.dto.publicapi;

import java.util.List;
import java.util.UUID;

/**
 * Nested category tree node for the public menu. Kept flat and compact so the
 * React app can render nested navigation from a single GET /public/categories call.
 */
public record CategoryTreeNodeDto(
        UUID id,
        String name,
        String slug,
        String fullPath,
        int depth,
        int sortOrder,
        List<CategoryTreeNodeDto> children
) {}
