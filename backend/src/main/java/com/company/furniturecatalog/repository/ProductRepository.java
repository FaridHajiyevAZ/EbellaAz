package com.company.furniturecatalog.repository;

import com.company.furniturecatalog.domain.Category;
import com.company.furniturecatalog.domain.Product;
import com.company.furniturecatalog.domain.enums.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID>, JpaSpecificationExecutor<Product> {

    Optional<Product> findByIdAndDeletedAtIsNull(UUID id);

    /** Detail fetch: loads variations + images in a single query via entity graph. */
    @EntityGraph(attributePaths = {"variations", "variations.images", "variations.primaryImage", "category"})
    Optional<Product> findWithVariationsBySlugAndDeletedAtIsNull(String slug);

    boolean existsBySlugAndDeletedAtIsNull(String slug);

    boolean existsBySkuAndDeletedAtIsNull(String sku);

    Page<Product> findByStatusAndDeletedAtIsNull(ProductStatus status, Pageable pageable);

    Page<Product> findByCategoryIdAndStatusAndDeletedAtIsNull(UUID categoryId,
                                                              ProductStatus status,
                                                              Pageable pageable);

    @Query("""
           select p from Product p
           where p.featured = true
             and p.status = :status
             and p.deletedAt is null
           order by p.sortOrder asc, p.publishedAt desc
           """)
    Page<Product> findFeatured(ProductStatus status, Pageable pageable);

    long countByCategoryIdAndDeletedAtIsNull(UUID categoryId);

    boolean existsByCategoryIdAndDeletedAtIsNull(UUID categoryId);

    /**
     * Reassigns all live products from {@code oldCategoryId} to the given
     * target category. Used when an admin chooses to remove a category and
     * redirect its products elsewhere.
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
           update Product p
              set p.category = :newCategory
            where p.category.id = :oldCategoryId
              and p.deletedAt is null
           """)
    int reassignCategory(@Param("oldCategoryId") UUID oldCategoryId,
                         @Param("newCategory") Category newCategory);
}
