package com.it3030.smartcampus.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.it3030.smartcampus.backend.dto.ResourceAvailabilityResponse;
import com.it3030.smartcampus.backend.dto.ResourceRequest;
import com.it3030.smartcampus.backend.dto.ResourceResponse;
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
    public ResponseEntity<List<ResourceResponse>> getAllResources(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String name) {

        String searchText = keyword != null ? keyword : name;
        return ResponseEntity.ok(service.getAllResources(type, location, status, minCapacity, searchText));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResourceResponse> getResourceById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getResourceById(id));
    }

    @PostMapping
    public ResponseEntity<ResourceResponse> createResource(@RequestBody ResourceRequest request) {
        ResourceResponse createdResource = service.createResource(request);
        return ResponseEntity
                .created(ServletUriComponentsBuilder
                        .fromCurrentRequest()
                        .path("/{id}")
                        .buildAndExpand(createdResource.getId())
                        .toUri())
                .body(createdResource);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResourceResponse> updateResource(
            @PathVariable Long id,
            @RequestBody ResourceRequest request) {

        return ResponseEntity.ok(service.updateResource(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable Long id) {
        service.deleteResource(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/availability")
    public ResponseEntity<ResourceAvailabilityResponse> getResourceAvailability(
            @PathVariable Long id,
            @RequestParam String date) {

        return new ResponseEntity<>(service.getResourceAvailability(id, date), HttpStatus.OK);
    }
}
