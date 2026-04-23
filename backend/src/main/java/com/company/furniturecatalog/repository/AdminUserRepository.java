package com.company.furniturecatalog.repository;

import com.company.furniturecatalog.domain.AdminUser;
import com.company.furniturecatalog.domain.enums.AdminStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AdminUserRepository extends JpaRepository<AdminUser, UUID> {

    /** Email is case-insensitive at the DB level (citext). */
    Optional<AdminUser> findByEmailAndDeletedAtIsNull(String email);

    Optional<AdminUser> findByIdAndDeletedAtIsNull(UUID id);

    boolean existsByEmailAndDeletedAtIsNull(String email);

    Optional<AdminUser> findFirstByStatusAndDeletedAtIsNull(AdminStatus status);

    @Modifying
    @Query("update AdminUser u set u.lastLoginAt = :at where u.id = :id")
    int updateLastLoginAt(@Param("id") UUID id, @Param("at") OffsetDateTime at);
}
