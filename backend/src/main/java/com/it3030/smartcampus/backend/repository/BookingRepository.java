package com.it3030.smartcampus.backend.repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.it3030.smartcampus.backend.entity.Booking;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    @Query("SELECT b.date as day, COUNT(b) as total FROM Booking b GROUP BY b.date")
    List<Map<String, Object>> getWeeklyBookings();

    long countByUserId(Long userId);

    long countByUserIdAndStatus(Long userId, String status);

    List<Booking> findByUserId(Long userId);

    Optional<Booking> findByQrCode(String qrCode);

    List<Booking> findTop5ByUserIdOrderByIdDesc(Long userId);

    @Query("""
        SELECT b FROM Booking b
        WHERE b.resourceId = :resourceId
        AND b.date = :date
        AND b.status = 'APPROVED'
        AND (
            b.startTime < :endTime AND b.endTime > :startTime
        )
    """)
    List<Booking> findConflicts(
        Long resourceId,
        String date,
        String startTime,
        String endTime
    );
    List<Booking> findAllByOrderByIdDesc();

    List<Booking> findByUserIdOrderByIdDesc(Long userId);

    @Query("""
            SELECT COUNT(b)
            FROM Booking b
            WHERE b.resourceId = :resourceId
              AND b.date = :date
              AND (b.status IS NULL OR b.status NOT IN ('CANCELLED', 'REJECTED'))
              AND b.startTime < :endTime
              AND b.endTime > :startTime
            """)
    long countOverlappingBookings(
            @Param("resourceId") Long resourceId,
            @Param("date") String date,
            @Param("startTime") String startTime,
            @Param("endTime") String endTime
    );

}
