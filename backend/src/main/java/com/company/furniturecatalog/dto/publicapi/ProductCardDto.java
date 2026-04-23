package com.company.furniturecatalog.dto.publicapi;

import java.util.List;
import java.util.UUID;

/**
 * Slim payload for listings and search results. Only the cover image of the
 * default variation is returned — full galleries are fetched on the PDP.
 */
public record ProductCardDto(
        UUID id,
        String slug,
        String name,
        String brand,
        String shortDescription,
        String coverImageUrl,
        List<String> availableColorHexes
) {}
