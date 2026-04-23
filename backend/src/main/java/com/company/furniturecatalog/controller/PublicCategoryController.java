package com.company.furniturecatalog.controller;

import com.company.furniturecatalog.dto.publicapi.CategoryTreeNodeDto;
import com.company.furniturecatalog.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.util.List;

/**
 * Public navigation tree. Cache-friendly: the response is small, changes
 * rarely, and React needs it on every page, so we set a short Cache-Control.
 */
@Tag(name = "Public · Categories")
@RestController
@RequestMapping("/public/categories")
@RequiredArgsConstructor
public class PublicCategoryController {

    private final CategoryService service;

    @Operation(summary = "Full published category tree for site navigation")
    @GetMapping
    public ResponseEntity<List<CategoryTreeNodeDto>> tree() {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(Duration.ofMinutes(5)).cachePublic())
                .body(service.getPublicTree());
    }
}
