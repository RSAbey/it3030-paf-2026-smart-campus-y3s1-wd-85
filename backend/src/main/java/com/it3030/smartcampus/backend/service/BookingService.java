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

        // 🔥 1. Check conflicts
        List<Booking> conflicts = bookingRepo.findConflicts(
                booking.getResourceId(),
                booking.getDate(),
                booking.getStartTime(),
                booking.getEndTime()
        );

        if (!conflicts.isEmpty()) {
            throw new RuntimeException("❌ Time slot already booked!");
        }

        // 🔥 2. Save booking
        booking.setStatus("APPROVED"); // or PENDING
        return bookingRepo.save(booking);
    }

    // public Booking createBooking(Booking booking) {
    //     throw new UnsupportedOperationException("Not supported yet.");
    // }

    public List<Booking> getAllBookings() {
        return bookingRepo.findAll();
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
