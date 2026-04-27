package com.it3030.smartcampus.backend.repository;

import java.util.*;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.it3030.smartcampus.backend.entity.Resource;
import com.it3030.smartcampus.backend.entity.ResourceStatus;

public interface ResourceRepository extends JpaRepository<Resource, Long> {
    @Query("SELECT r.type as name, COUNT(r) as value FROM Resource r GROUP BY r.type")
    List<Map<String, Object>> getResourceDistribution();

    @Query("""
            SELECT r FROM Resource r
            WHERE (:type IS NULL OR LOWER(r.type) = LOWER(:type))
              AND (:location IS NULL OR LOWER(r.location) LIKE LOWER(CONCAT('%', :location, '%')))
              AND (:status IS NULL OR r.status = :status)
              AND (:minCapacity IS NULL OR r.capacity >= :minCapacity)
              AND (:keyword IS NULL OR LOWER(r.name) LIKE LOWER(CONCAT('%', :keyword, '%')))
            ORDER BY r.id DESC
            """)
    List<Resource> searchResources(
            @Param("type") String type,
            @Param("location") String location,
            @Param("status") ResourceStatus status,
            @Param("minCapacity") Integer minCapacity,
            @Param("keyword") String keyword);
}
