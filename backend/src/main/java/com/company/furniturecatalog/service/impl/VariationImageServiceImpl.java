package com.company.furniturecatalog.service.impl;

import com.company.furniturecatalog.domain.ProductVariation;
import com.company.furniturecatalog.domain.ProductVariationImage;
import com.company.furniturecatalog.dto.admin.response.ImageAdminDto;
import com.company.furniturecatalog.dto.admin.response.VariationAdminDto;
import com.company.furniturecatalog.dto.common.ReorderRequest;
import com.company.furniturecatalog.exception.BadRequestException;
import com.company.furniturecatalog.exception.NotFoundException;
import com.company.furniturecatalog.mapper.ProductVariationImageMapper;
import com.company.furniturecatalog.mapper.ProductVariationMapper;
import com.company.furniturecatalog.repository.ProductVariationImageRepository;
import com.company.furniturecatalog.repository.ProductVariationRepository;
import com.company.furniturecatalog.service.MediaService;
import com.company.furniturecatalog.service.VariationImageService;
import com.company.furniturecatalog.util.StorageUrlResolver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class VariationImageServiceImpl implements VariationImageService {

    private final MediaService mediaService;

    private final ProductVariationRepository variationRepository;
    private final ProductVariationImageRepository imageRepository;

    private final ProductVariationMapper variationMapper;
    private final ProductVariationImageMapper imageMapper;
    private final StorageUrlResolver urlResolver;

    // Upload / delete delegate to MediaService — single source of truth for
    // validation, storage writes, and the "promote first image as primary" rule.

    @Override
    public ImageAdminDto upload(UUID variationId, MultipartFile file, String altText) {
        return mediaService.uploadVariationImage(variationId, file, altText);
    }

    @Override
    public void delete(UUID imageId) {
        mediaService.deleteVariationImage(imageId);
    }

    @Override
    public VariationAdminDto reorder(UUID variationId, ReorderRequest request) {
        ProductVariation variation = loadLive(variationId);

        Map<UUID, Integer> newOrder = new HashMap<>();
        Set<Integer> seenOrders = new HashSet<>();
        for (ReorderRequest.Item item : request.items()) {
            if (!seenOrders.add(item.sortOrder())) {
                throw new BadRequestException("Duplicate sortOrder " + item.sortOrder() + " in request");
            }
            newOrder.put(item.id(), item.sortOrder());
        }

        // All ids in the request must belong to this variation.
        Set<UUID> belong = new HashSet<>();
        for (ProductVariationImage img : variation.getImages()) {
            belong.add(img.getId());
        }
        for (UUID id : newOrder.keySet()) {
            if (!belong.contains(id)) {
                throw new BadRequestException("Image " + id + " does not belong to variation " + variationId);
            }
        }

        // Two-phase update. The DB has a partial unique index on
        // (variation_id, sort_order) WHERE deleted_at IS NULL, so a direct
        // swap would briefly violate the constraint. Shift everyone to
        // negative space first, flush, then write final values.
        for (ProductVariationImage img : variation.getImages()) {
            Integer target = newOrder.get(img.getId());
            if (target != null) {
                img.setSortOrder(-1 - target);
            }
        }
        imageRepository.flush();

        for (ProductVariationImage img : variation.getImages()) {
            Integer target = newOrder.get(img.getId());
            if (target != null) {
                img.setSortOrder(target);
            }
        }
        // Final UPDATEs are emitted on transaction commit via dirty checking.

        log.info("Reordered {} image(s) on variation {}", newOrder.size(), variationId);
        return variationMapper.toAdminDto(variation, urlResolver, imageMapper);
    }

    @Override
    public VariationAdminDto setPrimary(UUID variationId, UUID imageId) {
        ProductVariation variation = loadLive(variationId);

        ProductVariationImage image = variation.getImages().stream()
                .filter(img -> img.getId().equals(imageId))
                .findFirst()
                .orElseThrow(() -> new BadRequestException(
                        "Image " + imageId + " does not belong to variation " + variationId));

        variation.setPrimaryImage(image);
        log.info("Set primary image of variation {} to {}", variationId, imageId);
        return variationMapper.toAdminDto(variation, urlResolver, imageMapper);
    }

    private ProductVariation loadLive(UUID id) {
        return variationRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> NotFoundException.of("ProductVariation", id));
    }
}
