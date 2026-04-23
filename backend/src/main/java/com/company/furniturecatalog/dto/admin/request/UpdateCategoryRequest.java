package com.company.furniturecatalog.dto.admin.request;

import com.company.furniturecatalog.domain.enums.ContentStatus;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.util.UUID;

/**
 * Update payload. Null fields are ignored; non-null fields overwrite.
 */
public record UpdateCategoryRequest(
        UUID parentId,

        @Size(max = 160)
        String name,

        @Size(max = 160)
        @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$")
        String slug,

        @Size(max = 10000)
        String description,

        String coverImageKey,

        @PositiveOrZero
        Integer sortOrder,

        ContentStatus status,

        @Size(max = 180) String metaTitle,
        @Size(max = 320) String metaDescription
) {}
