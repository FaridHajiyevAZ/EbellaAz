package com.company.furniturecatalog.repository;

import com.company.furniturecatalog.domain.ProductVariation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductVariationRepository extends JpaRepository<ProductVariation, UUID> {

    Optional<ProductVariation> findByIdAndDeletedAtIsNull(UUID id);

    List<ProductVariation> findByProductIdAndDeletedAtIsNullOrderBySortOrderAsc(UUID productId);

    Optional<ProductVariation> findByProductIdAndDefaultVariationTrueAndDeletedAtIsNull(UUID productId);

    /**
     * Clears the default flag across all other variations of the same product.
     * Call inside the same transaction that sets the new default.
     */
    @Modifying
    @Query("""
           update ProductVariation v
              set v.defaultVariation = false
            where v.product.id = :productId
              and v.id <> :exceptId
           """)
    int clearDefaultForOthers(@Param("productId") UUID productId,
                              @Param("exceptId") UUID exceptId);

    /**
     * Clears the default flag across every variation of a product (including
     * the one we're about to promote). The caller then sets the new default
     * to true. The two-step dance keeps the partial-unique index on
     * (product_id) WHERE is_default = true happy.
     */
    @Modifying(flushAutomatically = true, clearAutomatically = false)
    @Query("""
           update ProductVariation v
              set v.defaultVariation = false
            where v.product.id = :productId
              and v.deletedAt is null
              and v.defaultVariation = true
           """)
    int clearAllDefaults(@Param("productId") UUID productId);

    /**
     * Bulk-loads active variations (with their primary image join-fetched)
     * for a page of products. Used by the public/admin listing to avoid
     * N+1 when picking cover images and color swatches.
     */
    @Query("""
           select v from ProductVariation v
           left join fetch v.primaryImage
           where v.product.id in :productIds
             and v.deletedAt is null
           """)
    List<ProductVariation> findForProducts(@Param("productIds") Collection<UUID> productIds);
}
