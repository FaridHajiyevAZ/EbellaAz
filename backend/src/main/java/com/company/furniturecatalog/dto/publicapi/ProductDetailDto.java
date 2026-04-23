package com.company.furniturecatalog.dto.publicapi;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Single-call product detail payload for the React PDP:
 *  - product basics
 *  - full breadcrumb trail
 *  - all variations with their image galleries
 *  - the default variation id to pre-select on load
 *  - a prebuilt WhatsApp inquiry (phone + message + wa.me url)
 */
public record ProductDetailDto(
        UUID id,
        String sku,
        String slug,
        String name,
        String brand,
        String shortDescription,
        String longDescription,
        Map<String, Object> dimensions,
        List<String> materials,
        Map<String, Object> specs,
        List<BreadcrumbDto> breadcrumbs,
        UUID defaultVariationId,
        List<ProductVariationPublicDto> variations,
        WhatsAppInquiryDto whatsappInquiry
) {}
