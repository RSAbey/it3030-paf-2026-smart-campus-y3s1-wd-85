package com.it3030.smartcampus.backend.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;

import com.it3030.smartcampus.backend.entity.Booking;
import com.it3030.smartcampus.backend.repository.BookingRepository;
import com.it3030.smartcampus.backend.repository.ResourceRepository;

@Service
public class BookingService {

    private final BookingRepository repository;
    private final ResourceRepository resourceRepository;

    public BookingService(BookingRepository repository, ResourceRepository resourceRepository) {
        this.repository = repository;
        this.resourceRepository = resourceRepository;
    }

    public Booking createBooking(Booking booking) {
        validateBooking(booking);

        if (hasConflict(
                booking.getResourceId(),
                booking.getDate(),
                booking.getStartTime(),
                booking.getEndTime()
        )) {
            throw new IllegalStateException("This resource is already booked for the selected date and time.");
        }

        if (isBlank(booking.getStatus())) {
            booking.setStatus("PENDING");
        }

        return repository.save(booking);
    }

    public List<Booking> getAllBookings() {
        return repository.findAllByOrderByIdDesc();
    }

    public List<Booking> getBookingsByUserId(Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID is required.");
        }

        return repository.findByUserIdOrderByIdDesc(userId);
    }

    public boolean hasConflict(Long resourceId, String date, String startTime, String endTime) {
        validateConflictRequest(resourceId, date, startTime, endTime);
        return repository.countOverlappingBookings(resourceId, date, startTime, endTime) > 0;
    }

    public Booking cancelBooking(Long id) {
        Booking booking = repository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Booking not found."));

        booking.setStatus("CANCELLED");
        return repository.save(booking);
    }

    private void validateBooking(Booking booking) {
        if (booking == null) {
            throw new IllegalArgumentException("Booking details are required.");
        }

        if (booking.getUserId() == null) {
            throw new IllegalArgumentException("User ID is required.");
        }

        validateConflictRequest(
                booking.getResourceId(),
                booking.getDate(),
                booking.getStartTime(),
                booking.getEndTime()
        );
    }

    private void validateConflictRequest(Long resourceId, String date, String startTime, String endTime) {
        if (resourceId == null) {
            throw new IllegalArgumentException("Resource is required.");
        }

        if (!resourceRepository.existsById(resourceId)) {
            throw new IllegalArgumentException("Selected resource does not exist.");
        }

        if (isBlank(date)) {
            throw new IllegalArgumentException("Date is required.");
        }

        if (isBlank(startTime) || isBlank(endTime)) {
            throw new IllegalArgumentException("Start time and end time are required.");
        }

        validateDateAndTimeRange(date, startTime, endTime);
    }

    private void validateDateAndTimeRange(String date, String startTime, String endTime) {
        try {
            LocalDate.parse(date);
            LocalTime start = LocalTime.parse(startTime);
            LocalTime end = LocalTime.parse(endTime);

            if (!start.isBefore(end)) {
                throw new IllegalArgumentException("End time must be after start time.");
            }
        } catch (DateTimeParseException ex) {
            throw new IllegalArgumentException("Use yyyy-MM-dd date and HH:mm time format.");
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

}
