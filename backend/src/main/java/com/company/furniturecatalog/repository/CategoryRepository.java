package com.company.furniturecatalog.repository;

import com.company.furniturecatalog.domain.Category;
import com.company.furniturecatalog.domain.enums.ContentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {

    Optional<Category> findByIdAndDeletedAtIsNull(UUID id);

    Optional<Category> findBySlugAndParentIsNullAndDeletedAtIsNull(String slug);

    Optional<Category> findBySlugAndParentIdAndDeletedAtIsNull(String slug, UUID parentId);

    List<Category> findByParentIsNullAndDeletedAtIsNullOrderBySortOrderAsc();

    List<Category> findByParentIdAndDeletedAtIsNullOrderBySortOrderAsc(UUID parentId);

    boolean existsBySlugAndParentIdAndDeletedAtIsNull(String slug, UUID parentId);

    boolean existsBySlugAndParentIsNullAndDeletedAtIsNull(String slug);

    /** Returns every non-deleted category in one trip — cheap for a small tree cached at the API layer. */
    @Query("""
           select c from Category c
           where c.deletedAt is null
             and c.status = :status
           order by c.depth asc, c.sortOrder asc
           """)
    List<Category> findAllLiveByStatus(ContentStatus status);
}
