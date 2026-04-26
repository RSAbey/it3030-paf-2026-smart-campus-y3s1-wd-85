package com.it3030.smartcampus.backend.repository;

import com.it3030.smartcampus.backend.entity.Ticket;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    long countByPriority(String priority);

    long countByStatus(String status);

    long countByUserId(Long userId);

    List<Ticket> findByPriority(String priority);

    List<Ticket> findByStatus(String status);

    List<Ticket> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String title, String description);

    List<Ticket> findTop10ByOrderByIdDesc();

    List<Ticket> findTop5ByUserIdOrderByIdDesc(Long userId);
}
