package com.company.furniturecatalog.domain;

import com.company.furniturecatalog.domain.enums.AdminRole;
import com.company.furniturecatalog.domain.enums.AdminStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.OffsetDateTime;

@Entity
@Table(
        name = "admin_users",
        uniqueConstraints = @UniqueConstraint(name = "uq_admin_users_email", columnNames = "email")
)
@Getter
@Setter
@NoArgsConstructor
@ToString(onlyExplicitlyIncluded = true)
public class AdminUser extends SoftDeletableEntity {

    @ToString.Include
    @Column(name = "email", nullable = false, length = 160, columnDefinition = "citext")
    private String email;

    /**
     * BCrypt/Argon2 hash. Never serialized.
     */
    @JsonIgnore
    @Column(name = "password_hash", nullable = false, columnDefinition = "text")
    private String passwordHash;

    @Column(name = "full_name", nullable = false, length = 160)
    private String fullName;

    @ToString.Include
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 32)
    private AdminRole role = AdminRole.EDITOR;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    private AdminStatus status = AdminStatus.ACTIVE;

    @Column(name = "last_login_at")
    private OffsetDateTime lastLoginAt;
}
