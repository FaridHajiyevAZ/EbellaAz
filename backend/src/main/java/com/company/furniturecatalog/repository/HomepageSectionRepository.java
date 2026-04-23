package com.company.furniturecatalog.repository;

import com.company.furniturecatalog.domain.HomepageSection;
import com.company.furniturecatalog.domain.enums.ContentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface HomepageSectionRepository extends JpaRepository<HomepageSection, UUID> {

    List<HomepageSection> findByStatusAndDeletedAtIsNullOrderBySortOrderAsc(ContentStatus status);

    List<HomepageSection> findByDeletedAtIsNullOrderBySortOrderAsc();
}
