package com.company.furniturecatalog.controller;

import com.company.furniturecatalog.dto.admin.response.HeroSlideAdminDto;
import com.company.furniturecatalog.dto.admin.response.ImageAdminDto;
import com.company.furniturecatalog.service.MediaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.UUID;

/**
 * Admin media endpoints. The global /api/v1 prefix is applied by WebConfig,
 * so effective paths start with /api/v1/admin/media/...
 */
@Tag(name = "Admin · Media", description = "Image uploads for catalog and CMS content")
@RestController
@RequestMapping("/admin/media")
@RequiredArgsConstructor
public class AdminMediaController {

    private final MediaService mediaService;

    // ---- Product variation images ------------------------------------

    @Operation(summary = "Upload a new image to a product variation")
    @PostMapping(value = "/variations/{variationId}/images",
                 consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ImageAdminDto> uploadVariationImage(
            @PathVariable UUID variationId,
            @RequestPart("file") MultipartFile file,
            @RequestParam(value = "altText", required = false) String altText
    ) {
        ImageAdminDto created = mediaService.uploadVariationImage(variationId, file, altText);
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequestUri()
                .path("/{id}")
                .buildAndExpand(created.id())
                .toUri();
        return ResponseEntity.created(location).body(created);
    }

    @Operation(summary = "Delete a variation image (file + DB row)")
    @DeleteMapping("/variations/images/{imageId}")
    public ResponseEntity<Void> deleteVariationImage(@PathVariable UUID imageId) {
        mediaService.deleteVariationImage(imageId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    // ---- Hero slide image --------------------------------------------

    @Operation(summary = "Replace the image of a hero slide (previous file is removed)")
    @PutMapping(value = "/hero-slides/{slideId}/image",
                consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<HeroSlideAdminDto> replaceHeroSlideImage(
            @PathVariable UUID slideId,
            @RequestPart("file") MultipartFile file
    ) {
        return ResponseEntity.ok(mediaService.replaceHeroSlideImage(slideId, file));
    }
}
