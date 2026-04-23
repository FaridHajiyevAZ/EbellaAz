package com.company.furniturecatalog.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;
import java.util.UUID;

/**
 * Enables @CreatedDate / @LastModifiedDate on entities extending BaseEntity,
 * and @CreatedBy / @LastModifiedBy when an authenticated principal exposes a UUID.
 */
@Configuration
@EnableJpaAuditing(auditorAwareRef = "auditorAware", dateTimeProviderRef = "auditingDateTimeProvider")
public class JpaAuditingConfig {

    @Bean
    public AuditorAware<UUID> auditorAware() {
        return () -> {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
                return Optional.empty();
            }
            Object principal = auth.getPrincipal();
            if (principal instanceof AuditablePrincipal ap) {
                return Optional.ofNullable(ap.getUserId());
            }
            return Optional.empty();
        };
    }

    @Bean
    public org.springframework.data.auditing.DateTimeProvider auditingDateTimeProvider() {
        return () -> Optional.of(java.time.OffsetDateTime.now(java.time.ZoneOffset.UTC));
    }

    /** Implemented by the JWT principal so auditing can attribute changes to a user id. */
    public interface AuditablePrincipal {
        UUID getUserId();
    }
}
