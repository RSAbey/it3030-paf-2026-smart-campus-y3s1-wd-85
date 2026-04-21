package com.it3030.smartcampus.backend.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.it3030.smartcampus.backend.entity.Booking;
import com.it3030.smartcampus.backend.service.BookingService;


@RestController
@RequestMapping("/api/booking")
@CrossOrigin

public class BookingController {
    private final BookingService service;

    public BookingController(BookingService service) {
        this.service = service;
    }

    @GetMapping
    public List<Booking> getAllBookings() {
        return service.getAllBookings();
    }

    // @PostMapping
    // public Booking createBooking(@RequestBody Booking booking) {
    //     return service.createBooking(booking);
    // }

    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody Booking booking) {

        try {
            Booking saved = service.createBooking(booking);
            return ResponseEntity.ok(saved);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/check")
    public Map<String, Boolean> checkConflict(@RequestBody Booking booking) {

        List<Booking> conflicts = service.checkConflicts(booking);

        Map<String, Boolean> response = new HashMap<>();
        response.put("conflict", !conflicts.isEmpty());

        return response;
    }

}
