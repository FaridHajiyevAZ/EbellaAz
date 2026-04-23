package com.company.furniturecatalog.controller;

import com.company.furniturecatalog.domain.enums.ProductStatus;
import com.company.furniturecatalog.dto.admin.request.CreateProductRequest;
import com.company.furniturecatalog.dto.admin.request.UpdateProductRequest;
import com.company.furniturecatalog.dto.admin.response.ProductAdminDetailDto;
import com.company.furniturecatalog.dto.admin.response.ProductAdminListItemDto;
import com.company.furniturecatalog.dto.common.PageResponse;
import com.company.furniturecatalog.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.UUID;

@Tag(name = "Admin · Products", description = "Product CRUD and admin search")
@RestController
@RequestMapping("/admin/products")
@RequiredArgsConstructor
public class AdminProductController {

    private final ProductService service;

    @Operation(summary = "Search products (admin table)")
    @GetMapping
    public PageResponse<ProductAdminListItemDto> search(
            @RequestParam(value = "q",          required = false) String q,
            @RequestParam(value = "categoryId", required = false) UUID categoryId,
            @RequestParam(value = "subtree",    required = false, defaultValue = "true") boolean subtree,
            @RequestParam(value = "status",     required = false) ProductStatus status,
            @RequestParam(value = "featured",   required = false) Boolean featured,
            @PageableDefault(size = 25, sort = "updatedAt") Pageable pageable
    ) {
        return service.searchAdmin(q, categoryId, subtree, status, featured, pageable);
    }

    @Operation(summary = "Get product detail (including variations + images)")
    @GetMapping("/{id}")
    public ProductAdminDetailDto get(@PathVariable UUID id) {
        return service.getAdmin(id);
    }

    @Operation(summary = "Create a product")
    @PostMapping
    public ResponseEntity<ProductAdminDetailDto> create(@Valid @RequestBody CreateProductRequest request) {
        ProductAdminDetailDto created = service.create(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequestUri()
                .path("/{id}").buildAndExpand(created.id()).toUri();
        return ResponseEntity.created(location).body(created);
    }

    @Operation(summary = "Update a product (PATCH-style; null fields ignored)")
    @PutMapping("/{id}")
    public ProductAdminDetailDto update(@PathVariable UUID id,
                                        @Valid @RequestBody UpdateProductRequest request) {
        return service.update(id, request);
    }

    @Operation(summary = "Soft-delete a product")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
