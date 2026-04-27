package com.it3030.smartcampus.backend.exception;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;

public class InvalidResourceException extends RuntimeException {

    private final Map<String, String> fieldErrors;

    public InvalidResourceException(Map<String, String> fieldErrors) {
        super("Resource validation failed");
        this.fieldErrors = Collections.unmodifiableMap(new LinkedHashMap<>(fieldErrors));
    }

    public InvalidResourceException(String field, String message) {
        super("Resource validation failed");
        Map<String, String> errors = new LinkedHashMap<>();
        errors.put(field, message);
        this.fieldErrors = Collections.unmodifiableMap(errors);
    }

    public Map<String, String> getFieldErrors() {
        return fieldErrors;
    }
}
