package com.it3030.smartcampus.backend.dto;

import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.http.HttpStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApiErrorResponse {

    private String timestamp;
    private int status;
    private String error;
    private String message;
    private Map<String, String> fieldErrors;

    public static ApiErrorResponse of(HttpStatus status, String message) {
        return of(status, message, null);
    }

    public static ApiErrorResponse of(HttpStatus status, String message, Map<String, String> fieldErrors) {
        return new ApiErrorResponse(
                LocalDateTime.now().toString(),
                status.value(),
                status.getReasonPhrase(),
                message,
                fieldErrors);
    }
}
