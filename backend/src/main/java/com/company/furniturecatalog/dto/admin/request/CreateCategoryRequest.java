package com.company.furniturecatalog.dto.admin.request;

import com.company.furniturecatalog.domain.enums.ContentStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CreateCategoryRequest(
        UUID parentId,

        @NotBlank
        @Size(max = 160)
        String name,

        @NotBlank
        @Size(max = 160)
        @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$", message = "slug must be lowercase, digits, and hyphens")
        String slug,

        @Size(max = 10000)
        String description,

        String coverImageKey,

        @PositiveOrZero
        Integer sortOrder,

        ContentStatus status,

        @Size(max = 180)
        String metaTitle,

        @Size(max = 320)
        String metaDescription
) {}
