package com.it3030.smartcampus.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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

}
