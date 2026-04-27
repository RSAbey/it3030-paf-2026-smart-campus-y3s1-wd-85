package com.it3030.smartcampus.backend.exception;

public class ResourceInUseException extends RuntimeException {

    public ResourceInUseException(Long id) {
        super("Resource " + id + " cannot be deleted because it is linked to existing bookings.");
    }
}
