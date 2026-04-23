package com.company.furniturecatalog.dto.common;

import org.springframework.data.domain.Page;

import java.util.List;

/**
 * Lightweight page envelope decoupled from Spring Data's internal shape.
 * Keeps the wire format stable when the backend changes Pageable plumbing.
 */
public record PageResponse<T>(
        List<T> items,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean hasNext,
        boolean hasPrevious
) {
    public static <T> PageResponse<T> of(Page<T> page) {
        return new PageResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.hasNext(),
                page.hasPrevious()
        );
    }

    public static <S, T> PageResponse<T> of(Page<S> page, List<T> mapped) {
        return new PageResponse<>(
                mapped,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.hasNext(),
                page.hasPrevious()
        );
    }
}
