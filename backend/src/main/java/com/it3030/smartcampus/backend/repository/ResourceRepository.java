package com.it3030.smartcampus.backend.repository;

import java.util.*;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.it3030.smartcampus.backend.entity.Resource;

public interface ResourceRepository extends JpaRepository<Resource, Long> {
    @Query("SELECT r.type as name, COUNT(r) as value FROM Resource r GROUP BY r.type")
    List<Map<String, Object>> getResourceDistribution();

}
