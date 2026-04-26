package com.it3030.smartcampus.backend.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.it3030.smartcampus.backend.entity.Booking;
import com.it3030.smartcampus.backend.service.BookingService;

@RestController
@RequestMapping("/api/booking")
@CrossOrigin
public class BookingController {
    private static final Logger logger = LoggerFactory.getLogger(BookingController.class);
    private final BookingService service;

    public BookingController(BookingService service) {
        this.service = service;
    }

    @GetMapping
    public List<Booking> getAllBookings() {
        return service.getAllBookings();
    }

    @GetMapping("/user/{userId}")
    public List<Booking> getUserBookings(@PathVariable Long userId) {
        return service.getBookingsByUser(userId);
    }

    @PostMapping
    public ResponseEntity<Booking> createBooking(@RequestBody Booking booking) {
        return ResponseEntity.ok(service.createBooking(booking));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Booking> updateBooking(@PathVariable Long id, @RequestBody Booking booking) {
        return ResponseEntity.ok(service.updateBooking(id, booking));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Booking> cancelBooking(@PathVariable Long id) {
        logger.info("Received cancel booking request for id={}", id);
        return ResponseEntity.ok(service.cancelBooking(id));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<Booking> approveBooking(@PathVariable Long id) {
        logger.info("Received approve booking request for id={}", id);
        return ResponseEntity.ok(service.approveBooking(id));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<Booking> rejectBooking(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        logger.info("Received reject booking request for id={}", id);
        String reason = body != null ? body.get("reason") : null;
        return ResponseEntity.ok(service.rejectBooking(id, reason));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteBooking(@PathVariable Long id) {
        service.deleteBooking(id);
        return ResponseEntity.ok("Deleted successfully");
    }

    @PostMapping("/check")
    public Map<String, Boolean> checkConflict(@RequestBody Booking booking) {
        List<Booking> conflicts = service.checkConflicts(booking);

        Map<String, Boolean> response = new HashMap<>();
        response.put("conflict", !conflicts.isEmpty());

        return response;
    }
}
