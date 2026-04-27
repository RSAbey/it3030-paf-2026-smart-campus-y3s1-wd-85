package com.it3030.smartcampus.backend.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.it3030.smartcampus.backend.dto.BookingRequestDTO;
import com.it3030.smartcampus.backend.dto.BookingResponseDTO;
import com.it3030.smartcampus.backend.entity.Booking;
import com.it3030.smartcampus.backend.entity.Resource;
import com.it3030.smartcampus.backend.entity.User;
import com.it3030.smartcampus.backend.repository.BookingRepository;
import com.it3030.smartcampus.backend.repository.ResourceRepository;
import com.it3030.smartcampus.backend.repository.UserRepository;
import com.it3030.smartcampus.backend.security.CampusUserPrincipal;

@Service
public class BookingService {
    private static final Logger logger = LoggerFactory.getLogger(BookingService.class);
    private static final String STATUS_PENDING = "PENDING";
    private static final String STATUS_APPROVED = "APPROVED";
    private static final String STATUS_REJECTED = "REJECTED";
    private static final String STATUS_CANCELLED = "CANCELLED";
    private static final String STATUS_USED = "USED";
    private static final String ROLE_ADMIN = "ADMIN";
    private static final String NOT_FOUND_MESSAGE = "Booking not found";
    private static final String PENDING_ONLY_MESSAGE = "Only pending bookings can be modified";

    private final BookingRepository bookingRepo;
    private final ResourceRepository resourceRepo;
    private final UserRepository userRepo;

    public BookingService(
        BookingRepository bookingRepo,
        ResourceRepository resourceRepo,
        UserRepository userRepo
    ) {
        this.bookingRepo = bookingRepo;
        this.resourceRepo = resourceRepo;
        this.userRepo = userRepo;
    }

    public BookingResponseDTO createBooking(BookingRequestDTO request, CampusUserPrincipal principal) {
        List<Booking> conflicts = bookingRepo.findConflicts(
            request.getResourceId(),
            request.getDate(),
            request.getStartTime(),
            request.getEndTime()
        );

        if (!conflicts.isEmpty()) {
            throw new RuntimeException("Time slot already booked!");
        }

        Booking booking = new Booking();
        booking.setUserId(principal.getId());
        booking.setResourceId(request.getResourceId());
        booking.setDate(request.getDate());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setReason(request.getReason());
        booking.setStatus(STATUS_PENDING);
        booking.setQrCode(null);
        booking.setIsUsed(false);

        return mapToDTO(bookingRepo.save(booking));
    }

    public List<BookingResponseDTO> getAllBookingResponses() {
        return bookingRepo.findAll()
            .stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    public List<BookingResponseDTO> getBookingResponsesByUser(CampusUserPrincipal principal) {
        return bookingRepo.findByUserId(principal.getId())
            .stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    public BookingResponseDTO cancelBooking(Long id, CampusUserPrincipal principal) {
        logger.info("Cancel booking requested for id={}", id);
        Booking booking = getOwnedPendingBookingOrThrow(id, principal);

        booking.setStatus(STATUS_CANCELLED);
        booking.setQrCode(null);
        booking.setIsUsed(false);

        return mapToDTO(bookingRepo.save(booking));
    }

    public BookingResponseDTO updateBooking(Long id, BookingRequestDTO updatedBooking, CampusUserPrincipal principal) {
        logger.info("Update booking requested for id={}", id);
        Booking booking = getOwnedPendingBookingOrThrow(id, principal);
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

        return mapToDTO(bookingRepo.save(booking));
    }

    public BookingResponseDTO approveBooking(Long id) {
        logger.info("Approve booking requested for id={}", id);
        Booking booking = getBookingOrThrow(id);

        if (!STATUS_PENDING.equals(normalizeStatus(booking.getStatus()))) {
            throw new RuntimeException("Only pending bookings can be approved");
        }

        String qr = String.format(
            "BOOKING:%d:USER:%d:%s",
            booking.getId(),
            booking.getUserId(),
            UUID.randomUUID()
        );

        booking.setStatus(STATUS_APPROVED);
        booking.setReason(booking.getReason());
        booking.setQrCode(qr);
        booking.setIsUsed(false);

        return mapToDTO(bookingRepo.save(booking));
    }

    public BookingResponseDTO rejectBooking(Long id, String reason) {
        logger.info("Reject booking requested for id={}", id);
        Booking booking = getBookingOrThrow(id);

        if (!STATUS_PENDING.equals(normalizeStatus(booking.getStatus()))) {
            throw new RuntimeException("Only pending bookings can be rejected");
        }

        booking.setStatus(STATUS_REJECTED);
        booking.setReason(reason);
        booking.setQrCode(null);
        booking.setIsUsed(false);

        return mapToDTO(bookingRepo.save(booking));
    }

    public BookingResponseDTO getBookingByQrCode(String qrCode) {
        logger.info("QR booking lookup requested for qrCode={}", qrCode);
        return mapToDTO(findBookingByQrCode(qrCode));
    }

    public BookingResponseDTO scanBooking(String qrCode) {
        Booking booking = findBookingByQrCode(qrCode);

        if (!STATUS_APPROVED.equals(normalizeStatus(booking.getStatus()))) {
            throw new RuntimeException("Booking not approved");
        }

        if (Boolean.TRUE.equals(booking.getIsUsed())) {
            throw new RuntimeException("QR already used");
        }

        booking.setIsUsed(true);
        booking.setStatus(STATUS_USED);
        return mapToDTO(bookingRepo.save(booking));
    }

    public Map<String, Boolean> checkConflict(BookingRequestDTO booking) {
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

    private Booking findBookingByQrCode(String qrCode) {
        return bookingRepo.findByQrCode(qrCode)
            .orElseThrow(() -> new RuntimeException("Invalid QR Code"));
    }

    private Booking getBookingOrThrow(Long id) {
        return bookingRepo.findById(id)
            .orElseThrow(() -> new RuntimeException(NOT_FOUND_MESSAGE));
    }

    private Booking getOwnedPendingBookingOrThrow(Long id, CampusUserPrincipal principal) {
        Booking booking = getBookingOrThrow(id);

        if (!ROLE_ADMIN.equals(principal.getRole()) && !principal.getId().equals(booking.getUserId())) {
            throw new RuntimeException("You are not allowed to modify this booking");
        }

        if (!STATUS_PENDING.equals(normalizeStatus(booking.getStatus()))) {
            throw new RuntimeException(PENDING_ONLY_MESSAGE);
        }

        return booking;
    }

    private String normalizeStatus(String status) {
        return status == null ? "" : status.trim().toUpperCase();
    }
}
