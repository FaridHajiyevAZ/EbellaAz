package com.company.furniturecatalog.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.storage")
public record StorageProperties(
        Provider provider,
        Local local
) {
    public enum Provider { LOCAL, S3 }

    public record Local(
            String rootPath,
            String publicBaseUrl,
            String urlPath
    ) {
    }
}
