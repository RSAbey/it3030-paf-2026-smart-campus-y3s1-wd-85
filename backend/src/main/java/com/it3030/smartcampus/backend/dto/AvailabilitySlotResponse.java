package com.it3030.smartcampus.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AvailabilitySlotResponse {

    private String startTime;
    private String endTime;
    private String status;
    private Long bookingId;
}
