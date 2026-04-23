package com.company.furniturecatalog.dto.publicapi;

import java.util.List;

/**
 * Bundled payload for GET /public/home — slides, sections, and featured
 * product shortlists in a single round-trip.
 */
public record HomePagePayloadDto(
        List<HeroSlidePublicDto> heroSlides,
        List<HomeSectionPublicDto> sections,
        List<ProductCardDto> featuredProducts
) {}
