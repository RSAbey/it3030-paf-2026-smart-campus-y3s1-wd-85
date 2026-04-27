package com.it3030.smartcampus.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.it3030.smartcampus.backend.dto.ResourceResponseDTO;
import com.it3030.smartcampus.backend.entity.Resource;
import com.it3030.smartcampus.backend.repository.ResourceRepository;

@Service
public class ResourceService {
    private final ResourceRepository repository;

    public ResourceService(ResourceRepository repository) {
        this.repository = repository;
    }

    public List<ResourceResponseDTO> getAllResources() {
        return repository.findAll()
            .stream()
            .map(this::mapToDto)
            .toList();
    }

    public ResourceResponseDTO createResource(Resource resource) {
        return mapToDto(repository.save(resource));
    }

    private ResourceResponseDTO mapToDto(Resource resource) {
        return new ResourceResponseDTO(
            resource.getId(),
            resource.getName(),
            resource.getType(),
            resource.getCapacity(),
            resource.getLocation(),
            resource.getStatus()
        );
    }
}
