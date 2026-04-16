package com.it3030.smartcampus.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.it3030.smartcampus.backend.model.Resource;
import com.it3030.smartcampus.backend.service.ResourceService;

@RestController
@RequestMapping("/api/resources")
@CrossOrigin
public class ResourceController {
    private final ResourceService service;

    public ResourceController(ResourceService service) {
        this.service = service;
    }

    @GetMapping
    public List<Resource> getAllResources() {
        return service.getAllResources();
    }

    @PostMapping
    public Resource createResource(@RequestBody Resource resource) {
        return service.createResource(resource);
    }
}
