package com.it3030.smartcampus.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "tickets")
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(length = 1000)
    private String description;

    private String category;

    private String priority;

    private String status;

    private String location;

    private String preferredContact;

    private String assignedTechnician;

    @Column(length = 1000)
    private String resolutionNotes;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}