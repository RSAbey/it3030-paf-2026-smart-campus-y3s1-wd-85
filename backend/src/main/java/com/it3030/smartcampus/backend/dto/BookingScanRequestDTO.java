package com.it3030.smartcampus.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BookingScanRequestDTO {
    @NotBlank
    private String qrCode;
}
