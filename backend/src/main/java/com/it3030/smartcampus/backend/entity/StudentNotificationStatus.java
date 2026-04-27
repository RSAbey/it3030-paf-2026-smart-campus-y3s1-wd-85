package com.it3030.smartcampus.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "student_notification_status")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentNotificationStatus {

    @EmbeddedId
    private StudentNotificationStatusId id;

    private Boolean isRead;
    private LocalDateTime readAt;
}
