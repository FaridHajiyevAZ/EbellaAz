package com.company.furniturecatalog.exception;

public class NotFoundException extends RuntimeException {

    public NotFoundException(String message) {
        super(message);
    }

    public static NotFoundException of(String entity, Object id) {
        return new NotFoundException("%s not found: %s".formatted(entity, id));
    }
}
