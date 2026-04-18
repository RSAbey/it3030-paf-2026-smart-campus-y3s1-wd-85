package com.it3030.smartcampus.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.it3030.smartcampus.backend.entity.Resource;

public interface ResourceRepository extends JpaRepository<Resource, Long> {

}
