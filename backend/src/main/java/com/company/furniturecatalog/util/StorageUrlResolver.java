package com.company.furniturecatalog.util;

import com.company.furniturecatalog.config.properties.StorageProperties;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.stream.Collectors;

/**
 * Converts storage keys (as persisted) into publicly-servable URLs.
 * Config-driven so the same code works for local disk today and S3 later.
 */
@Component
public class StorageUrlResolver {

    private final String baseUrl;

    public StorageUrlResolver(StorageProperties properties) {
        String raw = properties.local() != null ? properties.local().publicBaseUrl() : null;
        this.baseUrl = raw == null ? "" : (raw.endsWith("/") ? raw.substring(0, raw.length() - 1) : raw);
    }

    public String publicUrl(String storageKey) {
        if (storageKey == null || storageKey.isBlank()) {
            return null;
        }
        if (storageKey.startsWith("http://") || storageKey.startsWith("https://")) {
            return storageKey;
        }
        String key = storageKey.startsWith("/") ? storageKey.substring(1) : storageKey;
        return baseUrl + "/" + key;
    }

    public Map<String, String> publicUrls(Map<String, String> keyedRenditions) {
        if (keyedRenditions == null || keyedRenditions.isEmpty()) {
            return Map.of();
        }
        return keyedRenditions.entrySet().stream()
                .collect(Collectors.toUnmodifiableMap(Map.Entry::getKey, e -> publicUrl(e.getValue())));
    }
}
