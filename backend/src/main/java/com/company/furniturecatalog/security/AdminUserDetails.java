package com.company.furniturecatalog.security;

import com.company.furniturecatalog.config.JpaAuditingConfig;
import com.company.furniturecatalog.domain.AdminUser;
import com.company.furniturecatalog.domain.enums.AdminStatus;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

/**
 * Wraps {@link AdminUser} as a Spring Security principal and exposes the
 * {@link JpaAuditingConfig.AuditablePrincipal} hook so JPA auditing can
 * attribute changes to the logged-in admin.
 */
public class AdminUserDetails implements UserDetails, JpaAuditingConfig.AuditablePrincipal {

    private final AdminUser user;
    private final List<GrantedAuthority> authorities;

    public AdminUserDetails(AdminUser user) {
        this.user = user;
        this.authorities = List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
    }

    public AdminUser getAdmin() {
        return user;
    }

    @Override
    public UUID getUserId() {
        return user.getId();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return user.getPasswordHash();
    }

    @Override
    public String getUsername() {
        return user.getEmail();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return user.getStatus() == AdminStatus.ACTIVE;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return user.getStatus() == AdminStatus.ACTIVE && !user.isDeleted();
    }
}
