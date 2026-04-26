package com.it3030.smartcampus.backend.repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.it3030.smartcampus.backend.entity.Booking;
public interface BookingRepository extends JpaRepository<Booking, Long> {

    // public List<Map<String, Object>> getWeeklyBookings();

    // public long count();

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
}
