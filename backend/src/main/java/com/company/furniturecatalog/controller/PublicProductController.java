package com.company.furniturecatalog.controller;

import com.company.furniturecatalog.dto.common.PageResponse;
import com.company.furniturecatalog.dto.publicapi.ProductCardDto;
import com.company.furniturecatalog.dto.publicapi.ProductDetailDto;
import com.company.furniturecatalog.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.util.UUID;

@Tag(name = "Public · Products")
@RestController
@RequestMapping("/public/products")
@RequiredArgsConstructor
public class PublicProductController {

    private final ProductService service;

    @Operation(
            summary = "List published products",
            description = "Filters: category (with optional subtree descent), featured flag, name search, plus pagination & sort."
    )
    @GetMapping
    public ResponseEntity<PageResponse<ProductCardDto>> list(
            @RequestParam(value = "categoryId", required = false) UUID categoryId,
            @RequestParam(value = "subtree",    required = false, defaultValue = "true") boolean subtree,
            @RequestParam(value = "q",          required = false) String query,
            @RequestParam(value = "featured",   required = false) Boolean featured,
            @PageableDefault(size = 24, sort = {"sortOrder", "publishedAt"}) Pageable pageable
    ) {
        PageResponse<ProductCardDto> body = service.listPublic(categoryId, subtree, query, featured, pageable);
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(Duration.ofMinutes(2)).cachePublic())
                .body(body);
    }

    @Operation(
            summary = "Product detail by slug",
            description = "Single-call payload: basics, breadcrumbs, variations with galleries, default variation id, "
                        + "and a prebuilt WhatsApp inquiry."
    )
    @GetMapping("/{slug}")
    public ResponseEntity<ProductDetailDto> detail(@PathVariable String slug) {
        ProductDetailDto body = service.getPublicDetail(slug);
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(Duration.ofMinutes(5)).cachePublic())
                .body(body);
    }
}
