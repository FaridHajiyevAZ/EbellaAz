package com.company.furniturecatalog.service;

import com.company.furniturecatalog.domain.enums.ContentStatus;
import com.company.furniturecatalog.dto.admin.request.CreateCategoryRequest;
import com.company.furniturecatalog.dto.admin.request.UpdateCategoryRequest;
import com.company.furniturecatalog.dto.admin.response.CategoryAdminDto;
import com.company.furniturecatalog.dto.common.PageResponse;
import com.company.furniturecatalog.dto.common.ReorderRequest;
import com.company.furniturecatalog.dto.publicapi.CategoryTreeNodeDto;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface CategoryService {

    // --- Admin ----------------------------------------------------------

    CategoryAdminDto create(CreateCategoryRequest request);

    CategoryAdminDto update(UUID id, UpdateCategoryRequest request);

    CategoryAdminDto get(UUID id);

    PageResponse<CategoryAdminDto> search(String query,
                                          UUID parentId,
                                          boolean onlyRoots,
                                          ContentStatus status,
                                          Pageable pageable);

    /**
     * Soft-deletes a category.
     *
     * @param id          category to delete
     * @param reassignTo  optional target category; if provided, live products
     *                    in the deleted category get moved there before delete.
     *                    If null and the category has products, the call fails
     *                    with 409. Subcategories must always be handled first.
     */
    void delete(UUID id, UUID reassignTo);

    void reorder(UUID parentId, ReorderRequest request);

    // --- Public ---------------------------------------------------------

    /** Full nested tree of PUBLISHED categories for the public site menu. */
    List<CategoryTreeNodeDto> getPublicTree();
}
