package com.it3030.smartcampus.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ResourceResponseDTO {
    private Long id;
    private String name;
    private String type;
    private int capacity;
    private String location;
    private String status;
}
