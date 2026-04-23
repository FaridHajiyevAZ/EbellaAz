package com.company.furniturecatalog.repository;

import com.company.furniturecatalog.domain.ProductVariationImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductVariationImageRepository extends JpaRepository<ProductVariationImage, UUID> {

    Optional<ProductVariationImage> findByIdAndDeletedAtIsNull(UUID id);

    List<ProductVariationImage> findByVariationIdAndDeletedAtIsNullOrderBySortOrderAsc(UUID variationId);

    boolean existsByStorageKey(String storageKey);
}
