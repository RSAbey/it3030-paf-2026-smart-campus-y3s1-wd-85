package com.it3030.smartcampus.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.it3030.smartcampus.backend.dto.BookingRequestDTO;
import com.it3030.smartcampus.backend.dto.BookingResponseDTO;
import com.it3030.smartcampus.backend.dto.BookingScanRequestDTO;
import com.it3030.smartcampus.backend.dto.RejectBookingRequestDTO;
import com.it3030.smartcampus.backend.security.CampusUserPrincipal;
import com.it3030.smartcampus.backend.service.BookingService;

import jakarta.validation.Valid;

@Validated
@RestController
@RequestMapping("/api/booking")
public class BookingController {
    private final BookingService service;

    public BookingController(BookingService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<BookingResponseDTO> getAllBookings() {
        return service.getAllBookingResponses();
    }

    @GetMapping("/my-bookings")
    public List<BookingResponseDTO> getMyBookings(
        @AuthenticationPrincipal CampusUserPrincipal principal
    ) {
        return service.getBookingResponsesByUser(principal);
    }

    @GetMapping("/qr/{qrCode}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingResponseDTO> getBookingByQR(@PathVariable String qrCode) {
        return ResponseEntity.ok(service.getBookingByQrCode(qrCode));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('STUDENT','ADMIN')")
    public ResponseEntity<BookingResponseDTO> createBooking(
        @Valid @RequestBody BookingRequestDTO booking,
        @AuthenticationPrincipal CampusUserPrincipal principal
    ) {
        return ResponseEntity.ok(service.createBooking(booking, principal));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('STUDENT','ADMIN')")
    public ResponseEntity<BookingResponseDTO> updateBooking(
        @PathVariable Long id,
        @Valid @RequestBody BookingRequestDTO booking,
        @AuthenticationPrincipal CampusUserPrincipal principal
    ) {
        return ResponseEntity.ok(service.updateBooking(id, booking, principal));
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('STUDENT','ADMIN')")
    public ResponseEntity<BookingResponseDTO> cancelBooking(
        @PathVariable Long id,
        @AuthenticationPrincipal CampusUserPrincipal principal
    ) {
        return ResponseEntity.ok(service.cancelBooking(id, principal));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingResponseDTO> approveBooking(@PathVariable Long id) {
        return ResponseEntity.ok(service.approveBooking(id));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingResponseDTO> rejectBooking(
        @PathVariable Long id,
        @Valid @RequestBody RejectBookingRequestDTO body
    ) {
        return ResponseEntity.ok(service.rejectBooking(id, body.getReason()));
    }

    @PostMapping("/scan")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingResponseDTO> scanBooking(
        @Valid @RequestBody BookingScanRequestDTO request
    ) {
        return ResponseEntity.ok(service.scanBooking(request.getQrCode()));
    }

    @PostMapping("/check")
    @PreAuthorize("hasAnyRole('STUDENT','ADMIN')")
    public Map<String, Boolean> checkConflict(@Valid @RequestBody BookingRequestDTO booking) {
        return service.checkConflict(booking);
    }
}
