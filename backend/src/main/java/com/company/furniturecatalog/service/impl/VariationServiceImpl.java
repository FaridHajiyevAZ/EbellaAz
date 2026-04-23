package com.company.furniturecatalog.service.impl;

import com.company.furniturecatalog.domain.Product;
import com.company.furniturecatalog.domain.ProductVariation;
import com.company.furniturecatalog.dto.admin.request.CreateVariationRequest;
import com.company.furniturecatalog.dto.admin.request.UpdateVariationRequest;
import com.company.furniturecatalog.dto.admin.response.VariationAdminDto;
import com.company.furniturecatalog.exception.BadRequestException;
import com.company.furniturecatalog.exception.NotFoundException;
import com.company.furniturecatalog.mapper.ProductVariationImageMapper;
import com.company.furniturecatalog.mapper.ProductVariationMapper;
import com.company.furniturecatalog.repository.ProductRepository;
import com.company.furniturecatalog.repository.ProductVariationRepository;
import com.company.furniturecatalog.service.VariationService;
import com.company.furniturecatalog.util.StorageUrlResolver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class VariationServiceImpl implements VariationService {

    private final ProductRepository productRepository;
    private final ProductVariationRepository variationRepository;

    private final ProductVariationMapper variationMapper;
    private final ProductVariationImageMapper imageMapper;
    private final StorageUrlResolver urlResolver;

    // =========================================================
    // Writes
    // =========================================================

    @Override
    public VariationAdminDto create(UUID productId, CreateVariationRequest r) {
        Product product = productRepository.findByIdAndDeletedAtIsNull(productId)
                .orElseThrow(() -> NotFoundException.of("Product", productId));

        ProductVariation variation = variationMapper.toEntity(r);
        variation.setProduct(product);

        // Rule: first variation on a product is always the default, regardless of the request.
        boolean hasAnyDefault = variationRepository
                .findByProductIdAndDefaultVariationTrueAndDeletedAtIsNull(productId)
                .isPresent();
        boolean shouldBecomeDefault = !hasAnyDefault || Boolean.TRUE.equals(r.isDefault());

        if (shouldBecomeDefault) {
            // Clear any existing default first so the partial-unique index stays satisfied.
            variationRepository.clearAllDefaults(productId);
            variation.setDefaultVariation(true);
        } else {
            variation.setDefaultVariation(false);
        }

        product.addVariation(variation);
        ProductVariation saved = variationRepository.save(variation);
        log.info("Created variation {} on product {} (default={})",
                saved.getId(), productId, saved.isDefaultVariation());

        return variationMapper.toAdminDto(saved, urlResolver, imageMapper);
    }

    @Override
    public VariationAdminDto update(UUID variationId, UpdateVariationRequest r) {
        ProductVariation variation = loadLive(variationId);

        // Capture the incoming isDefault intent before the mapper blows away nulls.
        Boolean desiredDefault = r.isDefault();

        // Primary image change: must reference an image that belongs to this variation.
        if (r.primaryImageId() != null) {
            boolean owned = variation.getImages().stream()
                    .anyMatch(img -> img.getId().equals(r.primaryImageId()));
            if (!owned) {
                throw new BadRequestException("Primary image does not belong to this variation");
            }
            variation.setPrimaryImage(
                    variation.getImages().stream()
                            .filter(img -> img.getId().equals(r.primaryImageId()))
                            .findFirst().orElseThrow());
        }

        variationMapper.updateEntity(r, variation);

        // Default-flag transitions are processed after the mapper.
        if (Boolean.TRUE.equals(desiredDefault) && !variation.isDefaultVariation()) {
            promoteToDefault(variation);
        } else if (Boolean.FALSE.equals(desiredDefault) && variation.isDefaultVariation()) {
            // Refuse to drop the only default via a plain UPDATE; admin should create/promote another first.
            throw new BadRequestException(
                    "Cannot unset isDefault directly; promote another variation to default instead");
        }

        return variationMapper.toAdminDto(variation, urlResolver, imageMapper);
    }

    @Override
    public VariationAdminDto setDefault(UUID variationId) {
        ProductVariation variation = loadLive(variationId);
        if (!variation.isDefaultVariation()) {
            promoteToDefault(variation);
        }
        return variationMapper.toAdminDto(variation, urlResolver, imageMapper);
    }

    @Override
    public void delete(UUID variationId) {
        ProductVariation variation = loadLive(variationId);
        UUID productId = variation.getProduct().getId();
        boolean wasDefault = variation.isDefaultVariation();

        variation.setDefaultVariation(false); // release the flag before soft delete
        variation.markDeleted();
        variationRepository.flush();

        if (wasDefault) {
            // Promote the next live variation (lowest sort_order) as the new default.
            variationRepository
                    .findByProductIdAndDeletedAtIsNullOrderBySortOrderAsc(productId)
                    .stream()
                    .filter(v -> !v.getId().equals(variationId))
                    .min(Comparator.comparingInt(ProductVariation::getSortOrder))
                    .ifPresent(next -> {
                        next.setDefaultVariation(true);
                        log.info("Promoted variation {} to default after deleting {}", next.getId(), variationId);
                    });
        }
        log.info("Soft-deleted variation {} (product={})", variationId, productId);
    }

    // =========================================================
    // Reads
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public VariationAdminDto get(UUID variationId) {
        return variationMapper.toAdminDto(loadLive(variationId), urlResolver, imageMapper);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VariationAdminDto> listForProduct(UUID productId) {
        if (!productRepository.existsById(productId)) {
            throw NotFoundException.of("Product", productId);
        }
        return variationRepository
                .findByProductIdAndDeletedAtIsNullOrderBySortOrderAsc(productId)
                .stream()
                .map(v -> variationMapper.toAdminDto(v, urlResolver, imageMapper))
                .toList();
    }

    // =========================================================
    // Helpers
    // =========================================================

    private ProductVariation loadLive(UUID id) {
        return variationRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> NotFoundException.of("ProductVariation", id));
    }

    /**
     * Two-step promotion that respects the partial unique index:
     *   1) bulk UPDATE every variation of the product to is_default=false (flushes).
     *   2) dirty-check this row to is_default=true; tx commit UPDATE is emitted after.
     */
    private void promoteToDefault(ProductVariation variation) {
        UUID productId = variation.getProduct().getId();
        variationRepository.clearAllDefaults(productId);
        variation.setDefaultVariation(true);
    }
}
