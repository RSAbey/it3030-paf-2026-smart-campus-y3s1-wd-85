package com.it3030.smartcampus.backend.controller;

import java.io.ByteArrayOutputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
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

import com.it3030.smartcampus.backend.dto.BookingResponseDTO;
import com.it3030.smartcampus.backend.entity.Booking;
import com.it3030.smartcampus.backend.service.BookingService;

@RestController
@RequestMapping({"/api/booking", "/api/bookings"})
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

    @GetMapping("/my-bookings/{userId}")
    public List<BookingResponseDTO> getMyBookings(@PathVariable Long userId) {
        return service.getBookingResponsesByUser(userId);
    }

    @GetMapping("/verify/{qrCode}")
    public ResponseEntity<?> verifyQR(@PathVariable String qrCode) {
        try {
            Booking booking = service.verifyBookingByQrCode(qrCode);
            return ResponseEntity.ok(booking);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/qr/{qrCode}")
    public ResponseEntity<?> getBookingByQR(@PathVariable String qrCode) {
        try {
            Booking booking = service.getBookingByQrCode(qrCode);
            return ResponseEntity.ok(booking);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/qr/code/{qrCode}")
    public ResponseEntity<?> getBookingByQRCode(@PathVariable String qrCode) {
        try {
            Booking booking = service.getBookingByQrCode(qrCode);
            return ResponseEntity.ok(booking);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/qr/{id:[0-9]+}")
    public ResponseEntity<byte[]> getQrImage(@PathVariable Long id) throws Exception {
        Booking booking = service.getBookingById(id);

        if (booking.getQrCode() == null || booking.getQrCode().isBlank()) {
            throw new RuntimeException("QR not generated for this booking");
        }

        QRCodeWriter writer = new QRCodeWriter();
        BitMatrix matrix = writer.encode(booking.getQrCode(), BarcodeFormat.QR_CODE, 300, 300);

        ByteArrayOutputStream stream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(matrix, "PNG", stream);

        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_TYPE, "image/png")
            .body(stream.toByteArray());
    }

    @PutMapping("/qr/validate/{qrCode}")
    public ResponseEntity<?> validateQR(@PathVariable String qrCode) {
        try {
            Booking booking = service.validateQrCode(qrCode);
            return ResponseEntity.ok(booking);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
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
    public ResponseEntity<?> approveBooking(@PathVariable Long id) {
        logger.info("Received approve booking request for id={}", id);
        try {
            Booking booking = service.approveBooking(id);
            return ResponseEntity.ok(booking);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectBooking(@PathVariable Long id, @RequestBody Map<String, String> body) {
        logger.info("Received reject booking request for id={}", id);
        try {
            String reason = body.get("reason");
            Booking booking = service.rejectBooking(id, reason);
            return ResponseEntity.ok(booking);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
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
