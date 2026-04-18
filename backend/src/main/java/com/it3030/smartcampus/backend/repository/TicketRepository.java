package com.it3030.smartcampus.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.it3030.smartcampus.backend.entity.Ticket;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    // public long count();

}
