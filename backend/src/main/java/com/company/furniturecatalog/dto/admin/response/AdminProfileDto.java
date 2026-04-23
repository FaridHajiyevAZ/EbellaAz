package com.company.furniturecatalog.dto.admin.response;

import com.company.furniturecatalog.domain.AdminUser;
import com.company.furniturecatalog.domain.enums.AdminRole;
import com.company.furniturecatalog.domain.enums.AdminStatus;

import java.time.OffsetDateTime;
import java.util.UUID;

public record AdminProfileDto(
        UUID id,
        String email,
        String fullName,
        AdminRole role,
        AdminStatus status,
        OffsetDateTime lastLoginAt
) {
    public static AdminProfileDto from(AdminUser user) {
        return new AdminProfileDto(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.getStatus(),
                user.getLastLoginAt()
        );
    }
}
