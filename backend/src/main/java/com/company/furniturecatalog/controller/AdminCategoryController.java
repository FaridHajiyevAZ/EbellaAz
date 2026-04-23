package com.company.furniturecatalog.controller;

import com.company.furniturecatalog.domain.enums.ContentStatus;
import com.company.furniturecatalog.dto.admin.request.CreateCategoryRequest;
import com.company.furniturecatalog.dto.admin.request.UpdateCategoryRequest;
import com.company.furniturecatalog.dto.admin.response.CategoryAdminDto;
import com.company.furniturecatalog.dto.common.PageResponse;
import com.company.furniturecatalog.dto.common.ReorderRequest;
import com.company.furniturecatalog.service.CategoryService;
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
import org.springframework.web.bind.annotation.PatchMapping;
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

@Tag(name = "Admin · Categories", description = "Category tree management")
@RestController
@RequestMapping("/admin/categories")
@RequiredArgsConstructor
public class AdminCategoryController {

    private final CategoryService service;

    @Operation(summary = "Search categories (admin table)")
    @GetMapping
    public PageResponse<CategoryAdminDto> search(
            @RequestParam(value = "q",          required = false) String q,
            @RequestParam(value = "parentId",   required = false) UUID parentId,
            @RequestParam(value = "onlyRoots",  required = false, defaultValue = "false") boolean onlyRoots,
            @RequestParam(value = "status",     required = false) ContentStatus status,
            @PageableDefault(size = 25, sort = "sortOrder") Pageable pageable
    ) {
        return service.search(q, parentId, onlyRoots, status, pageable);
    }

    @Operation(summary = "Get a single category by id")
    @GetMapping("/{id}")
    public CategoryAdminDto get(@PathVariable UUID id) {
        return service.get(id);
    }

    @Operation(summary = "Create a category")
    @PostMapping
    public ResponseEntity<CategoryAdminDto> create(@Valid @RequestBody CreateCategoryRequest request) {
        CategoryAdminDto created = service.create(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequestUri()
                .path("/{id}")
                .buildAndExpand(created.id())
                .toUri();
        return ResponseEntity.created(location).body(created);
    }

    @Operation(summary = "Update a category (PATCH-style: null fields are ignored)")
    @PutMapping("/{id}")
    public CategoryAdminDto update(@PathVariable UUID id,
                                   @Valid @RequestBody UpdateCategoryRequest request) {
        return service.update(id, request);
    }

    @Operation(summary = "Delete a category",
               description = "Fails with 409 if the category has subcategories. "
                           + "Fails with 409 if it has products unless reassignTo=<categoryId> is provided.")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id,
                                       @RequestParam(value = "reassignTo", required = false) UUID reassignTo) {
        service.delete(id, reassignTo);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @Operation(summary = "Reorder siblings under a given parent (null = root siblings)")
    @PatchMapping("/reorder")
    public ResponseEntity<Void> reorder(
            @RequestParam(value = "parentId", required = false) UUID parentId,
            @Valid @RequestBody ReorderRequest request
    ) {
        service.reorder(parentId, request);
        return ResponseEntity.noContent().build();
    }
}
