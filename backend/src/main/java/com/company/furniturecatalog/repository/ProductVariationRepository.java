package com.company.furniturecatalog.repository;

import com.company.furniturecatalog.domain.ProductVariation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

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
}
