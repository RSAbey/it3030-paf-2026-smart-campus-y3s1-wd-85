package com.it3030.smartcampus.backend.dto;

import lombok.Data;

@Data
public class BookingResponseDTO {
    private Long id;
    private Long userId;
    private Long resourceId;
    private String userName;
    private String resourceName;
    private String location;
    private String date;
    private String startTime;
    private String endTime;
    private String reason;
    private String status;
    private String qrCode;
    private Boolean isUsed;
}
