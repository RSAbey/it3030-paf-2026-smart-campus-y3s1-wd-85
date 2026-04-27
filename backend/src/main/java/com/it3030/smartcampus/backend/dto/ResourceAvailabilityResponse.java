package com.it3030.smartcampus.backend.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResourceAvailabilityResponse {

    private Long resourceId;
    private String resourceName;
    private String date;
    private List<AvailabilitySlotResponse> slots;
}
