package com.company.furniturecatalog.dto.common;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.util.List;
import java.util.UUID;

/**
 * Generic reorder payload: the client sends the full ordered list of ids
 * with their new {@code sortOrder}. Used for categories, variations, images, slides, sections.
 */
public record ReorderRequest(
        @NotEmpty @Valid List<Item> items
) {
    public record Item(
            @NotNull UUID id,
            @PositiveOrZero int sortOrder
    ) {}
}
