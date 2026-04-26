package com.it3030.smartcampus.backend.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.it3030.smartcampus.backend.entity.Booking;
import com.it3030.smartcampus.backend.repository.BookingRepository;

@Service
public class BookingService {
    private static final Logger logger = LoggerFactory.getLogger(BookingService.class);
    private static final String STATUS_PENDING = "PENDING";
    private static final String STATUS_APPROVED = "APPROVED";
    private static final String STATUS_REJECTED = "REJECTED";
    private static final String STATUS_CANCELLED = "CANCELLED";
    private static final String NOT_FOUND_MESSAGE = "Booking not found";
    private static final String PENDING_ONLY_MESSAGE = "Only pending bookings can be modified";

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

        booking.setStatus(STATUS_PENDING);
        booking.setReason(null);
        return bookingRepo.save(booking);
    }

    public List<Booking> getAllBookings() {
        return bookingRepo.findAll();
    }

    public List<Booking> getBookingsByUser(Long userId) {
        return bookingRepo.findByUserId(userId);
    }

    public Booking cancelBooking(Long id) {
        logger.info("Cancel booking requested for id={}", id);
        Booking booking = getPendingBookingOrThrow(id);

        booking.setStatus(STATUS_CANCELLED);
        booking.setReason(null);

        Booking savedBooking = bookingRepo.save(booking);
        logger.info("Booking cancelled successfully for id={}", id);
        return savedBooking;
    }

    public Booking updateBooking(Long id, Booking updatedBooking) {
        logger.info("Update booking requested for id={}", id);
        Booking booking = getPendingBookingOrThrow(id);
        Long targetResourceId = updatedBooking.getResourceId() != null
            ? updatedBooking.getResourceId()
            : booking.getResourceId();

        List<Booking> conflicts = bookingRepo.findConflicts(
            targetResourceId,
            updatedBooking.getDate(),
            updatedBooking.getStartTime(),
            updatedBooking.getEndTime()
        );

        boolean hasConflictWithAnotherBooking = conflicts.stream()
            .anyMatch(conflict -> !conflict.getId().equals(id));

        if (hasConflictWithAnotherBooking) {
            throw new RuntimeException("Time slot already booked!");
        }

        booking.setResourceId(targetResourceId);
        booking.setDate(updatedBooking.getDate());
        booking.setStartTime(updatedBooking.getStartTime());
        booking.setEndTime(updatedBooking.getEndTime());

        return bookingRepo.save(booking);
    }

    public Booking approveBooking(Long id) {
        logger.info("Approve booking requested for id={}", id);
        Booking booking = getPendingBookingOrThrow(id);

        booking.setStatus(STATUS_APPROVED);
        booking.setReason(null);

        return bookingRepo.save(booking);
    }

    public Booking rejectBooking(Long id, String reason) {
        logger.info("Reject booking requested for id={}", id);
        Booking booking = getPendingBookingOrThrow(id);

        booking.setStatus(STATUS_REJECTED);
        booking.setReason(reason);

        return bookingRepo.save(booking);
    }

    public void deleteBooking(Long id) {
        if (!bookingRepo.existsById(id)) {
            throw new RuntimeException(NOT_FOUND_MESSAGE);
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

    private Booking getBookingOrThrow(Long id) {
        return bookingRepo.findById(id)
            .orElseThrow(() -> {
                logger.warn("Booking not found for id={}", id);
                return new RuntimeException(NOT_FOUND_MESSAGE);
            });
    }

    private Booking getPendingBookingOrThrow(Long id) {
        Booking booking = getBookingOrThrow(id);
        logger.info("Current booking status for id={} is {}", id, booking.getStatus());

        if (!STATUS_PENDING.equals(booking.getStatus())) {
            logger.warn("Booking id={} cannot be modified because status is {}", id, booking.getStatus());
            throw new RuntimeException(PENDING_ONLY_MESSAGE);
        }

        return booking;
    }
}
