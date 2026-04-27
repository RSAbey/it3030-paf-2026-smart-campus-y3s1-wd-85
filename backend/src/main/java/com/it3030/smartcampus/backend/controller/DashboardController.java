package com.it3030.smartcampus.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.it3030.smartcampus.backend.dto.DashboardStats;
import com.it3030.smartcampus.backend.security.CampusUserPrincipal;
import com.it3030.smartcampus.backend.service.DashboardService;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    private final DashboardService service;

    public DashboardController(DashboardService service) {
        this.service = service;
    }

    @GetMapping("/student")
    @PreAuthorize("hasAnyRole('STUDENT','ADMIN')")
    public Map<String, Object> getStudentStats(@AuthenticationPrincipal CampusUserPrincipal principal) {
        return service.getStudentStats(principal.getId());
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public DashboardStats getStats() {
        return service.getStats();
    }

    @GetMapping("/weekly-bookings")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Map<String, Object>> weeklyBookings() {
        return service.getWeeklyBookings();
    }

    @GetMapping("/resource-distribution")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Map<String, Object>> resourceDistribution() {
        return service.getResourceDistribution();
    }
}
