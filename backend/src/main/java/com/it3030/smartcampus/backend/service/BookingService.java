package com.it3030.smartcampus.backend.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.NoSuchElementException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.it3030.smartcampus.backend.dto.BookingResponseDTO;
import com.it3030.smartcampus.backend.entity.Booking;
import com.it3030.smartcampus.backend.entity.Resource;
import com.it3030.smartcampus.backend.entity.User;
import com.it3030.smartcampus.backend.repository.BookingRepository;
import com.it3030.smartcampus.backend.repository.ResourceRepository;
import com.it3030.smartcampus.backend.repository.UserRepository;

@Service
public class BookingService {
    private static final Logger logger = LoggerFactory.getLogger(BookingService.class);
    private static final String STATUS_PENDING = "PENDING";
    private static final String STATUS_APPROVED = "APPROVED";
    private static final String STATUS_REJECTED = "REJECTED";
    private static final String STATUS_CANCELLED = "CANCELLED";
    private static final String STATUS_USED = "USED";
    private static final String NOT_FOUND_MESSAGE = "Booking not found";
    private static final String PENDING_ONLY_MESSAGE = "Only pending bookings can be modified";

    @Autowired
    private BookingRepository bookingRepo;

    @Autowired
    private ResourceRepository resourceRepo;

    @Autowired
    private UserRepository userRepo;

    private final BookingRepository repository;
    private final ResourceRepository resourceRepository;

    public BookingService(BookingRepository repository, ResourceRepository resourceRepository) {
        this.repository = repository;
        this.resourceRepository = resourceRepository;
    }

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

        // Always force newly created bookings into the admin approval flow.
        booking.setStatus(STATUS_PENDING);
        booking.setQrCode(null);
        booking.setIsUsed(false);
        return bookingRepo.save(booking);
    }

    public List<Booking> getAllBookings() {
        return bookingRepo.findAll();
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

    public Booking getBookingById(Long id) {
        return getBookingOrThrow(id);
    }

    public List<Booking> getBookingsByUser(Long userId) {
        return bookingRepo.findByUserId(userId);
    }

    public List<BookingResponseDTO> getBookingResponsesByUser(Long userId) {
        return bookingRepo.findByUserId(userId)
            .stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    public Booking cancelBooking(Long id) {
        logger.info("Cancel booking requested for id={}", id);
        Booking booking = getPendingBookingOrThrow(id);

        booking.setStatus(STATUS_CANCELLED);
        booking.setReason(null);
        booking.setQrCode(null);
        booking.setIsUsed(false);

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
        booking.setReason(updatedBooking.getReason());

        return bookingRepo.save(booking);
    }

    public Booking approveBooking(Long id) {
        logger.info("Approve booking requested for id={}", id);
        Booking booking = getBookingOrThrow(id);

        if (!STATUS_PENDING.equals(normalizeStatus(booking.getStatus()))) {
            logger.warn("Booking id={} cannot be approved because status is {}", id, booking.getStatus());
            throw new RuntimeException("Only pending bookings can be approved");
        }

        booking.setStatus(STATUS_APPROVED);
        booking.setReason(null);
        booking.setQrCode("BOOKING_ID:" + booking.getId());
        booking.setIsUsed(false);

        return bookingRepo.save(booking);
    }

    public Booking rejectBooking(Long id, String reason) {
        logger.info("Reject booking requested for id={}", id);
        Booking booking = getBookingOrThrow(id);

        if (!STATUS_PENDING.equals(normalizeStatus(booking.getStatus()))) {
            logger.warn("Booking id={} cannot be rejected because status is {}", id, booking.getStatus());
            throw new RuntimeException("Only pending bookings can be rejected");
        }

        booking.setStatus(STATUS_REJECTED);
        booking.setReason(reason);
        booking.setQrCode(null);
        booking.setIsUsed(false);

        return bookingRepo.save(booking);
    }

    public Booking getBookingByQrCode(String qrCode) {
        logger.info("QR booking lookup requested for qrCode={}", qrCode);

        return bookingRepo.findByQrCode(qrCode)
            .orElseThrow(() -> new RuntimeException("Invalid QR Code"));
    }

    public Booking verifyBookingByQrCode(String qrCode) {
        Booking booking = getBookingByQrCode(qrCode);

        if (!STATUS_APPROVED.equals(normalizeStatus(booking.getStatus()))) {
            throw new RuntimeException("Booking not approved");
        }

        if (Boolean.TRUE.equals(booking.getIsUsed())) {
            throw new RuntimeException("QR already used");
        }

        return booking;
    }

    public Booking validateQrCode(String qrCode) {
        Booking booking = getBookingByQrCode(qrCode);

        if (Boolean.TRUE.equals(booking.getIsUsed())) {
            throw new RuntimeException("QR already used");
        }

        if (!STATUS_APPROVED.equals(normalizeStatus(booking.getStatus()))) {
            throw new RuntimeException("Booking not approved");
        }

        booking.setIsUsed(true);
        booking.setStatus(STATUS_USED);
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

    public BookingResponseDTO mapToDTO(Booking booking) {
        BookingResponseDTO dto = new BookingResponseDTO();
        Optional<User> user = userRepo.findById(booking.getUserId());
        Optional<Resource> resource = resourceRepo.findById(booking.getResourceId());

        dto.setId(booking.getId());
        dto.setUserId(booking.getUserId());
        dto.setResourceId(booking.getResourceId());
        dto.setUserName(
            user.map(User::getName)
                .filter(name -> name != null && !name.isBlank())
                .orElse("User #" + booking.getUserId())
        );
        dto.setResourceName(
            resource.map(Resource::getName)
                .filter(name -> name != null && !name.isBlank())
                .orElse("Resource #" + booking.getResourceId())
        );
        dto.setLocation(resource.map(Resource::getLocation).orElse("Location not available"));
        dto.setDate(booking.getDate());
        dto.setStartTime(booking.getStartTime());
        dto.setEndTime(booking.getEndTime());
        dto.setReason(booking.getReason());
        dto.setStatus(booking.getStatus());
        dto.setQrCode(booking.getQrCode());
        dto.setIsUsed(booking.getIsUsed());

        return dto;
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

        if (!STATUS_PENDING.equals(normalizeStatus(booking.getStatus()))) {
            logger.warn("Booking id={} cannot be modified because status is {}", id, booking.getStatus());
            throw new RuntimeException(PENDING_ONLY_MESSAGE);
        }

        return booking;
    }

    private String normalizeStatus(String status) {
        return status == null ? "" : status.trim().toUpperCase();
    }
}
