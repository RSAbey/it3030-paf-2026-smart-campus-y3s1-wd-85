package com.it3030.smartcampus.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private Long resourceId;

    private String date;
    private String startTime;
    private String endTime;

    // PENDING, APPROVED, REJECTED, CANCELLED
    private String status;

    // Optional rejection/cancellation/admin note
    private String reason;

    private String qrCode;
}
