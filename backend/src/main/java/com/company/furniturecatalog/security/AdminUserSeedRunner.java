package com.company.furniturecatalog.security;

import com.company.furniturecatalog.config.properties.BootstrapAdminProperties;
import com.company.furniturecatalog.domain.AdminUser;
import com.company.furniturecatalog.domain.enums.AdminRole;
import com.company.furniturecatalog.domain.enums.AdminStatus;
import com.company.furniturecatalog.repository.AdminUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * One-shot SUPER_ADMIN provisioner. Runs on startup when
 * {@code app.security.bootstrap-admin.enabled=true} AND the DB has no
 * active admin yet. Produces a clear log line so operators can rotate
 * the password straight after the first login.
 *
 * Deliberately does NOT replace existing admins or update passwords —
 * that would be a footgun in production.
 */
@Slf4j
@Component
@ConditionalOnProperty(prefix = "app.security.bootstrap-admin", name = "enabled", havingValue = "true")
@RequiredArgsConstructor
public class AdminUserSeedRunner implements ApplicationRunner {

    private final AdminUserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final BootstrapAdminProperties properties;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (repository.findFirstByStatusAndDeletedAtIsNull(AdminStatus.ACTIVE).isPresent()) {
            log.debug("Bootstrap admin skipped: an active admin already exists");
            return;
        }
        String password = properties.password();
        if (password == null || password.isBlank()) {
            log.warn("Bootstrap admin enabled but no password is configured — skipping seed. "
                   + "Set APP_BOOTSTRAP_ADMIN_PASSWORD or disable app.security.bootstrap-admin.enabled.");
            return;
        }
        String email = properties.email();
        if (repository.existsByEmailAndDeletedAtIsNull(email)) {
            log.info("Bootstrap admin skipped: email '{}' is already registered", email);
            return;
        }

        AdminUser admin = new AdminUser();
        admin.setEmail(email);
        admin.setPasswordHash(passwordEncoder.encode(password));
        admin.setFullName(properties.fullName() == null ? "Administrator" : properties.fullName());
        admin.setRole(AdminRole.SUPER_ADMIN);
        admin.setStatus(AdminStatus.ACTIVE);
        repository.save(admin);

        log.warn("Bootstrap SUPER_ADMIN seeded: {} — rotate the password immediately.", email);
    }
}
