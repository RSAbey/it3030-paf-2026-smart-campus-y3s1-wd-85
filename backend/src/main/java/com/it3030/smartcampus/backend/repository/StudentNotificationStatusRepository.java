package com.it3030.smartcampus.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.it3030.smartcampus.backend.entity.StudentNotificationStatus;
import com.it3030.smartcampus.backend.entity.StudentNotificationStatusId;

public interface StudentNotificationStatusRepository extends JpaRepository<StudentNotificationStatus, StudentNotificationStatusId> {

    List<StudentNotificationStatus> findByIdStudentId(Long studentId);
}
