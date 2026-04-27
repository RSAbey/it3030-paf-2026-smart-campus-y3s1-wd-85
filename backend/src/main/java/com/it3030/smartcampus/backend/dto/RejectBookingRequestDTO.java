package com.it3030.smartcampus.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RejectBookingRequestDTO {
    @NotBlank
    private String reason;
}
