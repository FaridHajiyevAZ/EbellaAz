package com.company.furniturecatalog.repository;

import com.company.furniturecatalog.domain.ContactInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ContactInfoRepository extends JpaRepository<ContactInfo, UUID> {

    Optional<ContactInfo> findFirstByPrimaryTrueAndLocale(String locale);

    Optional<ContactInfo> findFirstByPrimaryTrue();
}
