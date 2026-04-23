package com.company.furniturecatalog.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.util.unit.DataSize;

import java.util.List;

@ConfigurationProperties(prefix = "app.storage")
public record StorageProperties(
        Provider provider,
        Local local,
        Images images
) {
    public enum Provider { LOCAL, S3 }

    public record Local(
            String rootPath,
            String publicBaseUrl,
            String urlPath
    ) {}

    /**
     * Upload rules applied to every image that goes through the media module.
     * Declared centrally so admin endpoints, validators, and front-end
     * previews stay in sync.
     */
    public record Images(
            DataSize maxSize,
            List<String> allowedContentTypes,
            List<String> allowedExtensions
    ) {}
}
