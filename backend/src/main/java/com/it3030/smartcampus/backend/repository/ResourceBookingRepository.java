package com.it3030.smartcampus.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.it3030.smartcampus.backend.entity.Booking;

public interface ResourceBookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByResourceIdAndDate(Long resourceId, String date);
}
