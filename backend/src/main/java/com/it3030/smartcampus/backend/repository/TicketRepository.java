package com.it3030.smartcampus.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.it3030.smartcampus.backend.entity.Ticket;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    long countByUserId(Long userId);

    List<Ticket> findTop5ByUserIdOrderByIdDesc(Long userId);
}
