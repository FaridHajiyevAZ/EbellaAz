package com.company.furniturecatalog.dto.publicapi;

import java.util.UUID;

public record BreadcrumbDto(
        UUID id,
        String name,
        String slug,
        String fullPath
) {}
