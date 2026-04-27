package com.it3030.smartcampus.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResourceRequest {

    private String name;
    private String type;
    private Integer capacity;
    private String location;
    private String status;
}
