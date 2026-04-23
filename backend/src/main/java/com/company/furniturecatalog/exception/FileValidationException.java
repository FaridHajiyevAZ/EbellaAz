package com.company.furniturecatalog.exception;

/**
 * Thrown when an uploaded file fails size / type / extension checks.
 * Handled as 400 Bad Request by {@link GlobalExceptionHandler}.
 */
public class FileValidationException extends RuntimeException {

    public FileValidationException(String message) {
        super(message);
    }
}
