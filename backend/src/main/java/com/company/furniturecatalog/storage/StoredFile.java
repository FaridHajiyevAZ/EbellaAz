package com.company.furniturecatalog.storage;

/**
 * Metadata returned after a successful upload. {@link #storageKey()} is what
 * gets persisted on the owning entity; {@link #url()} is the ready-to-serve
 * URL built from the configured public base URL.
 */
public record StoredFile(
        String originalFilename,
        String storedFilename,
        String storageKey,
        String url,
        String contentType,
        long sizeBytes,
        Integer width,
        Integer height
) {}
