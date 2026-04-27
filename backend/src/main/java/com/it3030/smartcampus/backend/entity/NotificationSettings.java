package com.it3030.smartcampus.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "notification_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationSettings {

    @Id
    private Long studentId;

    private Boolean enabled;

    @Column(columnDefinition = "TEXT")
    private String categories;

    private Boolean highPriorityAlerts;
}
