package com.it3030.smartcampus.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.it3030.smartcampus.backend.model.Resource;
import com.it3030.smartcampus.backend.repository.ResourceRepository;

@Service
public class ResourceService {
      private final ResourceRepository repository;

    public ResourceService(ResourceRepository repository) {
        this.repository = repository;
    }

    public List<Resource> getAllResources() {
        return repository.findAll();
    }

    public Resource createResource(Resource resource) {
        return repository.save(resource);
    }
}
