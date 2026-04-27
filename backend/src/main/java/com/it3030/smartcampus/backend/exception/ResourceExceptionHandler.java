package com.it3030.smartcampus.backend.exception;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import com.it3030.smartcampus.backend.controller.ResourceController;
import com.it3030.smartcampus.backend.dto.ApiErrorResponse;

@RestControllerAdvice(assignableTypes = ResourceController.class)
public class ResourceExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleResourceNotFound(ResourceNotFoundException ex) {
        return build(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(InvalidResourceException.class)
    public ResponseEntity<ApiErrorResponse> handleInvalidResource(InvalidResourceException ex) {
        return new ResponseEntity<>(
                ApiErrorResponse.of(HttpStatus.BAD_REQUEST, ex.getMessage(), ex.getFieldErrors()),
                HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ResourceInUseException.class)
    public ResponseEntity<ApiErrorResponse> handleResourceInUse(ResourceInUseException ex) {
        return build(HttpStatus.CONFLICT, ex.getMessage());
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiErrorResponse> handleMissingParameter(MissingServletRequestParameterException ex) {
        return new ResponseEntity<>(
                ApiErrorResponse.of(
                        HttpStatus.BAD_REQUEST,
                        "Required request parameter is missing.",
                        Map.of(ex.getParameterName(), "This parameter is required.")),
                HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiErrorResponse> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        return new ResponseEntity<>(
                ApiErrorResponse.of(
                        HttpStatus.BAD_REQUEST,
                        "Invalid request value.",
                        Map.of(ex.getName(), "Value has the wrong format.")),
                HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiErrorResponse> handleUnreadableMessage(HttpMessageNotReadableException ex) {
        return build(HttpStatus.BAD_REQUEST, "Request body is missing or contains invalid JSON.");
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleUnexpectedError(Exception ex) {
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected error while processing resource request.");
    }

    private ResponseEntity<ApiErrorResponse> build(HttpStatus status, String message) {
        return new ResponseEntity<>(ApiErrorResponse.of(status, message), status);
    }
}
