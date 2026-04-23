package com.company.furniturecatalog.service;

import com.company.furniturecatalog.domain.HeroSlide;
import com.company.furniturecatalog.domain.ProductVariation;
import com.company.furniturecatalog.domain.ProductVariationImage;
import com.company.furniturecatalog.dto.admin.response.HeroSlideAdminDto;
import com.company.furniturecatalog.dto.admin.response.ImageAdminDto;
import com.company.furniturecatalog.exception.NotFoundException;
import com.company.furniturecatalog.mapper.HeroSlideMapper;
import com.company.furniturecatalog.mapper.ProductVariationImageMapper;
import com.company.furniturecatalog.repository.HeroSlideRepository;
import com.company.furniturecatalog.repository.ProductVariationImageRepository;
import com.company.furniturecatalog.repository.ProductVariationRepository;
import com.company.furniturecatalog.storage.FileValidator;
import com.company.furniturecatalog.storage.MediaDomain;
import com.company.furniturecatalog.storage.StorageService;
import com.company.furniturecatalog.storage.StoredFile;
import com.company.furniturecatalog.util.StorageUrlResolver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

/**
 * Orchestrates validate → upload → persist → (optional) delete-old for
 * the two image flows we support today. New flows slot in the same way.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MediaService {

    private final StorageService storage;
    private final FileValidator validator;
    private final StorageUrlResolver urlResolver;

    private final ProductVariationRepository variationRepository;
    private final ProductVariationImageRepository imageRepository;
    private final HeroSlideRepository heroSlideRepository;

    private final ProductVariationImageMapper imageMapper;
    private final HeroSlideMapper heroSlideMapper;

    // ---- Variation images --------------------------------------------

    @Transactional
    public ImageAdminDto uploadVariationImage(UUID variationId, MultipartFile file, String altText) {
        validator.validateImage(file);

        ProductVariation variation = variationRepository.findByIdAndDeletedAtIsNull(variationId)
                .orElseThrow(() -> NotFoundException.of("ProductVariation", variationId));

        UUID productId = variation.getProduct().getId();
        StoredFile stored = storage.store(file, MediaDomain.productVariation(productId, variationId));

        ProductVariationImage image = new ProductVariationImage();
        image.setVariation(variation);
        image.setStorageKey(stored.storageKey());
        image.setAltText(altText);
        image.setContentType(stored.contentType());
        image.setSizeBytes(stored.sizeBytes());
        image.setWidth(stored.width());
        image.setHeight(stored.height());
        image.setSortOrder(nextSortOrder(variation));
        variation.addImage(image);

        // Promote first uploaded image as primary when none is set yet.
        if (variation.getPrimaryImage() == null) {
            variation.setPrimaryImage(image);
        }

        imageRepository.save(image);
        log.info("Uploaded variation image {} for variation {}", stored.storageKey(), variationId);
        return imageMapper.toAdminDto(image, urlResolver);
    }

    @Transactional
    public void deleteVariationImage(UUID imageId) {
        ProductVariationImage image = imageRepository.findByIdAndDeletedAtIsNull(imageId)
                .orElseThrow(() -> NotFoundException.of("ProductVariationImage", imageId));

        ProductVariation variation = image.getVariation();
        String storageKey = image.getStorageKey();

        variation.removeImage(image); // clears primaryImage ref if needed
        imageRepository.delete(image);

        storage.delete(storageKey);
    }

    private static int nextSortOrder(ProductVariation variation) {
        return variation.getImages().stream()
                .mapToInt(ProductVariationImage::getSortOrder)
                .max()
                .orElse(-1) + 1;
    }

    // ---- Hero slide images -------------------------------------------

    /**
     * Replaces the hero slide's image. Uploads the new file, updates the
     * imageKey, then best-effort deletes the previous file.
     */
    @Transactional
    public HeroSlideAdminDto replaceHeroSlideImage(UUID slideId, MultipartFile file) {
        validator.validateImage(file);

        HeroSlide slide = heroSlideRepository.findById(slideId)
                .filter(s -> s.getDeletedAt() == null)
                .orElseThrow(() -> NotFoundException.of("HeroSlide", slideId));

        String previousKey = slide.getImageKey();

        StoredFile stored = storage.store(file, MediaDomain.heroSlide());
        slide.setImageKey(stored.storageKey());

        if (previousKey != null && !previousKey.equals(stored.storageKey())) {
            storage.delete(previousKey);
        }

        log.info("Replaced hero slide image: {} -> {}", previousKey, stored.storageKey());
        return heroSlideMapper.toAdminDto(slide, urlResolver);
    }
}
