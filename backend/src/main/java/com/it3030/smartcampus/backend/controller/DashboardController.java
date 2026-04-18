package com.it3030.smartcampus.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.it3030.smartcampus.backend.dto.DashboardStats;
import com.it3030.smartcampus.backend.service.DashboardService;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin

public class DashboardController {

    private final DashboardService service;

    public DashboardController(DashboardService service) {
        this.service = service;
    }

    @GetMapping("/stats")
    public DashboardStats getStats() {
        return service.getStats();
    }

    @GetMapping("/weekly-bookings")
        public List<Map<String, Object>> weeklyBookings() {
            return service.getWeeklyBookings();
    }

    @GetMapping("/resource-distribution")
        public List<Map<String, Object>> resourceDistribution() {
            return service.getResourceDistribution();
    }
}
