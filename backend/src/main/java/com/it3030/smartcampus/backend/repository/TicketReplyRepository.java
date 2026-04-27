package com.it3030.smartcampus.backend.repository;

import com.it3030.smartcampus.backend.entity.TicketReply;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketReplyRepository extends JpaRepository<TicketReply, Long> {

    List<TicketReply> findByTicketIdOrderByCreatedAtAsc(Long ticketId);
}
