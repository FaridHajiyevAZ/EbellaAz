package com.company.furniturecatalog.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Config for the one-shot admin seed. The runner only executes when
 * {@code enabled=true} AND the DB has no active admins yet. In prod,
 * keep this disabled unless you're bootstrapping a fresh environment.
 */
@ConfigurationProperties(prefix = "app.security.bootstrap-admin")
public record BootstrapAdminProperties(
        boolean enabled,
        String email,
        String password,
        String fullName
) {
}
