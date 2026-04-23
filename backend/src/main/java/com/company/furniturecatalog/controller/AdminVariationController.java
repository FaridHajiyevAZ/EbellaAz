package com.company.furniturecatalog.controller;

import com.company.furniturecatalog.dto.admin.request.CreateVariationRequest;
import com.company.furniturecatalog.dto.admin.request.UpdateVariationRequest;
import com.company.furniturecatalog.dto.admin.response.ImageAdminDto;
import com.company.furniturecatalog.dto.admin.response.VariationAdminDto;
import com.company.furniturecatalog.dto.common.ReorderRequest;
import com.company.furniturecatalog.service.VariationImageService;
import com.company.furniturecatalog.service.VariationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@Tag(name = "Admin · Variations", description = "Variation CRUD + image management")
@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminVariationController {

    private final VariationService variationService;
    private final VariationImageService imageService;

    // ---- Variation CRUD ----------------------------------------------

    @Operation(summary = "List variations of a product")
    @GetMapping("/products/{productId}/variations")
    public List<VariationAdminDto> list(@PathVariable UUID productId) {
        return variationService.listForProduct(productId);
    }

    @Operation(summary = "Create a variation under a product")
    @PostMapping("/products/{productId}/variations")
    public ResponseEntity<VariationAdminDto> create(
            @PathVariable UUID productId,
            @Valid @RequestBody CreateVariationRequest request
    ) {
        VariationAdminDto created = variationService.create(productId, request);
        URI location = ServletUriComponentsBuilder
                .fromCurrentContextPath()
                .path("/api/v1/admin/variations/{id}")
                .buildAndExpand(created.id())
                .toUri();
        return ResponseEntity.created(location).body(created);
    }

    @Operation(summary = "Get a single variation with its gallery")
    @GetMapping("/variations/{variationId}")
    public VariationAdminDto get(@PathVariable UUID variationId) {
        return variationService.get(variationId);
    }

    @Operation(summary = "Update a variation (PATCH-style)")
    @PutMapping("/variations/{variationId}")
    public VariationAdminDto update(@PathVariable UUID variationId,
                                    @Valid @RequestBody UpdateVariationRequest request) {
        return variationService.update(variationId, request);
    }

    @Operation(
            summary = "Promote this variation to default",
            description = "Clears isDefault on all sibling variations atomically."
    )
    @PatchMapping("/variations/{variationId}/default")
    public VariationAdminDto setDefault(@PathVariable UUID variationId) {
        return variationService.setDefault(variationId);
    }

    @Operation(
            summary = "Soft-delete a variation",
            description = "If the deleted variation was the default, the next-lowest-sortOrder "
                        + "sibling (if any) is promoted to default."
    )
    @DeleteMapping("/variations/{variationId}")
    public ResponseEntity<Void> delete(@PathVariable UUID variationId) {
        variationService.delete(variationId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    // ---- Variation images --------------------------------------------

    @Operation(summary = "Upload a new image to a variation",
               description = "First image uploaded is auto-promoted to primary.")
    @PostMapping(value = "/variations/{variationId}/images",
                 consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ImageAdminDto> uploadImage(
            @PathVariable UUID variationId,
            @RequestPart("file") MultipartFile file,
            @RequestParam(value = "altText", required = false) String altText
    ) {
        ImageAdminDto created = imageService.upload(variationId, file, altText);
        URI location = ServletUriComponentsBuilder.fromCurrentRequestUri()
                .path("/{id}")
                .buildAndExpand(created.id())
                .toUri();
        return ResponseEntity.created(location).body(created);
    }

    @Operation(summary = "Delete a variation image")
    @DeleteMapping("/variations/{variationId}/images/{imageId}")
    public ResponseEntity<Void> deleteImage(@PathVariable UUID variationId,
                                            @PathVariable UUID imageId) {
        imageService.delete(imageId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @Operation(summary = "Reorder images within a variation")
    @PatchMapping("/variations/{variationId}/images/reorder")
    public VariationAdminDto reorderImages(@PathVariable UUID variationId,
                                           @Valid @RequestBody ReorderRequest request) {
        return imageService.reorder(variationId, request);
    }

    @Operation(summary = "Mark an image as the variation's primary/cover image")
    @PatchMapping("/variations/{variationId}/images/{imageId}/primary")
    public VariationAdminDto setPrimaryImage(@PathVariable UUID variationId,
                                             @PathVariable UUID imageId) {
        return imageService.setPrimary(variationId, imageId);
    }
}
