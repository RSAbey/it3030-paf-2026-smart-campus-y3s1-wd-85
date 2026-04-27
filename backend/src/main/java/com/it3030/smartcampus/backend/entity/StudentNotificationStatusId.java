package com.it3030.smartcampus.backend.entity;

import java.io.Serializable;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentNotificationStatusId implements Serializable {

    private Long studentId;
    private Long notificationId;
}
