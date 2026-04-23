package com.company.furniturecatalog.repository;

import com.company.furniturecatalog.domain.HeroSlide;
import com.company.furniturecatalog.domain.enums.ContentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface HeroSlideRepository extends JpaRepository<HeroSlide, UUID> {

    List<HeroSlide> findByDeletedAtIsNullOrderBySortOrderAsc();

    /**
     * Returns slides that are published and within their optional time window.
     * Used by the public /home endpoint.
     */
    @Query("""
           select h from HeroSlide h
           where h.deletedAt is null
             and h.status = :status
             and (h.startsAt is null or h.startsAt <= :now)
             and (h.endsAt   is null or h.endsAt   >  :now)
           order by h.sortOrder asc
           """)
    List<HeroSlide> findActiveAt(ContentStatus status, OffsetDateTime now);
}
