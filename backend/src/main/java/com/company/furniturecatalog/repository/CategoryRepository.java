package com.company.furniturecatalog.repository;

import com.company.furniturecatalog.domain.Category;
import com.company.furniturecatalog.domain.enums.ContentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    /**
     * Admin search with optional filters. {@code q} matches against name / slug
     * case-insensitively. Any filter left null is ignored.
     */
    @Query("""
           select c from Category c
           where c.deletedAt is null
             and (:q is null or :q = ''
                   or lower(c.name) like lower(concat('%', :q, '%'))
                   or lower(c.slug) like lower(concat('%', :q, '%')))
             and (:status is null or c.status = :status)
             and (
                   (:parentId is null and :onlyRoots = false)
                or (:parentId is not null and c.parent.id = :parentId)
                or (:onlyRoots = true  and c.parent is null)
             )
           """)
    Page<Category> search(@Param("q") String q,
                          @Param("parentId") UUID parentId,
                          @Param("onlyRoots") boolean onlyRoots,
                          @Param("status") ContentStatus status,
                          Pageable pageable);

    /** True if this category (or any descendant, via path containment) still has live rows. */
    boolean existsByParentIdAndDeletedAtIsNull(UUID parentId);
}
