package com.company.furniturecatalog.service;

import com.company.furniturecatalog.dto.admin.response.ImageAdminDto;
import com.company.furniturecatalog.dto.admin.response.VariationAdminDto;
import com.company.furniturecatalog.dto.common.ReorderRequest;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

public interface VariationImageService {

    ImageAdminDto upload(UUID variationId, MultipartFile file, String altText);

    void delete(UUID imageId);

    /** Reorders images within a single variation. Returns the updated variation. */
    VariationAdminDto reorder(UUID variationId, ReorderRequest request);

    /** Sets the variation's primary (cover) image; image must belong to that variation. */
    VariationAdminDto setPrimary(UUID variationId, UUID imageId);
}
