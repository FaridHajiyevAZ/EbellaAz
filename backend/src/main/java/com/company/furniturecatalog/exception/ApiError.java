package com.company.furniturecatalog.exception;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.OffsetDateTime;
import java.util.List;

/**
 * Wire-format error envelope returned by the global exception handler.
 * Keep it stable; frontend code depends on this shape.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiError(
        OffsetDateTime timestamp,
        int status,
        String error,
        String message,
        String path,
        String traceId,
        List<FieldViolation> fieldErrors
) {
    public record FieldViolation(String field, String code, String message) {}
}
