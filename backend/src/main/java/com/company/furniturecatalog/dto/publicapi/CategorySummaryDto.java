package com.company.furniturecatalog.dto.publicapi;

import java.util.UUID;

public record CategorySummaryDto(
        UUID id,
        String name,
        String slug,
        String fullPath,
        String coverImageUrl
) {}
