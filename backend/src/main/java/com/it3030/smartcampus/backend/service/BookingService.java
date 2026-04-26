package com.it3030.smartcampus.backend.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.it3030.smartcampus.backend.entity.Booking;
import com.it3030.smartcampus.backend.repository.BookingRepository;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepo;

    public Booking createBooking(Booking booking) {
        List<Booking> conflicts = bookingRepo.findConflicts(
            booking.getResourceId(),
            booking.getDate(),
            booking.getStartTime(),
            booking.getEndTime()
        );

        if (!conflicts.isEmpty()) {
            throw new RuntimeException("Time slot already booked!");
        }

        booking.setStatus("PENDING");
        return bookingRepo.save(booking);
    }

    public List<Booking> getAllBookings() {
        return bookingRepo.findAll();
    }

    public List<Booking> getBookingsByUser(Long userId) {
        return bookingRepo.findByUserId(userId);
    }

    public Booking cancelBooking(Long id) {
        Booking booking = bookingRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!"PENDING".equals(booking.getStatus())) {
            throw new RuntimeException("Only pending bookings can be cancelled");
        }

        booking.setStatus("CANCELLED");
        return bookingRepo.save(booking);
    }

    public Booking updateBooking(Long id, Booking updatedBooking) {
        Booking booking = bookingRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!"PENDING".equals(booking.getStatus())) {
            throw new RuntimeException("Only pending bookings can be edited");
        }

        List<Booking> conflicts = bookingRepo.findConflicts(
            booking.getResourceId(),
            updatedBooking.getDate(),
            updatedBooking.getStartTime(),
            updatedBooking.getEndTime()
        );

        if (!conflicts.isEmpty()) {
            throw new RuntimeException("Time slot already booked!");
        }

        booking.setDate(updatedBooking.getDate());
        booking.setStartTime(updatedBooking.getStartTime());
        booking.setEndTime(updatedBooking.getEndTime());

        return bookingRepo.save(booking);
    }

    public void deleteBooking(Long id) {
        if (!bookingRepo.existsById(id)) {
            throw new RuntimeException("Booking not found");
        }

        bookingRepo.deleteById(id);
    }

    @PostMapping("/check")
    public Map<String, Boolean> checkConflict(@RequestBody Booking booking) {
        List<Booking> conflicts = bookingRepo.findConflicts(
            booking.getResourceId(),
            booking.getDate(),
            booking.getStartTime(),
            booking.getEndTime()
        );

        Map<String, Boolean> response = new HashMap<>();
        response.put("conflict", !conflicts.isEmpty());

        return response;
    }

    public List<Booking> checkConflicts(Booking booking) {
        return bookingRepo.findConflicts(
            booking.getResourceId(),
            booking.getDate(),
            booking.getStartTime(),
            booking.getEndTime()
        );
    }
}
