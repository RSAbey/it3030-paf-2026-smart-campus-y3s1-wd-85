package com.it3030.smartcampus.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.it3030.smartcampus.backend.entity.Notification;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findAllByOrderByCreatedAtDesc();

    @Query("""
            SELECT n
            FROM Notification n
            WHERE LOWER(n.status) = 'published'
              AND (
                LOWER(n.visibility) = 'public'
                OR (
                  LOWER(n.visibility) = 'private'
                  AND (
                    n.targetUserId = :studentId
                    OR LOWER(n.targetRole) = 'student'
                  )
                )
              )
            ORDER BY n.createdAt DESC
            """)
    List<Notification> findVisiblePublishedForStudent(@Param("studentId") Long studentId);
}
