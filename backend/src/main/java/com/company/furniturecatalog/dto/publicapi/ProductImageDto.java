package com.company.furniturecatalog.dto.publicapi;

import java.util.Map;
import java.util.UUID;

/**
 * Image usable directly in a &lt;picture&gt; / &lt;img srcset&gt;.
 * {@code url} is the full-size image; {@code renditions} holds pre-generated
 * variants keyed by label (e.g. "sm", "md", "lg", "webp").
 */
public record ProductImageDto(
        UUID id,
        String url,
        Map<String, String> renditions,
        String altText,
        Integer width,
        Integer height,
        int sortOrder
) {}
