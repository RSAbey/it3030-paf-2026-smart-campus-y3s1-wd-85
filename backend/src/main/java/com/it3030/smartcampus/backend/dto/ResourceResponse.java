package com.it3030.smartcampus.backend.dto;

import com.it3030.smartcampus.backend.entity.Resource;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResourceResponse {

    private Long id;
    private String name;
    private String type;
    private int capacity;
    private String location;
    private String status;

    public static ResourceResponse fromEntity(Resource resource) {
        return new ResourceResponse(
                resource.getId(),
                resource.getName(),
                resource.getType(),
                resource.getCapacity(),
                resource.getLocation(),
                resource.getStatus() == null ? null : resource.getStatus().name());
    }
}
