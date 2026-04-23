package com.company.furniturecatalog.storage;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

/**
 * Builds storage keys per domain area. Keeps the folder layout in one place
 * so the code that hands variables to {@link StorageService} never assembles
 * paths ad-hoc.
 *
 * Layout produced:
 * <pre>
 *   products/{productId}/variations/{variationId}/
 *   categories/{categoryId}/covers/
 *   hero-slides/
 *   site-assets/
 * </pre>
 */
public final class MediaDomain {

    private MediaDomain() {}

    public static List<String> productVariation(UUID productId, UUID variationId) {
        Objects.requireNonNull(productId,   "productId");
        Objects.requireNonNull(variationId, "variationId");
        return List.of("products", productId.toString(), "variations", variationId.toString());
    }

    public static List<String> categoryCover(UUID categoryId) {
        Objects.requireNonNull(categoryId, "categoryId");
        return List.of("categories", categoryId.toString(), "covers");
    }

    public static List<String> heroSlide() {
        return List.of("hero-slides");
    }

    public static List<String> siteAsset() {
        return List.of("site-assets");
    }
}
