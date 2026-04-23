package com.company.furniturecatalog.service;

import com.company.furniturecatalog.dto.admin.request.CreateVariationRequest;
import com.company.furniturecatalog.dto.admin.request.UpdateVariationRequest;
import com.company.furniturecatalog.dto.admin.response.VariationAdminDto;

import java.util.List;
import java.util.UUID;

public interface VariationService {

    VariationAdminDto create(UUID productId, CreateVariationRequest request);

    VariationAdminDto update(UUID variationId, UpdateVariationRequest request);

    VariationAdminDto get(UUID variationId);

    List<VariationAdminDto> listForProduct(UUID productId);

    void delete(UUID variationId);

    /** Explicit action to flip a variation to default; clears the flag on siblings. */
    VariationAdminDto setDefault(UUID variationId);
}
